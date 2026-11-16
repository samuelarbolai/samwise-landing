import AppKit
import SamwiseCore

/// Runs the app: once a second it asks the alarm rules what should be on screen and makes it so.
@MainActor
final class AppController: NSObject, TakeoverActions, NSMenuDelegate {
    let options: Options
    let store: Store
    let clock = Clock()
    let sound = SoundEngine()
    let takeover = TakeoverPresenter()
    let pill = PillPresenter()
    let api: API
    private(set) lazy var windows = Windows(app: self)

    private var statusItem: NSStatusItem?
    private var menuProxies: [ActionProxy] = []
    private var timer: Timer?
    private var activity: NSObjectProtocol?
    private var awakeToken: NSObjectProtocol?
    private var awakeLevel = 0

    private(set) var config: RemoteConfig?
    private(set) var desired: Desired = .idle
    private var occurrences: [String: Occurrence] = [:]
    private var ringStartedAt: Date?
    private var chimed = Set<String>()
    private var transient: (text: String, until: Date)?
    private var nextPollAt = Date.distantPast
    private var fetching = false
    private var posting = false
    private var lastPostAt = Date.distantPast
    var connectionProblem: String?
    private var allowQuit = false
    private var previousApp: NSRunningApplication?
    private var lastTimesKey = ""
    private var pillText = ""
    private var pillButtons = ""
    /// The check-in whose warning ("Samwise has not counted it") is at the top of the screen now.
    private var warningID: String?
    /// Warnings the user closed with OK, one per check-in and alert time. Kept only while the app runs:
    /// a warning is about the next half hour.
    private var alertDismissed = Set<String>()
    private var hookResult = ""

    init(options: Options, store: Store) {
        self.options = options
        self.store = store
        self.api = API(base: options.apiBase)
        super.init()
    }

    // MARK: Who and when

    var paired: Bool { store.token != nil }
    var settings: AlarmSettings { store.data.settings }

    var copy: Copy {
        if paired, let language = config?.user?.language { return Copy(language: language) }
        return Copy(language: Locale.preferredLanguages.first)
    }

    /// The schedule comes from the Samwise account when one is connected, otherwise from Settings.
    private var usesAccount: Bool { paired && config != nil }

    var timeZone: TimeZone {
        if usesAccount, let tz = config?.timeZone { return tz }
        return TimeZone.current
    }

    var times: [CheckinTime] {
        if usesAccount { return config?.checkinTimes ?? [] }
        return settings.localCheckinTimes
    }

    /// " (Bogota)" when the schedule's clock is not this Mac's clock.
    var zoneLabel: String {
        let tz = timeZone
        let now = clock.now
        if tz.secondsFromGMT(for: now) == TimeZone.current.secondsFromGMT(for: now) { return "" }
        let city = tz.identifier.split(separator: "/").last.map { $0.replacingOccurrences(of: "_", with: " ") } ?? tz.identifier
        return " (\(city))"
    }

    var isPaused: Bool { store.data.pausedUntil.map { clock.now < $0 } ?? false }

    /// The user's journal: the tab for that check-in when Samwise knows it, otherwise the journal itself.
    private func journalURL(for id: String? = nil) -> URL? {
        guard paired, let cfg = config else { return nil }
        var text = cfg.journalUrl
        if let id = id, let time = occurrences[id]?.time,
           let own = cfg.checkins?.first(where: { CheckinTime($0.time) == time })?.journalUrl {
            text = own
        }
        guard let t = text, let url = URL(string: t), url.scheme == "https" else { return nil }
        return url
    }

    private func timesKey() -> String {
        "\(usesAccount ? "account" : "local")|\(timeZone.identifier)|\(times.map { $0.description }.joined(separator: ","))"
    }

    /// The schedule changed: check-ins from before this moment are left alone.
    private func noteScheduleChange() {
        let key = timesKey()
        if key != lastTimesKey {
            lastTimesKey = key
            store.data.activeSince = clock.now
            store.touch()
            Log.write("schedule: \(key)")
        }
    }

    private func dayAndTime(_ date: Date) -> String {
        let tz = timeZone
        let cal = ScheduleMath.calendar(tz)
        let now = clock.now
        let c = copy
        let clockText = ScheduleMath.clock(date, timeZone: tz) + zoneLabel
        if cal.isDate(date, inSameDayAs: now) { return c.today + " " + clockText }
        if let tomorrow = cal.date(byAdding: .day, value: 1, to: now), cal.isDate(date, inSameDayAs: tomorrow) {
            return c.tomorrow + " " + clockText
        }
        let f = DateFormatter()
        f.timeZone = tz
        f.locale = Locale(identifier: c.es ? "es" : "en")
        f.setLocalizedDateFormatFromTemplate("EEE d MMM")
        return f.string(from: date) + " " + clockText
    }

    func nextCheckinLine() -> String {
        let c = copy
        let now = clock.now
        if let until = store.data.pausedUntil, now < until { return c.pausedUntil(dayAndTime(until)) }
        guard let next = ScheduleMath.next(after: now, times: times, timeZone: timeZone, finished: finishedCheckins) else { return c.noCheckins }
        return c.nextCheckin(dayAndTime(next.fireAt))
    }

    /// Check-ins that Samwise already counts, or that were skipped or missed. They will not ring,
    /// so none of them is "the next check-in", even while its own time is still ahead.
    private var finishedCheckins: Set<String> {
        Set(store.data.states.filter { $0.value.phase.isFinal }.keys)
    }

    // MARK: Start

    func start() {
        sound.muted = options.mute
        takeover.actions = self
        takeover.allowCapture = options.allowCapture
        windows.allowCapture = options.allowCapture
        if let fake = options.fakeNow { clock.offset = fake.timeIntervalSince(Date()) }
        config = store.cachedConfig()
        lastTimesKey = timesKey()
        if store.data.activeSince == nil {
            store.data.activeSince = clock.now
            store.touch()
        }
        if options.noWelcome && !store.data.welcomed {
            store.data.welcomed = true
            store.touch()
        }
        for e in Engine.noteRelaunch(now: clock.now, states: &store.data.states) { record(e) }
        store.touch()

        buildStatusItem()
        observe()
        if !options.launchd && !options.noAgent && store.data.welcomed && settings.keepRunning && Agent.isStableLocation {
            // launchd starts the kept-alive copy, which then asks this one to step aside (yieldRequested).
            Agent.install()
        }
        activity = ProcessInfo.processInfo.beginActivity(options: [.userInitiatedAllowingIdleSystemSleep], reason: "Check-in alarm clock")

        let t = Timer(timeInterval: 1, target: self, selector: #selector(timerFired), userInfo: nil, repeats: true)
        t.tolerance = 0.1
        RunLoop.main.add(t, forMode: .common)
        timer = t

        Log.write("start: \(paired ? "connected" : "not connected"), \(nextCheckinLine())")
        if !store.data.welcomed { windows.showWelcome() }
        if options.testNow { startTest() }
        tick()
        store.save()
    }

    private func observe() {
        let ws = NSWorkspace.shared.notificationCenter
        ws.addObserver(self, selector: #selector(woke), name: NSWorkspace.didWakeNotification, object: nil)
        ws.addObserver(self, selector: #selector(woke), name: NSWorkspace.screensDidWakeNotification, object: nil)
        ws.addObserver(self, selector: #selector(poweringOff), name: NSWorkspace.willPowerOffNotification, object: nil)
        let nc = NotificationCenter.default
        nc.addObserver(self, selector: #selector(woke), name: NSNotification.Name.NSSystemClockDidChange, object: nil)
        nc.addObserver(self, selector: #selector(woke), name: NSApplication.didChangeScreenParametersNotification, object: nil)
        let dn = DistributedNotificationCenter.default()
        dn.addObserver(self, selector: #selector(showRequested), name: Agent.showName, object: nil, suspensionBehavior: .deliverImmediately)
        dn.addObserver(self, selector: #selector(yieldRequested), name: Agent.yieldName, object: nil, suspensionBehavior: .deliverImmediately)
    }

    @objc private func timerFired() { tick() }

    @objc private func woke() {
        nextPollAt = .distantPast
        tick()
    }

    @objc private func poweringOff() { allowQuit = true }

    @objc private func showRequested() {
        guard !store.frozen else { return }
        showMainWindow()
    }

    /// The kept-alive copy started: this copy saves and steps aside.
    @objc private func yieldRequested() {
        guard !options.launchd, !options.noAgent, !store.frozen else { return }
        Log.write("stepping aside for the kept-alive copy")
        store.save()
        store.frozen = true
        timer?.invalidate()
        let reopen = windows.anyVisible
        takeover.hide()
        pill.hide()
        sound.stopLoop()
        Task { @MainActor in
            try? await Task.sleep(nanoseconds: 1_500_000_000)
            if reopen { Agent.post(Agent.showName) }
            self.allowQuit = true
            NSApp.terminate(nil)
        }
    }

    func showMainWindow() {
        if store.data.welcomed { windows.showSettings() } else { windows.showWelcome() }
    }

    var canQuit: Bool { allowQuit || !takeover.isUp }
    private var ticks = 0
    private var lastOpened = ""

    /// Opens a link (journal, phone call, WhatsApp, download page). The end-to-end test only records it.
    private func openLink(_ url: URL) {
        lastOpened = url.absoluteString
        if !options.testHooks { NSWorkspace.shared.open(url) }
    }

    // MARK: The loop

    func tick() {
        guard !store.frozen else { return }
        if options.testHooks { readCommands() }
        ticks += 1
        if options.launchd && ticks % 5 == 0 && !Agent.otherInstances().isEmpty {
            // Only one copy may run the alarm. A plain copy that is still around is asked again to step aside.
            Agent.post(Agent.yieldName)
        }
        let now = clock.now
        let s = settings
        noteScheduleChange()

        // The alarm works from the first launch, even while the welcome window is still open.
        // Check-ins from before the app was first opened (or before the schedule changed) never fire late.
        let window = TimeInterval(max(600, s.lateWindowSeconds))
        let since = store.data.activeSince ?? now
        let list = ScheduleMath.occurrences(times: times, timeZone: timeZone, from: now.addingTimeInterval(-window - 3600), to: now.addingTimeInterval(26 * 3600))
            .filter { $0.fireAt >= since || store.data.states[$0.id] != nil }
        occurrences = [:]
        for o in list { occurrences[o.id] = o }

        var remote: [String: RemoteSlot] = [:]
        if usesAccount {
            for slot in config?.slots ?? [] { remote[slot.id] = slot }
        }

        if let until = store.data.pausedUntil, now >= until {
            store.data.pausedUntil = nil
            store.touch()
        }
        let before = store.data.states
        let result = Engine.step(now: now, occurrences: list, states: &store.data.states, settings: s, remote: remote, pausedUntil: store.data.pausedUntil)
        for e in result.events { handle(e, now: now) }
        desired = result.desired
        reconcile(now: now)
        stayAwake(now: now)
        if store.data.states != before {
            Engine.prune(now: now, states: &store.data.states)
            store.touch()
        }
        store.saveIfNeeded()
        network()
        if options.testHooks { writeStatus(now) }
    }

    private func record(_ e: EngineEvent) {
        let detail = e.detail.map { "\($0.key)=\($0.value)" }.sorted().joined(separator: " ")
        Log.write("event: \(e.kind) \(e.occurrence) \(detail)")
        queue(e.kind, occurrence: e.occurrence, detail: e.detail)
    }

    private func handle(_ e: EngineEvent, now: Date) {
        record(e)
        switch e.kind {
        case "fired", "snooze_over", "came_back", "call_missed_seen", "resound":
            SoundEngine.wakeDisplay()
            ringStartedAt = nil
            nextPollAt = .distantPast
        case "asked_finished":
            sound.chime(volume: 0.7)
        case "alert_ahead_seen":
            // Samwise has not counted this check-in and is going to tell the trusted people.
            // On the alarm screen the screen itself says it. Otherwise the warning goes at the top of the
            // screen (reconcile), and this makes sure it is noticed.
            if e.detail["on"] != "screen" {
                SoundEngine.wakeDisplay()
                if settings.sound != "off" { sound.chime(volume: 1) }
            }
            nextPollAt = .distantPast
        case "done":
            if e.detail["visible"] == "1" { celebrate() }
        default:
            break
        }
    }

    private func reconcile(now: Date) {
        let c = copy
        let wasUp = takeover.isUp
        switch desired {
        case .idle:
            dropTakeover()
            if let t = transient, Date() < t.until {
                showPill(t.text)
            } else if let id = endedButNotCounted(now: now), let slot = alertSlot(id, now: now) {
                transient = nil
                showAlertAhead(id, slot: slot, ended: true)
            } else {
                transient = nil
                hidePill()
            }
        case .headsUp(let id, let seconds):
            dropTakeover()
            showPill(c.headsUp(seconds))
            if chimed.insert("heads:" + id).inserted { sound.chime() }
        case .takeover(let id, let kind):
            hidePill()
            transient = nil
            if !wasUp {
                let front = NSWorkspace.shared.frontmostApplication
                if front?.processIdentifier != ProcessInfo.processInfo.processIdentifier { previousApp = front }
                windows.closeAfter()
            }
            fill(id: id, kind: kind, now: now)
            takeover.show()
            if !wasUp && kind != .test {
                // What Samwise checks every day: the alarm was really put on screen, and on how many displays.
                queue("shown", occurrence: id, detail: ["screens": String(takeover.screenCount), "kind": kind.rawValue])
            }
            // The hint depends on who has the keyboard, which is only known once the alarm is on screen.
            let hint = takeoverHint()
            if hint != takeover.model.hint {
                takeover.model.hint = hint
                takeover.refresh()
            }
            ring(id: id, kind: kind)
        case .snoozed(_, let left):
            dropTakeover()
            showPill(c.snoozedPill(left))
        case .inProgress(let id, let ask):
            dropTakeover()
            if let slot = alertSlot(id, now: now) {
                // More urgent than "did you finish?": Samwise has not counted it and says when it tells the trusted people.
                showAlertAhead(id, slot: slot, ended: false)
            } else if ask {
                showPill(c.didYouFinish, emphasis: true, actions: [
                    (title: c.yesDone, style: .primary, run: { [weak self] in self?.finish(id) }),
                    (title: c.notYet, style: .secondary, run: { [weak self] in self?.notYet(id) }),
                ])
            } else {
                showPill(c.inProgress, actions: [
                    (title: c.finishedShort, style: .secondary, run: { [weak self] in self?.finish(id) }),
                ])
            }
        }
        statusItem?.button?.toolTip = "Samwise. " + nextCheckinLine()
    }

    private func showPill(_ text: String, emphasis: Bool = false, actions: [(title: String, style: PillButton.Style, run: () -> Void)] = []) {
        pillText = text
        pillButtons = actions.map { $0.title }.joined(separator: "|")
        warningID = nil
        pill.show(text: text, emphasis: emphasis, actions: actions)
    }

    private func hidePill() {
        pillText = ""
        pillButtons = ""
        warningID = nil
        pill.hide()
    }

    // MARK: Samwise has not counted the check-in

    /// How Samwise sees this check-in, while it is still going to tell the trusted people about it.
    private func alertSlot(_ id: String, now: Date) -> RemoteSlot? {
        guard usesAccount, let slot = config?.slot(id), slot.alertAhead(now) else { return nil }
        return slot
    }

    /// A check-in the user ended here by their own word that Samwise has not counted and will tell the trusted people about.
    private func endedButNotCounted(now: Date) -> String? {
        guard usesAccount else { return nil }
        var found: String?
        for (id, s) in store.data.states where !s.isTest && s.phase == .done {
            guard s.finishSource == "self" || s.finishSource == "unconfirmed" else { continue }
            guard let slot = alertSlot(id, now: now), !alertDismissed.contains(warningKey(id, slot)) else { continue }
            if found == nil || id > (found ?? "") { found = id }
        }
        return found
    }

    /// The warning at the top of the screen: what Samwise decided, when it tells the trusted people, and the way to stop that.
    /// It never takes the screen and it can be closed: the user is in charge.
    private func showAlertAhead(_ id: String, slot: RemoteSlot, ended: Bool) {
        let c = copy
        let deadline = slot.tellDate.map { ScheduleMath.clock($0, timeZone: timeZone) } ?? ""
        var actions: [(title: String, style: PillButton.Style, run: () -> Void)] = []
        if let number = config?.samwiseNumber, samwiseDigits() != nil {
            actions.append((title: c.callSamwise(number), style: .primary, run: { [weak self] in self?.callFromWarning(id) }))
        }
        if ended {
            actions.append((title: c.gotIt, style: .secondary, run: { [weak self] in self?.dismissWarning(id) }))
        } else {
            actions.append((title: c.finishedShort, style: .secondary, run: { [weak self] in self?.finish(id) }))
        }
        showPill(c.alertAhead(deadline: deadline, missed: slot.callMissed), emphasis: true, actions: actions)
        warningID = id
    }

    private func callFromWarning(_ id: String) {
        guard let digits = samwiseDigits(), let url = URL(string: "tel:+\(digits)") else { return }
        queue("alert_call", occurrence: id)
        openLink(url)
        nextPollAt = .distantPast
    }

    private func warningKey(_ id: String, _ slot: RemoteSlot) -> String { id + "|" + (slot.tellAt ?? "") }

    private func dismissWarning(_ id: String) {
        if let slot = config?.slot(id) { alertDismissed.insert(warningKey(id, slot)) }
        queue("alert_closed", occurrence: id)
        tick()
    }

    private func dropTakeover() {
        sound.stopLoop()
        ringStartedAt = nil
        guard takeover.isUp else { return }
        takeover.hide()
        takeover.model.typed = ""
        takeover.model.showWords = false
        takeover.model.id = ""
        // Give the keyboard back to whatever was in front before the alarm.
        if !windows.anyVisible { _ = previousApp?.activate(options: []) }
        previousApp = nil
    }

    // MARK: What the alarm says

    private func fill(id: String, kind: TakeoverKind, now: Date) {
        let m = takeover.model
        let c = copy
        let state = store.data.states[id]
        let fireAt = state?.fireAt ?? now
        let tz = timeZone
        let time = ScheduleMath.clock(fireAt, timeZone: tz)
        let slot = usesAccount ? config?.slot(id) : nil
        // Samwise's phone call is only mentioned when the server said it is coming or has been placed.
        let callExpected = (slot?.willCall ?? false) || (slot?.callPlaced ?? false)
        let number = usesAccount ? config?.samwiseNumber : nil
        let supportActive = usesAccount && (config?.support?.active ?? false) && callExpected
        let grace = config?.support?.graceMinutes ?? 30
        let deadlineDate = fireAt.addingTimeInterval(TimeInterval(grace) * 60)
        var deadline = supportActive && now < deadlineDate ? ScheduleMath.clock(deadlineDate, timeZone: tz) : nil
        var toldAt: String?
        if kind == .missedCall, let slot = slot, slot.alertAhead(now), let t = slot.tellDate {
            // Once the call's result is in, Samwise's own time for telling the trusted people replaces the rule of thumb.
            deadline = ScheduleMath.clock(t, timeZone: tz)
        }
        if kind == .unfinished {
            // For a call that did not count, Samwise itself says when it tells the trusted people, and when it did.
            deadline = nil
            if let slot = slot {
                if slot.alertAhead(now), let t = slot.tellDate { deadline = ScheduleMath.clock(t, timeZone: tz) }
                if let t = slot.toldDate { toldAt = ScheduleMath.clock(t, timeZone: tz) }
            }
        }
        let secondsTo = Int(fireAt.timeIntervalSince(now).rounded(.up))
        let minutesLate = max(0, Int(now.timeIntervalSince(fireAt) / 60))

        var words: [RemoteWords] = []
        if usesAccount, let cfg = config {
            if let t = occurrences[id]?.time {
                words = cfg.words(for: t)
            } else if kind == .test, let first = cfg.checkinTimes.first {
                words = cfg.words(for: first)
            }
        }

        if m.id != id {
            m.typed = ""
            m.wrongAt = nil
            m.showWords = !words.isEmpty && (settings.showWordsRightAway || config?.showWordsRightAway == true)
        }
        m.id = id
        m.kind = kind
        m.eyebrow = c.eyebrow(name: usesAccount ? config?.user?.firstName : nil, time: time, test: kind == .test)
        m.title = c.title(kind, time: time, secondsToCheckin: secondsTo)
        m.subtitle = c.subtitle(
            kind, time: time, minutesLate: minutesLate, willCall: callExpected,
            number: callExpected ? number : nil, deadline: deadline,
            startedAt: state?.committedAt.map { ScheduleMath.clock($0, timeZone: tz) },
            toldAt: toldAt
        )
        let day = ScheduleMath.calendar(tz).ordinality(of: .day, in: .year, for: now) ?? 0
        m.line = c.line(day: day)
        m.words = words
        m.wordsTitle = c.yourWords
        m.wordsHint = words.isEmpty ? "" : (m.showWords ? c.hideWords : c.showWords)
        m.prompt = c.typeToGetScreenBack
        m.commitPhrase = c.commitPhrase
        if kind == .test {
            m.skipPrompt = ""
            m.skipPhrase = ""
            m.skipNote = ""
        } else {
            m.skipPrompt = c.typeToSkip
            m.skipPhrase = c.skipPhrase
            m.skipNote = c.skipConsequence(supportActive: supportActive)
        }

        if kind == .test || settings.maxSnoozes == 0 {
            m.snoozeTitle = nil
            m.snoozeNote = ""
        } else if Engine.canSnooze(id, states: store.data.states, settings: settings) {
            let left = settings.maxSnoozes - (state?.snoozesUsed ?? 0)
            m.snoozeTitle = c.snooze(minutes: settings.snoozeMinutes, left: left)
            m.snoozeEnabled = true
            m.snoozeNote = (kind == .countdown || kind == .ringing) ? c.snoozeConsequence(willCall: callExpected, number: number) : ""
        } else {
            m.snoozeTitle = c.noSnoozesLeft
            m.snoozeEnabled = false
            m.snoozeNote = ""
        }

        let canCall = callExpected && number != nil && (kind == .late || kind == .missedCall || kind == .onCall || kind == .unfinished)
        m.callTitle = canCall ? number.map { c.callSamwise($0) } : nil
        m.whatsAppTitle = canCall && kind == .missedCall ? c.openWhatsApp : nil
        switch kind {
        case .followUp: m.finishTitle = c.iFinished
        // The screen came back to ask "did you finish?" and the call did not count: the answer can still be given.
        case .unfinished: m.finishTitle = (state?.cameBack ?? false) ? c.iFinished : nil
        case .test: m.finishTitle = c.endTest
        default: m.finishTitle = nil
        }
        m.hint = takeoverHint()
        m.why = c.why
    }

    private func takeoverHint() -> String {
        let c = copy
        let m = takeover.model
        if let wrong = m.wrongAt, Date().timeIntervalSince(wrong) < 3 { return c.wrongLetter }
        if takeover.isUp && !takeover.hasKeyboard { return c.clickToType }
        if sound.isLooping {
            let slot = usesAccount ? config?.slot(m.id) : nil
            return c.soundHint(call: (slot?.willCall ?? false) || (slot?.callPlaced ?? false))
        }
        return ""
    }

    private func ring(id: String, kind: TakeoverKind) {
        guard let state = store.data.states[id] else { return }
        let mode = settings.sound
        if kind == .countdown {
            sound.stopLoop()
            ringStartedAt = nil
            if chimed.insert("count:" + id).inserted && mode != "off" { sound.chime(volume: 0.8) }
            return
        }
        // `.onCall`: the ring has run its course and Samwise's call is still open, so the person is most likely on it.
        // The Mac keeps the screen and stays quiet until the call's result is in.
        if mode == "off" || state.silencedAt != nil || kind == .onCall {
            sound.stopLoop()
            ringStartedAt = nil
            return
        }
        let started = ringStartedAt ?? Date()
        ringStartedAt = started
        let t = Date().timeIntervalSince(started)
        if mode == "gentle" {
            sound.loop(.ring, volume: 0.35)
        } else if t < 60 || kind == .test {
            sound.loop(.ring, volume: Float(min(1, 0.3 + 0.7 * t / 45)))
        } else {
            sound.loop(.urgent, volume: 1)
            if settings.raiseVolume { sound.raiseSystemVolume(to: 60) }
        }
    }

    // MARK: Keys and buttons on the alarm

    private var currentTakeover: String? {
        if case .takeover(let id, _) = desired { return id }
        return nil
    }

    private func quiet() {
        guard let id = currentTakeover, sound.isLooping else { return }
        Engine.silence(id, now: clock.now, states: &store.data.states)
        sound.stopLoop()
        ringStartedAt = nil
        store.touch()
    }

    func takeoverTouched() {
        quiet()
        redrawTakeover()
    }

    func takeoverKey(_ event: NSEvent) {
        quiet()
        if event.modifierFlags.contains(.command) { return }
        switch event.keyCode {
        case 48: toggleWords()
        case 53: escape()
        case 51, 117: backspace()
        default: typeText(event.characters ?? "")
        }
    }

    private func toggleWords() {
        let m = takeover.model
        guard !m.words.isEmpty else { return }
        m.showWords.toggle()
        redrawTakeover()
    }

    private func escape() {
        let m = takeover.model
        if m.showWords { m.showWords = false } else { m.typed = "" }
        redrawTakeover()
    }

    private func backspace() {
        let m = takeover.model
        if !m.typed.isEmpty { m.typed.removeLast() }
        redrawTakeover()
    }

    /// Letters go to whichever line they continue: the line that gives the screen back, or the skip line.
    /// A letter that continues neither is refused, so there is never anything to correct.
    func typeText(_ text: String) {
        guard let id = currentTakeover else { return }
        let m = takeover.model
        let commitLine = PhraseMatch.normalize(m.commitPhrase)
        let skipLine = PhraseMatch.normalize(m.skipPhrase)
        for ch in PhraseMatch.normalize(text) {
            let candidate = m.typed + String(ch)
            if commitLine.hasPrefix(candidate) || (!skipLine.isEmpty && skipLine.hasPrefix(candidate)) {
                m.typed = candidate
                m.wrongAt = nil
            } else {
                m.wrongAt = Date()
            }
        }
        if m.typed == commitLine {
            commit(id)
        } else if !skipLine.isEmpty && m.typed == skipLine {
            skip(id)
        } else {
            redrawTakeover()
            if m.wrongAt != nil {
                Task { @MainActor in
                    try? await Task.sleep(nanoseconds: 800_000_000)
                    self.redrawTakeover()
                }
            }
        }
    }

    private func redrawTakeover() {
        guard let id = currentTakeover, case .takeover(_, let kind) = desired else { return }
        fill(id: id, kind: kind, now: clock.now)
        takeover.refresh()
    }

    private func commit(_ id: String, thenOpen url: URL? = nil) {
        guard let e = Engine.commit(id, now: clock.now, states: &store.data.states, settings: settings) else { return }
        record(e)
        let c = copy
        if e.kind == "test_done" {
            transient = (c.testDonePill, Date().addingTimeInterval(7))
        } else if let url = url {
            openLink(url)
        } else if settings.openJournalOnStart, let journal = journalURL(for: id) {
            openLink(journal)
        }
        store.save()
        tick()
    }

    private func skip(_ id: String) {
        guard let e = Engine.skip(id, now: clock.now, states: &store.data.states) else { return }
        record(e)
        let c = copy
        transient = (e.kind == "test_done" ? c.testDonePill : c.skippedPill, Date().addingTimeInterval(7))
        store.save()
        tick()
    }

    private func finish(_ id: String) {
        // Samwise has not counted this check-in and is going to tell the trusted people: the Mac takes the
        // user's word for its own screen, but it does not say "Check-in done." The warning stays up.
        let notCounted = alertSlot(id, now: clock.now) != nil
        guard let e = Engine.finish(id, now: clock.now, states: &store.data.states) else { return }
        record(e)
        if e.kind == "test_done" {
            transient = (copy.testDonePill, Date().addingTimeInterval(7))
        } else if !notCounted {
            celebrate()
        }
        store.save()
        tick()
    }

    private func notYet(_ id: String) {
        guard let e = Engine.notYet(id, now: clock.now, states: &store.data.states) else { return }
        record(e)
        store.save()
        tick()
    }

    func takeoverSnooze() {
        guard let id = currentTakeover, let e = Engine.snooze(id, now: clock.now, states: &store.data.states, settings: settings) else { return }
        record(e)
        store.save()
        tick()
    }

    func takeoverFinish() {
        guard let id = currentTakeover else { return }
        finish(id)
    }

    private func samwiseDigits() -> String? {
        guard let number = config?.samwiseNumber else { return nil }
        let digits = number.filter { $0 >= "0" && $0 <= "9" }
        return digits.isEmpty ? nil : digits
    }

    /// Calling Samwise is doing the check-in: the screen is given back so the call can be placed.
    func takeoverCall() {
        guard let id = currentTakeover, let digits = samwiseDigits() else { return }
        commit(id, thenOpen: URL(string: "tel:+\(digits)"))
    }

    func takeoverWhatsApp() {
        guard let id = currentTakeover, let digits = samwiseDigits() else { return }
        commit(id, thenOpen: URL(string: "https://wa.me/\(digits)"))
    }

    // MARK: After the check-in

    /// The check-in named on the "Check-in done" card. A check-in can be counted before its own time
    /// (a written entry during the last minute), so the one that just ended is left out here too.
    private func nextText() -> String? {
        ScheduleMath.next(after: clock.now, times: times, timeZone: timeZone, finished: finishedCheckins).map { dayAndTime($0.fireAt) }
    }

    private func celebrate() {
        let c = copy
        let tasks = usesAccount ? (config?.tasks ?? []) : []
        if tasks.isEmpty {
            transient = (c.doneTitle + " " + c.doneBody(next: nextText()), Date().addingTimeInterval(9))
        } else {
            windows.showAfter(tasks: tasks, next: nextText())
        }
    }

    func showAfterCard() {
        windows.showAfter(tasks: usesAccount ? (config?.tasks ?? []) : [], next: nextText())
    }

    func markTaskDone(_ id: Int) {
        config?.tasks?.removeAll { $0.id == id }
        guard let token = store.token else { return }
        queue("task_done")
        Task { @MainActor in
            do {
                _ = try await self.api.send("POST", "/api/mac/tasks/done", token: token, body: ["id": id])
            } catch {
                Log.write("tasks: could not mark done, will show again")
            }
            self.nextPollAt = .distantPast
        }
    }

    // MARK: Test, pause, settings

    func startTest() {
        if currentTakeover != nil { return }
        store.data.testCounter += 1
        let id = "test-\(store.data.testCounter)"
        store.data.states[id] = OccurrenceState(id: id, fireAt: clock.now, phase: .pending, isTest: true)
        store.touch()
        tick()
    }

    func pauseAlarms(days: Int) {
        // Until 04:00 after that many nights, so "until tomorrow" covers every check-in left today.
        let cal = ScheduleMath.calendar(timeZone)
        let start = cal.startOfDay(for: clock.now)
        let until = cal.date(byAdding: .hour, value: 24 * days + 4, to: start) ?? clock.now.addingTimeInterval(Double(days) * 86_400)
        store.data.pausedUntil = until
        store.save()
        queue("paused", detail: ["days": String(days)])
        Log.write("paused for \(days) day(s)")
        windows.reload()
        tick()
    }

    func resumeAlarms() {
        store.data.pausedUntil = nil
        store.save()
        queue("resumed")
        windows.reload()
        tick()
    }

    func updateSettings(_ change: (inout AlarmSettings) -> Void) {
        change(&store.data.settings)
        store.save()
        tick()
    }

    func setLocalTimes(_ times: [String]) {
        updateSettings { $0.localTimes = times }
    }

    func welcomeFinished() {
        guard !store.data.welcomed else { return }
        store.data.welcomed = true
        store.save()
        Log.write("welcome done")
        if settings.keepRunning && !options.noAgent && Agent.isStableLocation {
            // launchd starts the kept-alive copy, which then asks this one to step aside.
            Agent.install()
        }
        tick()
    }

    func setKeepRunning(_ on: Bool) {
        updateSettings { $0.keepRunning = on }
        guard store.data.welcomed, !options.noAgent else { return }
        if on {
            if Agent.isStableLocation { Agent.install() }
        } else if Agent.isInstalled {
            if options.launchd {
                // This copy belongs to launchd and stops with the agent, so start a plain copy first.
                store.save()
                store.frozen = true
                let cfg = NSWorkspace.OpenConfiguration()
                cfg.createsNewApplicationInstance = true
                cfg.arguments = ["--replace"]
                NSWorkspace.shared.openApplication(at: Bundle.main.bundleURL, configuration: cfg) { _, _ in
                    Agent.uninstall()
                }
            } else {
                Agent.uninstall()
            }
        }
    }

    func moveToApplications() {
        guard let target = Mover.copyToApplications() else {
            notice(copy.moveFailed)
            return
        }
        store.save()
        store.frozen = true
        let cfg = NSWorkspace.OpenConfiguration()
        cfg.createsNewApplicationInstance = true
        cfg.arguments = ["--replace"]
        NSWorkspace.shared.openApplication(at: target, configuration: cfg) { _, error in
            let failed = error != nil
            Task { @MainActor in
                if failed {
                    self.store.frozen = false
                    self.notice(self.copy.moveFailed)
                } else {
                    self.allowQuit = true
                    NSApp.terminate(nil)
                }
            }
        }
    }

    private func notice(_ text: String) {
        let alert = NSAlert()
        alert.messageText = "Samwise"
        alert.informativeText = text
        alert.addButton(withTitle: copy.ok)
        NSApp.activate(ignoringOtherApps: true)
        _ = alert.runModal()
    }

    func confirmTurnOff() {
        let c = copy
        let alert = NSAlert()
        alert.messageText = c.turnOffTitle
        alert.informativeText = c.turnOffBody
        alert.addButton(withTitle: c.turnOffConfirm)
        alert.addButton(withTitle: c.cancel)
        NSApp.activate(ignoringOtherApps: true)
        guard alert.runModal() == .alertFirstButtonReturn else { return }
        Log.write("turned off by the user")
        let token = store.token
        let api = self.api
        Task { @MainActor in
            if let token = token {
                // Tell Samwise this Mac is gone; do not wait long for it.
                let call = Task { _ = try? await api.send("POST", "/api/mac/unpair", token: token) }
                try? await Task.sleep(nanoseconds: 2_000_000_000)
                call.cancel()
            }
            self.store.setToken(nil)
            self.store.data.settings.keepRunning = false
            self.store.data.welcomed = false
            self.store.data.events.removeAll()
            self.store.save()
            self.allowQuit = true
            if Agent.isInstalled { Agent.uninstall() }
            NSApp.terminate(nil)
        }
    }

    // MARK: The Samwise account

    private static func cleanPhone(_ text: String) -> String? {
        let digits = text.filter { $0 >= "0" && $0 <= "9" }
        guard digits.count >= 8 && digits.count <= 15 else { return nil }
        return "+" + digits
    }

    func pairStart(phone: String) async -> String? {
        let c = copy
        guard let number = Self.cleanPhone(phone) else { return c.badPhone }
        do {
            _ = try await api.send("POST", "/api/mac/pair/start", body: ["phone": number])
            return nil
        } catch let e as APIError {
            Log.write("pair start: HTTP \(e.status)")
            if e.status == 429 { return c.tooManyTries }
            if e.status == 400 { return c.badPhone }
            return c.serverTrouble
        } catch {
            Log.write("pair start: no connection")
            return c.serverTrouble
        }
    }

    func pairVerify(phone: String, code: String) async -> String? {
        let c = copy
        guard let number = Self.cleanPhone(phone) else { return c.badPhone }
        let digits = code.filter { $0 >= "0" && $0 <= "9" }
        guard digits.count == 6 else { return c.badCode }
        var body = API.device()
        body["phone"] = number
        body["code"] = digits
        body["install_id"] = store.data.installId
        return await finishPairing("/api/mac/pair/verify", body)
    }

    func pairWithCode(_ code: String) async -> String? {
        let clean = code.uppercased().filter { ($0 >= "0" && $0 <= "9") || ($0 >= "A" && $0 <= "Z") }
        guard clean.count >= 6 else { return copy.badCode }
        var body = API.device()
        body["code"] = clean
        body["install_id"] = store.data.installId
        return await finishPairing("/api/mac/pair/code", body)
    }

    private func finishPairing(_ path: String, _ body: [String: Any]) async -> String? {
        let c = copy
        do {
            let data = try await api.send("POST", path, body: body)
            let json = (try? JSONSerialization.jsonObject(with: data)) as? [String: Any]
            guard let token = json?["token"] as? String, !token.isEmpty else { return c.serverTrouble }
            store.setToken(token)
            if let object = json?["config"], let raw = try? JSONSerialization.data(withJSONObject: object), let cfg = try? RemoteConfig.decode(raw) {
                apply(cfg, raw: raw)
            }
            connectionProblem = nil
            nextPollAt = .distantPast
            Log.write("connected to a Samwise account")
            queue("paired")
            windows.reload()
            tick()
            return nil
        } catch let e as APIError {
            Log.write("pair: HTTP \(e.status)")
            if e.status == 429 { return c.tooManyTries }
            if e.status >= 400 && e.status < 500 { return c.badCode }
            return c.serverTrouble
        } catch {
            Log.write("pair: no connection")
            return c.serverTrouble
        }
    }

    func disconnect() {
        if let token = store.token {
            let api = self.api
            Task { _ = try? await api.send("POST", "/api/mac/unpair", token: token) }
        }
        store.setToken(nil)
        config = nil
        connectionProblem = nil
        store.data.events.removeAll()
        store.save()
        Log.write("disconnected")
        windows.reload()
        tick()
    }

    private func apply(_ cfg: RemoteConfig, raw: Data) {
        config = cfg
        store.cacheConfig(raw)
        noteScheduleChange()
    }

    // MARK: Staying awake

    /// A sleeping Mac cannot ring. Around a check-in that can still ring, the Mac is kept from falling asleep
    /// on its own, and its screen is kept on while the alarm is on it (Engine.awakeLevel has the rule).
    /// The user can turn this off in Settings, and closing the lid still puts the Mac to sleep.
    private func stayAwake(now: Date) {
        let level = Engine.awakeLevel(
            now: now, occurrences: Array(occurrences.values), states: store.data.states,
            desired: desired, enabled: settings.keepAwake, pausedUntil: store.data.pausedUntil)
        guard level != awakeLevel else { return }
        if let token = awakeToken { ProcessInfo.processInfo.endActivity(token) }
        awakeToken = nil
        awakeLevel = level
        if level > 0 {
            var options: ProcessInfo.ActivityOptions = [.idleSystemSleepDisabled]
            if level == 2 { options.insert(.idleDisplaySleepDisabled) }
            let reason = level == 2 ? "Samwise check-in alarm is on screen" : "A Samwise check-in is near"
            awakeToken = ProcessInfo.processInfo.beginActivity(options: options, reason: reason)
        }
        Log.write("awake: \(level)")
    }

    // MARK: Talking to samwise.life

    /// A check-in is near or open: ask Samwise every 30 seconds how it stands. Otherwise every 15 minutes.
    private var busy: Bool {
        if desired != .idle { return true }
        let now = clock.now
        let slots = usesAccount ? (config?.slots ?? []) : []
        // Samwise's call is open, or Samwise is about to tell the trusted people: follow it closely, so the
        // warning shows in time and goes away as soon as the check-in counts.
        if slots.contains(where: { !$0.done && ($0.callOpen || $0.alertAhead(now)) }) { return true }
        return occurrences.values.contains { o in
            let d = o.fireAt.timeIntervalSince(now)
            guard d < 8 * 60 && d > -45 * 60 else { return false }
            guard let s = store.data.states[o.id], s.phase.isFinal else { return true }
            // Ended here by the user's own word while Samwise's call may still be coming or going on.
            guard s.phase == .done, s.finishSource == "self" || s.finishSource == "unconfirmed" else { return false }
            guard let slot = slots.first(where: { $0.id == o.id }) else { return false }
            return !slot.done && (slot.willCall || slot.callPlaced)
        }
    }

    private func network() {
        guard paired else { return }
        let real = Date()
        // A check-in came near since the last answer: ask now instead of waiting out the quiet 15 minutes,
        // so a check-in that is already done or was moved never takes the screen, and Samwise knows this Mac is on.
        if busy && nextPollAt.timeIntervalSince(real) > 30 { nextPollAt = real }
        if !fetching && real >= nextPollAt { fetchConfig() }
        if !posting && !store.data.events.isEmpty && real.timeIntervalSince(lastPostAt) > 20 { postEvents() }
    }

    private func fetchConfig() {
        guard let token = store.token, !fetching else { return }
        fetching = true
        nextPollAt = Date().addingTimeInterval(60)
        Task { @MainActor in
            var changed = false
            do {
                let data = try await self.api.send("GET", "/api/mac/config", token: token)
                let cfg = try RemoteConfig.decode(data)
                changed = cfg != self.config
                self.apply(cfg, raw: data)
                self.connectionProblem = nil
            } catch let e as APIError where e.status == 401 || e.status == 403 {
                Log.write("config: this Mac is no longer connected (HTTP \(e.status))")
                self.store.setToken(nil)
                self.config = nil
                self.connectionProblem = self.copy.connectionLost
                changed = true
            } catch let e as APIError {
                Log.write("config: HTTP \(e.status)")
                self.connectionProblem = self.copy.offlineNote
            } catch {
                self.connectionProblem = self.copy.offlineNote
            }
            self.fetching = false
            self.nextPollAt = Date().addingTimeInterval(self.busy ? 30 : 900)
            if changed {
                self.windows.reload()
                self.tick()
            }
        }
    }

    private func queue(_ kind: String, occurrence: String = "", detail: [String: String] = [:]) {
        guard paired else { return }
        store.data.events.append(QueuedEvent(kind: kind, occurrence: occurrence, detail: detail, at: Date()))
        let extra = store.data.events.count - 300
        if extra > 0 { store.data.events.removeFirst(extra) }
        store.touch()
    }

    private func postEvents() {
        guard let token = store.token, !posting else { return }
        let batch = Array(store.data.events.prefix(50))
        guard !batch.isEmpty else { return }
        posting = true
        lastPostAt = Date()
        let iso = ISO8601DateFormatter()
        var body = API.device()
        body["install_id"] = store.data.installId
        var list: [[String: Any]] = []
        for e in batch {
            list.append(["kind": e.kind, "occurrence": e.occurrence, "detail": e.detail, "at": iso.string(from: e.at)])
        }
        body["events"] = list
        let payload = body
        Task { @MainActor in
            var sent = false
            do {
                _ = try await self.api.send("POST", "/api/mac/events", token: token, body: payload)
                sent = true
            } catch let e as APIError where e.status == 400 || e.status == 413 {
                // Samwise refuses this batch: drop it rather than send it forever.
                sent = true
                Log.write("events: batch refused (HTTP \(e.status))")
            } catch {
                sent = false
            }
            if sent {
                let n = min(batch.count, self.store.data.events.count)
                if Array(self.store.data.events.prefix(n)) == batch { self.store.data.events.removeFirst(n) }
                self.store.save()
            }
            self.posting = false
        }
    }

    // MARK: Menu bar

    private func buildStatusItem() {
        let item = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)
        item.button?.image = Theme.menuBarImage()
        item.button?.setAccessibilityLabel("Samwise")
        let menu = NSMenu()
        menu.delegate = self
        menu.autoenablesItems = false
        item.menu = menu
        statusItem = item
    }

    func menuNeedsUpdate(_ menu: NSMenu) {
        menu.removeAllItems()
        menuProxies.removeAll()
        let c = copy

        func info(_ title: String) {
            let i = NSMenuItem(title: title, action: nil, keyEquivalent: "")
            i.isEnabled = false
            menu.addItem(i)
        }
        func item(_ title: String, _ run: @escaping () -> Void) {
            let p = ActionProxy(run)
            menuProxies.append(p)
            let i = NSMenuItem(title: title, action: #selector(ActionProxy.fire(_:)), keyEquivalent: "")
            i.target = p
            menu.addItem(i)
        }

        info(nextCheckinLine())
        if paired {
            let name = config?.user?.firstName ?? ""
            info(name.isEmpty ? c.connected : c.connectedAs(name))
        } else {
            info(c.notConnected)
        }
        menu.addItem(.separator())
        item(c.testAlarm) { [weak self] in self?.startTest() }
        if let url = journalURL() {
            item(c.openJournal) { [weak self] in self?.openLink(url) }
        }
        if usesAccount, !(config?.tasks ?? []).isEmpty {
            item(c.afterMenu) { [weak self] in self?.showAfterCard() }
        }
        menu.addItem(.separator())
        item(c.settings) { [weak self] in self?.windows.showSettings() }
        if isPaused {
            item(c.resume) { [weak self] in self?.resumeAlarms() }
        } else {
            item(c.pause) { [weak self] in self?.windows.showPause() }
        }
        if let latest = config?.latestVersion, isVersion(latest, newerThan: appVersion), let text = config?.downloadUrl, let url = URL(string: text) {
            item(c.updateAvailable) { [weak self] in self?.openLink(url) }
        }
        if !options.launchd {
            menu.addItem(.separator())
            item(c.quit) { [weak self] in
                self?.allowQuit = true
                NSApp.terminate(nil)
            }
        }
    }

    // MARK: Hooks for the build's end-to-end test (only with --test-hooks)

    private func readCommands() {
        let fm = FileManager.default
        let url = store.dir.appendingPathComponent("commands.txt")
        let reading = store.dir.appendingPathComponent("commands.reading")
        guard fm.fileExists(atPath: url.path) else { return }
        try? fm.removeItem(at: reading)
        guard (try? fm.moveItem(at: url, to: reading)) != nil, let text = try? String(contentsOf: reading, encoding: .utf8) else { return }
        try? fm.removeItem(at: reading)
        for line in text.split(separator: "\n") { run(command: String(line)) }
    }

    private func run(command: String) {
        let parts = command.split(separator: ":", maxSplits: 1).map(String.init)
        guard let name = parts.first else { return }
        let value = parts.count > 1 ? parts[1] : ""
        Log.write("hook: \(name)")
        switch name {
        case "advance": clock.offset += Double(value) ?? 0
        case "type": typeText(value)
        case "key":
            if value == "tab" { toggleWords() }
            if value == "esc" { escape() }
            if value == "delete" { backspace() }
        case "touch": takeoverTouched()
        case "snooze": takeoverSnooze()
        case "finish":
            if case .inProgress(let id, _) = desired { finish(id) } else { takeoverFinish() }
        case "notyet":
            if case .inProgress(let id, _) = desired { notYet(id) }
        case "call": takeoverCall()
        case "warncall":
            if let id = warningID { callFromWarning(id) }
        case "warnok":
            if let id = warningID { dismissWarning(id) }
        case "test": startTest()
        case "poll": nextPollAt = .distantPast
        case "show":
            switch value {
            case "welcome": windows.showWelcome()
            case "settings": windows.showSettings()
            case "pair": windows.showPair()
            case "pause": windows.showPause()
            case "after": showAfterCard()
            default: break
            }
        case "pairstart":
            Task { @MainActor in
                let problem = await self.pairStart(phone: value)
                self.hookResult = "pairstart:" + (problem == nil ? "ok" : "problem")
            }
        case "pairverify":
            let pieces = value.split(separator: ",").map(String.init)
            guard pieces.count == 2 else { break }
            Task { @MainActor in
                let problem = await self.pairVerify(phone: pieces[0], code: pieces[1])
                self.hookResult = "pairverify:" + (problem == nil ? "ok" : "problem")
            }
        case "paircode":
            Task { @MainActor in
                let problem = await self.pairWithCode(value)
                self.hookResult = "paircode:" + (problem == nil ? "ok" : "problem")
            }
        case "disconnect": disconnect()
        case "taskdone":
            if let first = config?.tasks?.first { markTaskDone(first.id) }
        case "keeprunning":
            setKeepRunning(value == "on")
        case "welcomedone":
            welcomeFinished()
        case "quit":
            allowQuit = true
            store.save()
            NSApp.terminate(nil)
        default:
            break
        }
    }

    private func writeStatus(_ now: Date) {
        var d: [String: Any] = [
            "version": appVersion,
            "now": ISO8601DateFormatter().string(from: now),
            "paired": paired,
            "sound": sound.isLooping,
            "pill": pill.isUp,
            "pill_text": pillText,
            "pill_buttons": pillButtons,
            "warning": warningID ?? "",
            "takeover": takeover.isUp,
            "keyboard": takeover.hasKeyboard,
            "typed": takeover.model.typed,
            "words_shown": takeover.model.showWords,
            "words_count": takeover.model.words.count,
            "title": takeover.isUp ? takeover.model.title : "",
            "subtitle": takeover.isUp ? takeover.model.subtitle : "",
            "windows": windows.anyVisible,
            "queued_events": store.data.events.count,
            "next": nextCheckinLine(),
            "after_next": nextText() ?? "",
            "awake": awakeLevel,
            "tasks": config?.tasks?.count ?? 0,
            "hook_result": hookResult,
            "problem": connectionProblem ?? "",
            "name": config?.user?.firstName ?? "",
            "opened": lastOpened,
            "launchd": options.launchd,
            "pid": Int(ProcessInfo.processInfo.processIdentifier),
            "agent": Agent.isInstalled,
        ]
        switch desired {
        case .idle:
            d["desired"] = "idle"
        case .headsUp(let id, let seconds):
            d["desired"] = "headsUp"
            d["id"] = id
            d["seconds"] = seconds
        case .takeover(let id, let kind):
            d["desired"] = "takeover"
            d["id"] = id
            d["kind"] = kind.rawValue
        case .snoozed(let id, let left):
            d["desired"] = "snoozed"
            d["id"] = id
            d["seconds"] = left
        case .inProgress(let id, let ask):
            d["desired"] = "inProgress"
            d["id"] = id
            d["ask"] = ask
        }
        var phases: [String: String] = [:]
        for (id, s) in store.data.states { phases[id] = s.phase.rawValue }
        d["phases"] = phases
        if let raw = try? JSONSerialization.data(withJSONObject: d, options: [.sortedKeys]) {
            try? raw.write(to: store.statusURL, options: .atomic)
        }
    }
}
