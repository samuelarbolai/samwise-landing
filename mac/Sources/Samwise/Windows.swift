import AppKit
import SamwiseCore

/// Runs a closure from a control or a menu item.
final class ActionProxy: NSObject {
    private let handler: () -> Void
    init(_ handler: @escaping () -> Void) { self.handler = handler }
    @objc func fire(_ sender: Any?) { handler() }
}

/// A small vertical form in the house style: white, serif headings, black buttons.
@MainActor
final class Form {
    let stack = NSStackView()
    let width: CGFloat
    private var proxies: [ActionProxy] = []

    init(width: CGFloat) {
        self.width = width
        stack.orientation = .vertical
        stack.alignment = .leading
        stack.spacing = 10
        stack.edgeInsets = NSEdgeInsets(top: 34, left: 30, bottom: 26, right: 30)
        stack.translatesAutoresizingMaskIntoConstraints = false
    }

    @discardableResult
    func add(_ view: NSView, gap: CGFloat? = nil) -> NSView {
        if let gap = gap, let last = stack.arrangedSubviews.last {
            stack.setCustomSpacing(gap, after: last)
        }
        stack.addArrangedSubview(view)
        return view
    }

    @discardableResult
    func heading(_ text: String, size: CGFloat = 28, gap: CGFloat? = nil) -> NSTextField {
        let l = Theme.label(text, font: Theme.serif(size), color: Theme.ink)
        l.preferredMaxLayoutWidth = width
        add(l, gap: gap)
        return l
    }

    @discardableResult
    func text(_ text: String, size: CGFloat = 13.5, color: NSColor = Theme.inkMute, gap: CGFloat? = nil) -> NSTextField {
        let l = Theme.label(text, font: Theme.sans(size), color: color)
        l.preferredMaxLayoutWidth = width
        add(l, gap: gap)
        return l
    }

    @discardableResult
    func section(_ text: String) -> NSTextField {
        let l = Theme.label("", font: Theme.sans(11, .bold), color: Theme.forest, wraps: false)
        l.attributedStringValue = NSAttributedString(string: text.uppercased(), attributes: [.font: Theme.sans(11, .bold), .foregroundColor: Theme.forest, .kern: 1.3])
        add(l, gap: 22)
        return l
    }

    func proxy(_ handler: @escaping () -> Void) -> ActionProxy {
        let p = ActionProxy(handler)
        proxies.append(p)
        return p
    }

    @discardableResult
    func checkbox(_ title: String, on: Bool, gap: CGFloat? = nil, _ changed: @escaping (Bool) -> Void) -> NSButton {
        let b = NSButton(checkboxWithTitle: title, target: nil, action: nil)
        b.state = on ? .on : .off
        b.font = Theme.sans(13.5)
        let p = proxy { [weak b] in changed(b?.state == .on) }
        b.target = p
        b.action = #selector(ActionProxy.fire(_:))
        add(b, gap: gap)
        return b
    }

    func popup(_ titles: [String], selected: Int, _ changed: @escaping (Int) -> Void) -> NSPopUpButton {
        let b = NSPopUpButton(frame: .zero, pullsDown: false)
        b.addItems(withTitles: titles)
        if selected >= 0 && selected < titles.count { b.selectItem(at: selected) }
        b.font = Theme.sans(13)
        let p = proxy { [weak b] in changed(b?.indexOfSelectedItem ?? 0) }
        b.target = p
        b.action = #selector(ActionProxy.fire(_:))
        return b
    }

    func field(_ value: String, placeholder: String, width: CGFloat) -> NSTextField {
        let f = NSTextField(string: value)
        f.placeholderString = placeholder
        f.font = Theme.sans(14)
        f.widthAnchor.constraint(equalToConstant: width).isActive = true
        return f
    }

    func caption(_ text: String) -> NSTextField {
        Theme.label(text, font: Theme.sans(13.5), color: Theme.ink, wraps: false)
    }

    @discardableResult
    func row(_ views: [NSView], gap: CGFloat? = nil, spacing: CGFloat = 10) -> NSStackView {
        let r = NSStackView(views: views)
        r.orientation = .horizontal
        r.alignment = .centerY
        r.spacing = spacing
        add(r, gap: gap)
        return r
    }

    func rule(gap: CGFloat = 18) {
        let box = NSBox()
        box.boxType = .custom
        box.borderWidth = 0
        box.fillColor = Theme.rule
        box.heightAnchor.constraint(equalToConstant: 1).isActive = true
        box.widthAnchor.constraint(equalToConstant: width).isActive = true
        add(box, gap: gap)
        if let last = stack.arrangedSubviews.last { stack.setCustomSpacing(gap, after: last) }
    }

    /// Builds the window around the form. A form taller than the screen scrolls instead of running off it.
    func window(title: String) -> NSWindow {
        let content = FlippedView()
        content.addSubview(stack)
        NSLayoutConstraint.activate([
            stack.leadingAnchor.constraint(equalTo: content.leadingAnchor),
            stack.topAnchor.constraint(equalTo: content.topAnchor),
            stack.widthAnchor.constraint(equalToConstant: width + 60),
        ])
        stack.layoutSubtreeIfNeeded()
        let natural = stack.fittingSize
        content.frame = NSRect(origin: .zero, size: natural)

        let scroll = NSScrollView()
        scroll.drawsBackground = false
        scroll.borderType = .noBorder
        scroll.hasVerticalScroller = true
        scroll.hasHorizontalScroller = false
        scroll.autohidesScrollers = true
        scroll.automaticallyAdjustsContentInsets = false
        scroll.verticalScrollElasticity = .none
        scroll.documentView = content

        let room = max(320, (NSScreen.main?.visibleFrame.height ?? 800) - 48)
        let size = NSSize(width: natural.width, height: min(natural.height, room))
        let w = NSWindow(contentRect: NSRect(origin: .zero, size: size), styleMask: [.titled, .closable, .fullSizeContentView], backing: .buffered, defer: false)
        w.title = title
        w.titlebarAppearsTransparent = true
        w.titleVisibility = .hidden
        w.isReleasedWhenClosed = false
        w.appearance = NSAppearance(named: .aqua)
        w.backgroundColor = Theme.bg
        w.contentView = scroll
        w.setContentSize(size)
        w.center()
        return w
    }
}

/// A plain container whose content starts at the top, so a long form opens scrolled to its beginning.
final class FlippedView: NSView {
    override var isFlipped: Bool { true }
}

/// The app's ordinary windows: welcome, settings, connect, pause, and "after your check-in".
@MainActor
final class Windows: NSObject, NSWindowDelegate {
    private unowned let app: AppController
    private var welcome: NSWindow?
    private var settings: NSWindow?
    private var pair: NSWindow?
    private var pause: NSWindow?
    private var after: NSWindow?
    private var forms: [ObjectIdentifier: Form] = [:]
    var allowCapture = false

    init(app: AppController) {
        self.app = app
    }

    var anyVisible: Bool {
        [welcome, settings, pair, pause, after].contains { $0?.isVisible ?? false }
    }

    private func present(_ window: NSWindow, form: Form) {
        forms[ObjectIdentifier(window)] = form
        window.delegate = self
        NSApp.activate(ignoringOtherApps: true)
        window.makeKeyAndOrderFront(nil)
    }

    func windowWillClose(_ notification: Notification) {
        guard let w = notification.object as? NSWindow else { return }
        forms[ObjectIdentifier(w)] = nil
        if w === welcome {
            welcome = nil
            app.welcomeFinished()
        }
        if w === settings { settings = nil }
        if w === pair { pair = nil }
        if w === pause { pause = nil }
        if w === after { after = nil }
    }

    private func replace(_ slot: inout NSWindow?) {
        if let old = slot {
            old.delegate = nil
            forms[ObjectIdentifier(old)] = nil
            old.orderOut(nil)
        }
        slot = nil
    }

    /// Rebuilds whichever of welcome and settings is open, after the account or the schedule changed.
    func reload() {
        if welcome != nil { showWelcome() }
        if settings != nil { showSettings() }
    }

    // MARK: Shared blocks

    private func accountBlock(_ f: Form) {
        let c = app.copy
        if app.paired {
            let name = app.config?.user?.firstName ?? ""
            let times = app.times.map { $0.description }.joined(separator: ", ")
            let who = name.isEmpty ? c.connected : c.connectedAs(name)
            f.text(times.isEmpty ? who + " " + c.noTimesOnAccount : who + " " + c.checkinAt(times, zone: app.zoneLabel), color: Theme.ink)
            if let problem = app.connectionProblem {
                f.text(problem, size: 12.5, color: Theme.red)
            }
            f.row([PillButton(c.disconnect, style: .secondary) { [weak self] in
                self?.app.disconnect()
            }])
        } else {
            f.text(c.connectWhy)
            f.row([PillButton(c.connectButton, style: .primary) { [weak self] in self?.showPair() }])
            let field = f.field(app.settings.localTimes.joined(separator: ", "), placeholder: "16:00", width: 120)
            let p = f.proxy { [weak self, weak field] in
                guard let self = self, let field = field else { return }
                let times = CheckinTime.list(field.stringValue).map { $0.description }
                self.app.setLocalTimes(times)
                field.stringValue = times.joined(separator: ", ")
            }
            field.target = p
            field.action = #selector(ActionProxy.fire(_:))
            f.row([f.caption(c.localTimeLabel), field], gap: 14)
            f.text(c.localTimeHelp, size: 12.5, color: Theme.inkFaint)
        }
    }

    private func keepRunningBlock(_ f: Form) {
        let c = app.copy
        f.checkbox(c.keepRunning, on: app.settings.keepRunning) { [weak self] on in
            self?.app.setKeepRunning(on)
        }
        f.text(c.keepRunningWhy, size: 12.5, color: Theme.inkFaint, gap: 4)
    }

    // MARK: Welcome

    func showWelcome() {
        replace(&welcome)
        let c = app.copy
        let f = Form(width: 430)
        f.add(BrandView(size: 22))
        f.heading(c.welcomeTitle, size: 30, gap: 18)
        f.text(c.welcomeBody, size: 14.5, gap: 10)
        let phrase = Theme.label(c.commitPhrase, font: NSFont.monospacedSystemFont(ofSize: 15, weight: .medium), color: Theme.ink, wraps: false)
        f.add(phrase, gap: 10)
        f.text(c.welcomeCharge, size: 14.5, gap: 10)

        if Mover.needsMove {
            f.rule()
            f.text(c.moveWhy, color: Theme.ink)
            f.row([PillButton(c.moveButton, style: .primary) { [weak self] in self?.app.moveToApplications() }])
        }

        f.rule()
        accountBlock(f)
        f.rule()
        keepRunningBlock(f)

        let test = PillButton(c.testAlarm, style: .secondary) { [weak self] in self?.app.startTest() }
        let done = PillButton(c.done, style: .primary) { [weak self] in self?.welcome?.close() }
        f.row([test, done], gap: 24)
        f.text("Samwise \(appVersion)", size: 11.5, color: Theme.inkFaint, gap: 14)

        let w = f.window(title: "Samwise")
        welcome = w
        present(w, form: f)
    }

    // MARK: Settings

    func showSettings() {
        replace(&settings)
        let c = app.copy
        let s = app.settings
        let f = Form(width: 450)
        f.add(BrandView(size: 20))
        f.heading(c.settingsTitle, size: 26, gap: 14)
        f.text(app.nextCheckinLine(), color: Theme.ink, gap: 6)

        f.section(c.sectionAccount)
        accountBlock(f)

        f.section(c.sectionAlarm)
        let headsValues = [0, 120, 300, 600]
        let heads = f.popup([c.off, c.minutesBefore(2), c.minutesBefore(5), c.minutesBefore(10)], selected: headsValues.firstIndex(of: s.headsUpSeconds) ?? 2) { [weak self] i in
            self?.app.updateSettings { $0.headsUpSeconds = headsValues[i] }
        }
        f.row([f.caption(c.headsUpLabel), heads])

        let snoozeMinutes = [3, 5, 10]
        let snoozeCounts = [0, 1, 2, 3]
        let minutes = f.popup(snoozeMinutes.map { c.minutes($0) }, selected: snoozeMinutes.firstIndex(of: s.snoozeMinutes) ?? 1) { [weak self] i in
            self?.app.updateSettings { $0.snoozeMinutes = snoozeMinutes[i] }
        }
        let counts = f.popup(snoozeCounts.map { c.times($0) }, selected: snoozeCounts.firstIndex(of: s.maxSnoozes) ?? 2) { [weak self] i in
            self?.app.updateSettings { $0.maxSnoozes = snoozeCounts[i] }
        }
        f.row([f.caption(c.snoozeLabel), minutes, counts])
        f.text(c.snoozeWhy, size: 12.5, color: Theme.inkFaint, gap: 4)

        let sounds = ["escalating", "gentle", "off"]
        let sound = f.popup([c.soundEscalating, c.soundGentle, c.soundOff], selected: sounds.firstIndex(of: s.sound) ?? 0) { [weak self] i in
            self?.app.updateSettings { $0.sound = sounds[i] }
        }
        f.row([f.caption(c.soundLabel), sound], gap: 14)
        f.checkbox(c.raiseVolume, on: s.raiseVolume) { [weak self] on in
            self?.app.updateSettings { $0.raiseVolume = on }
        }
        f.text(c.raiseVolumeWhy, size: 12.5, color: Theme.inkFaint, gap: 4)

        f.section(c.sectionWords)
        f.checkbox(c.showWordsSetting, on: s.showWordsRightAway) { [weak self] on in
            self?.app.updateSettings { $0.showWordsRightAway = on }
        }
        f.text(c.showWordsWhy, size: 12.5, color: Theme.inkFaint, gap: 4)
        f.checkbox(c.openJournalSetting, on: s.openJournalOnStart, gap: 12) { [weak self] on in
            self?.app.updateSettings { $0.openJournalOnStart = on }
        }

        f.section(c.sectionRunning)
        keepRunningBlock(f)

        let test = PillButton(c.testAlarm, style: .secondary) { [weak self] in self?.app.startTest() }
        let pauseButton = PillButton(app.isPaused ? c.resume : c.pause, style: .secondary) { [weak self] in
            guard let self = self else { return }
            if self.app.isPaused { self.app.resumeAlarms() } else { self.showPause() }
        }
        f.row([test, pauseButton], gap: 26)
        f.row([PillButton(c.turnOff, style: .quiet) { [weak self] in self?.app.confirmTurnOff() }], gap: 6)
        f.text("Samwise \(appVersion)", size: 11.5, color: Theme.inkFaint, gap: 10)

        let w = f.window(title: c.settingsTitle)
        settings = w
        present(w, form: f)
    }

    // MARK: Connect

    func showPair() {
        replace(&pair)
        let c = app.copy
        let f = Form(width: 400)
        f.add(BrandView(size: 20))
        f.heading(c.pairTitle, size: 26, gap: 14)
        f.text(c.pairBody)

        let phone = f.field("", placeholder: "+57 300 123 4567", width: 220)
        let code = f.field("", placeholder: c.codePlaceholder, width: 130)
        let status = Theme.label("", font: Theme.sans(13), color: Theme.inkMute)
        status.preferredMaxLayoutWidth = 400
        let send = PillButton(c.sendCode, style: .primary)
        let connect = PillButton(c.connectButtonShort, style: .primary)
        connect.isEnabled = false
        code.isEnabled = false

        func say(_ text: String, error: Bool = false) {
            status.stringValue = text
            status.textColor = error ? Theme.red : Theme.inkMute
        }

        send.onClick = { [weak self, weak phone, weak send, weak code, weak connect] in
            guard let self = self, let phone = phone else { return }
            let number = phone.stringValue
            send?.isEnabled = false
            say(c.sending)
            Task { @MainActor in
                let problem = await self.app.pairStart(phone: number)
                send?.isEnabled = true
                if let problem = problem {
                    say(problem, error: true)
                } else {
                    say(c.codeSent)
                    code?.isEnabled = true
                    connect?.isEnabled = true
                    if let code = code { code.window?.makeFirstResponder(code) }
                }
            }
        }
        connect.onClick = { [weak self, weak phone, weak code, weak connect] in
            guard let self = self, let phone = phone, let code = code else { return }
            connect?.isEnabled = false
            say(c.connecting)
            let number = phone.stringValue
            let digits = code.stringValue
            Task { @MainActor in
                let problem = await self.app.pairVerify(phone: number, code: digits)
                connect?.isEnabled = true
                if let problem = problem {
                    say(problem, error: true)
                } else {
                    self.pair?.close()
                }
            }
        }

        f.row([phone, send], gap: 14)
        f.row([code, connect])
        f.add(status, gap: 10)

        f.rule()
        f.text(c.pairCodeBody, size: 12.5, color: Theme.inkFaint)
        let direct = f.field("", placeholder: c.pairCodePlaceholder, width: 180)
        let use = PillButton(c.useCode, style: .secondary)
        use.onClick = { [weak self, weak direct, weak use] in
            guard let self = self, let direct = direct else { return }
            use?.isEnabled = false
            say(c.connecting)
            let value = direct.stringValue
            Task { @MainActor in
                let problem = await self.app.pairWithCode(value)
                use?.isEnabled = true
                if let problem = problem {
                    say(problem, error: true)
                } else {
                    self.pair?.close()
                }
            }
        }
        f.row([direct, use])

        let w = f.window(title: c.pairTitle)
        pair = w
        present(w, form: f)
        w.makeFirstResponder(phone)
    }

    // MARK: Pause

    func showPause() {
        replace(&pause)
        let c = app.copy
        let f = Form(width: 400)
        f.heading(c.pauseTitle, size: 26)
        f.text(app.paired ? c.pauseBodyAccount : c.pauseBody)
        let days = [1, 3, 7]
        var chosen = 0
        let how = f.popup([c.pauseTomorrow, c.pauseDays(3), c.pauseDays(7)], selected: 0) { i in chosen = i }
        f.row([how], gap: 14)
        f.text(c.pauseType, color: Theme.ink, gap: 16)
        f.add(Theme.label(c.pausePhrase, font: NSFont.monospacedSystemFont(ofSize: 14, weight: .medium), color: Theme.ink, wraps: false), gap: 6)
        let typed = f.field("", placeholder: "", width: 300)
        let status = Theme.label("", font: Theme.sans(12.5), color: Theme.red)
        let go = PillButton(c.pauseButton, style: .primary) { [weak self, weak typed] in
            guard let self = self, let typed = typed else { return }
            if PhraseMatch.check(typed: typed.stringValue, target: c.pausePhrase) == .complete {
                self.app.pauseAlarms(days: days[chosen])
                self.pause?.close()
            } else {
                status.stringValue = c.pauseMismatch
            }
        }
        f.row([typed, go], gap: 8)
        f.add(status, gap: 6)
        f.text(c.pauseWhy, size: 12.5, color: Theme.inkFaint, gap: 10)
        let w = f.window(title: c.pauseTitle)
        pause = w
        present(w, form: f)
        w.makeFirstResponder(typed)
    }

    // MARK: After the check-in

    func showAfter(tasks: [RemoteTask], next: String?) {
        replace(&after)
        let c = app.copy
        let f = Form(width: 430)
        f.add(BrandView(size: 20))
        f.heading(c.doneTitle, size: 28, gap: 14)
        f.text(c.doneBody(next: next), gap: 6)
        if !tasks.isEmpty {
            f.section(c.afterTitle)
            f.text(c.afterIntro, gap: 6)
            for task in tasks {
                let box = f.checkbox(task.title, on: false, gap: 12) { [weak self] on in
                    if on { self?.app.markTaskDone(task.id) }
                }
                box.font = Theme.sans(14.5, .medium)
                if let detail = task.detail, !detail.isEmpty {
                    let d = f.text(detail, size: 12.5, color: Theme.inkFaint, gap: 2)
                    d.preferredMaxLayoutWidth = 400
                }
            }
        }
        f.row([PillButton(c.close, style: .primary) { [weak self] in self?.after?.close() }], gap: 24)
        let w = f.window(title: c.afterTitle)
        w.level = .floating
        if allowCapture == false { w.sharingType = .none }
        after = w
        present(w, form: f)
    }

    func closeAfter() {
        after?.close()
    }
}
