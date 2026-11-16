import Foundation

/// Where one check-in stands on this Mac.
public enum Phase: String, Codable {
    /// Nothing shown yet.
    case pending
    /// The screen is taken over.
    case ringing
    /// The user asked for a few more minutes.
    case snoozed
    /// The user typed the line and got the screen back; the check-in is under way.
    case committed
    case done
    case skipped
    case missed

    public var isFinal: Bool { self == .done || self == .skipped || self == .missed }
}

public struct OccurrenceState: Codable, Equatable {
    public var id: String
    public var fireAt: Date
    public var phase: Phase
    public var firedAt: Date?
    /// The user pressed a key or clicked: the sound stops, the screen stays.
    public var silencedAt: Date?
    public var snoozesUsed: Int
    public var snoozeUntil: Date?
    public var committedAt: Date?
    public var followUpAt: Date?
    public var followUpAsked: Bool
    public var notYetCount: Int
    /// No answer to "did you finish?" by then: take the screen again.
    public var returnAt: Date?
    public var cameBack: Bool
    public var missedCallShown: Bool
    public var finishedAt: Date?
    /// "self", "samwise_call", "samwise_entry", "skip", "paused", "expired", "unconfirmed", "crash_guard", "test"
    public var finishSource: String?
    public var isTest: Bool
    /// Times the app was restarted while this alarm was on screen. Three restarts and the app stops
    /// taking over the screen for this check-in, so a bug can never lock the Mac.
    public var relaunches: Int
    /// The user was warned that Samwise has not counted this check-in and will tell the trusted people:
    /// the `tellAt` that warning was about. A later call that does not count either has its own time and
    /// its own warning. Optional, so a state file written by an older version still loads.
    public var warnedFor: String?

    public init(id: String, fireAt: Date, phase: Phase = .pending, isTest: Bool = false) {
        self.id = id
        self.fireAt = fireAt
        self.phase = phase
        self.firedAt = nil
        self.silencedAt = nil
        self.snoozesUsed = 0
        self.snoozeUntil = nil
        self.committedAt = nil
        self.followUpAt = nil
        self.followUpAsked = false
        self.notYetCount = 0
        self.returnAt = nil
        self.cameBack = false
        self.missedCallShown = false
        self.finishedAt = nil
        self.finishSource = nil
        self.isTest = isTest
        self.relaunches = 0
        self.warnedFor = nil
    }
}

public enum TakeoverKind: String, Codable {
    /// Up to a minute before the time: "Samwise calls you in 0:42".
    case countdown
    /// At the time: "Samwise is calling your phone now".
    case ringing
    /// Found late, or back from a snooze.
    case late
    /// The user said they were starting, then never said they finished.
    case followUp
    /// Samwise phoned and nobody picked up.
    case missedCall
    /// Samwise's call was placed and its result is not in yet: the person may be on it right now.
    case onCall
    /// The call was answered, but Samwise does not count it as the check-in.
    case unfinished
    case test
}

/// What should be on screen right now. The app draws exactly this, nothing else:
/// after a restart, a sleep or a clock change, one call to `Engine.step` puts the right thing back.
public enum Desired: Equatable {
    case idle
    case headsUp(id: String, secondsToCheckin: Int)
    case takeover(id: String, kind: TakeoverKind)
    case snoozed(id: String, secondsLeft: Int)
    case inProgress(id: String, askFinished: Bool)
}

public struct EngineEvent: Equatable {
    public var kind: String
    public var occurrence: String
    public var detail: [String: String]

    public init(_ kind: String, _ occurrence: String, _ detail: [String: String] = [:]) {
        self.kind = kind
        self.occurrence = occurrence
        self.detail = detail
    }
}

public enum Engine {
    /// How long "Samwise is calling your phone now" stays the headline: the ring (30 s) plus the time to notice.
    public static let ringingSeconds: TimeInterval = 150
    /// A key or a click quiets the ring for this long. If the screen is still taken after that, it rings again,
    /// except while Samwise's call is ringing or under way (`RemoteSlot.callOpen`).
    public static let resoundSeconds: TimeInterval = 120

    /// Moves every check-in forward to `now` and says what should be on screen.
    public static func step(
        now: Date,
        occurrences: [Occurrence],
        states: inout [String: OccurrenceState],
        settings: AlarmSettings,
        remote: [String: RemoteSlot] = [:],
        pausedUntil: Date? = nil
    ) -> (desired: Desired, events: [EngineEvent]) {
        var events: [EngineEvent] = []
        let paused = pausedUntil.map { now < $0 } ?? false
        var byID: [String: Occurrence] = [:]
        for o in occurrences { byID[o.id] = o }

        // 1. Samwise says the check-in happened (a call that reached the person, or a written entry).
        for (id, slot) in remote where slot.done {
            let source = (slot.doneSource == "written" || slot.doneSource == "entry") ? "samwise_entry" : "samwise_call"
            if var s = states[id] {
                if !s.phase.isFinal {
                    let wasVisible = s.phase != .pending
                    s.phase = .done
                    s.finishedAt = now
                    s.finishSource = source
                    states[id] = s
                    events.append(EngineEvent("done", id, ["source": source, "visible": wasVisible ? "1" : "0"]))
                }
            } else if let o = byID[id] {
                var s = OccurrenceState(id: id, fireAt: o.fireAt, phase: .done)
                s.finishedAt = now
                s.finishSource = source
                states[id] = s
                events.append(EngineEvent("done", id, ["source": source, "visible": "0"]))
            }
        }

        // 1b. The user said here that the check-in is under way or done, but Samwise has not counted it
        //     and is going to tell the trusted people. Say so once, in time, without taking the screen.
        for (id, slot) in remote where slot.alertAhead(now) {
            guard var s = states[id], s.warnedFor != slot.tellAt, !s.isTest else { continue }
            let ownWord = s.phase == .committed || (s.phase == .done && (s.finishSource == "self" || s.finishSource == "unconfirmed"))
            guard ownWord else { continue }
            // A missed call takes the screen again below, and that screen says it.
            if s.phase == .committed && slot.callMissed && !s.missedCallShown { continue }
            s.warnedFor = slot.tellAt
            states[id] = s
            events.append(EngineEvent("alert_ahead_seen", id, ["why": slot.callMissed ? "missed" : "unfinished", "on": "panel"]))
        }

        // 2. Walk the check-ins in time order; the first one that needs the screen wins.
        var all = occurrences
        for (id, s) in states where byID[id] == nil && !s.phase.isFinal {
            // A check-in that is still open but no longer in the schedule (the time was changed, or a test).
            all.append(Occurrence(id: id, fireAt: s.fireAt, time: CheckinTime(hour: 0, minute: 0)!))
        }
        all.sort { $0.fireAt < $1.fireAt }

        var desired: Desired = .idle
        let lead = TimeInterval(max(0, settings.leadSeconds))
        let headsUp = TimeInterval(max(0, settings.headsUpSeconds))
        let lateWindow = TimeInterval(max(600, settings.lateWindowSeconds))

        for o in all {
            var s = states[o.id] ?? OccurrenceState(id: o.id, fireAt: o.fireAt)
            if s.phase.isFinal { continue }

            let start = o.fireAt.addingTimeInterval(-lead)
            // The small countdown starts `headsUp` before the check-in itself, as Settings words it
            // ("5 minutes before"), and gives way to the alarm at `start`.
            let headsStart = o.fireAt.addingTimeInterval(-max(headsUp, lead))
            let expiry = o.fireAt.addingTimeInterval(lateWindow)

            if s.phase == .pending && now < headsStart {
                continue
            }

            // Too old to act on.
            if now >= expiry {
                if s.phase == .committed {
                    s.phase = .done
                    s.finishSource = "unconfirmed"
                    events.append(EngineEvent("done", o.id, ["source": "unconfirmed", "visible": "0"]))
                } else {
                    s.phase = .missed
                    s.finishSource = "expired"
                    events.append(EngineEvent("missed", o.id, ["seen": s.firedAt == nil ? "0" : "1"]))
                }
                s.finishedAt = now
                states[o.id] = s
                continue
            }

            if paused && !s.isTest {
                if now >= start {
                    s.phase = .skipped
                    s.finishedAt = now
                    s.finishSource = "paused"
                    states[o.id] = s
                    events.append(EngineEvent("skipped", o.id, ["source": "paused"]))
                }
                continue
            }

            if desired != .idle {
                // Something earlier already owns the screen; this one waits its turn.
                continue
            }

            switch s.phase {
            case .pending:
                if now < start {
                    desired = .headsUp(id: o.id, secondsToCheckin: Int(o.fireAt.timeIntervalSince(now).rounded(.up)))
                } else {
                    s.phase = .ringing
                    s.firedAt = now
                    states[o.id] = s
                    let late = max(0, Int(now.timeIntervalSince(o.fireAt)))
                    events.append(EngineEvent("fired", o.id, ["late_seconds": String(late)]))
                    desired = .takeover(id: o.id, kind: kind(now: now, fireAt: o.fireAt, state: s, slot: remote[o.id]))
                }
            case .ringing:
                // While Samwise's call is ringing or under way, a quieted Mac stays quiet: ringing again
                // would interrupt the check-in itself (1.0.3 did).
                let onCall = remote[o.id]?.callOpen ?? false
                if !onCall, let quiet = s.silencedAt, now.timeIntervalSince(quiet) >= resoundSeconds {
                    s.silencedAt = nil
                    states[o.id] = s
                    events.append(EngineEvent("resound", o.id))
                }
                let k = kind(now: now, fireAt: o.fireAt, state: s, slot: remote[o.id])
                if k == .missedCall || k == .unfinished, let slot = remote[o.id], slot.alertAhead(now), s.warnedFor != slot.tellAt {
                    // This screen says when the trusted people are told; no second notice for the same alert after it.
                    // Reported all the same: it is how Samwise knows the person was told in time.
                    s.warnedFor = slot.tellAt
                    states[o.id] = s
                    events.append(EngineEvent("alert_ahead_seen", o.id, ["why": k == .missedCall ? "missed" : "unfinished", "on": "screen"]))
                }
                desired = .takeover(id: o.id, kind: k)
            case .snoozed:
                if let until = s.snoozeUntil, now < until {
                    desired = .snoozed(id: o.id, secondsLeft: Int(until.timeIntervalSince(now).rounded(.up)))
                } else {
                    s.phase = .ringing
                    s.silencedAt = nil
                    states[o.id] = s
                    events.append(EngineEvent("snooze_over", o.id))
                    desired = .takeover(id: o.id, kind: kind(now: now, fireAt: o.fireAt, state: s, slot: remote[o.id]))
                }
            case .committed:
                if let slot = remote[o.id], slot.callMissed, !slot.done, !s.missedCallShown {
                    // "I am doing my check-in now", but Samwise's call went unanswered.
                    s.phase = .ringing
                    s.silencedAt = nil
                    s.missedCallShown = true
                    if slot.alertAhead(now) { s.warnedFor = slot.tellAt }
                    states[o.id] = s
                    events.append(EngineEvent("call_missed_seen", o.id))
                    desired = .takeover(id: o.id, kind: .missedCall)
                } else if let back = s.returnAt, now >= back {
                    s.phase = .ringing
                    s.silencedAt = nil
                    s.cameBack = true
                    s.returnAt = nil
                    states[o.id] = s
                    events.append(EngineEvent("came_back", o.id))
                    // "Did your check-in happen?", unless Samwise already knows the call was missed or did not count.
                    desired = .takeover(id: o.id, kind: kind(now: now, fireAt: o.fireAt, state: s, slot: remote[o.id]))
                } else if let ask = s.followUpAt, now >= ask {
                    if !s.followUpAsked {
                        s.followUpAsked = true
                        s.returnAt = now.addingTimeInterval(TimeInterval(max(1, settings.followUpGraceMinutes)) * 60)
                        states[o.id] = s
                        events.append(EngineEvent("asked_finished", o.id))
                    }
                    desired = .inProgress(id: o.id, askFinished: true)
                } else {
                    desired = .inProgress(id: o.id, askFinished: false)
                }
            case .done, .skipped, .missed:
                break
            }
        }

        return (desired, events)
    }

    static func kind(now: Date, fireAt: Date, state: OccurrenceState, slot: RemoteSlot?) -> TakeoverKind {
        if state.isTest { return .test }
        if let slot = slot, slot.callMissed, !slot.done { return .missedCall }
        if let slot = slot, slot.callUnfinished, !slot.done { return .unfinished }
        if state.cameBack { return .followUp }
        if now < fireAt { return .countdown }
        if state.snoozesUsed == 0 && now < fireAt.addingTimeInterval(ringingSeconds) { return .ringing }
        // Past the ring, with the call's result still open: never "call Samwise now" at someone who is on the call.
        if let slot = slot, slot.callOpen { return .onCall }
        return .late
    }

    // MARK: - What the user does

    /// A key or a click: the sound stops, the screen stays taken.
    public static func silence(_ id: String, now: Date, states: inout [String: OccurrenceState]) {
        guard var s = states[id], s.phase == .ringing, s.silencedAt == nil else { return }
        s.silencedAt = now
        states[id] = s
    }

    /// The typed line: "I am doing my check-in now".
    public static func commit(_ id: String, now: Date, states: inout [String: OccurrenceState], settings: AlarmSettings) -> EngineEvent? {
        guard var s = states[id], s.phase == .ringing else { return nil }
        if s.isTest {
            s.phase = .done
            s.finishedAt = now
            s.finishSource = "test"
            states[id] = s
            return EngineEvent("test_done", id)
        }
        s.phase = .committed
        s.committedAt = now
        s.followUpAt = now.addingTimeInterval(TimeInterval(max(1, settings.followUpMinutes)) * 60)
        s.followUpAsked = false
        s.returnAt = nil
        states[id] = s
        let delay = Int(now.timeIntervalSince(s.firedAt ?? now))
        return EngineEvent("committed", id, ["seconds_on_screen": String(max(0, delay))])
    }

    public static func canSnooze(_ id: String, states: [String: OccurrenceState], settings: AlarmSettings) -> Bool {
        guard let s = states[id], s.phase == .ringing, !s.isTest else { return false }
        return s.snoozesUsed < settings.maxSnoozes
    }

    public static func snooze(_ id: String, now: Date, states: inout [String: OccurrenceState], settings: AlarmSettings) -> EngineEvent? {
        guard canSnooze(id, states: states, settings: settings), var s = states[id] else { return nil }
        s.phase = .snoozed
        s.snoozesUsed += 1
        s.snoozeUntil = now.addingTimeInterval(TimeInterval(max(1, settings.snoozeMinutes)) * 60)
        states[id] = s
        return EngineEvent("snoozed", id, ["count": String(s.snoozesUsed)])
    }

    /// The typed line: "I choose to skip this check-in". Always available: the user is in charge.
    public static func skip(_ id: String, now: Date, states: inout [String: OccurrenceState], source: String = "skip") -> EngineEvent? {
        guard var s = states[id], !s.phase.isFinal else { return nil }
        s.phase = .skipped
        s.finishedAt = now
        s.finishSource = s.isTest ? "test" : source
        states[id] = s
        return EngineEvent(s.isTest ? "test_done" : "skipped", id, ["source": source])
    }

    /// "I finished".
    public static func finish(_ id: String, now: Date, states: inout [String: OccurrenceState]) -> EngineEvent? {
        guard var s = states[id], s.phase == .committed || s.phase == .ringing else { return nil }
        s.phase = .done
        s.finishedAt = now
        s.finishSource = s.isTest ? "test" : "self"
        states[id] = s
        return EngineEvent(s.isTest ? "test_done" : "done", id, ["source": "self", "visible": "1"])
    }

    /// "Not yet": five more minutes, twice at most; after that the screen is taken again.
    public static func notYet(_ id: String, now: Date, states: inout [String: OccurrenceState]) -> EngineEvent? {
        guard var s = states[id], s.phase == .committed else { return nil }
        s.notYetCount += 1
        if s.notYetCount > 2 {
            s.returnAt = now
        } else {
            s.followUpAt = now.addingTimeInterval(5 * 60)
            s.followUpAsked = false
            s.returnAt = nil
        }
        states[id] = s
        return EngineEvent("not_yet", id, ["count": String(s.notYetCount)])
    }

    /// Called once at launch. An alarm that keeps killing the app is dropped after three restarts.
    public static func noteRelaunch(now: Date, states: inout [String: OccurrenceState]) -> [EngineEvent] {
        var events: [EngineEvent] = []
        for (id, var s) in states where s.phase == .ringing {
            s.relaunches += 1
            if s.relaunches >= 3 {
                s.phase = .skipped
                s.finishedAt = now
                s.finishSource = "crash_guard"
                events.append(EngineEvent("crash_guard", id, ["relaunches": String(s.relaunches)]))
            }
            states[id] = s
        }
        return events
    }

    /// Forget check-ins older than three days.
    /// How firmly the Mac is kept awake for the alarm, because a sleeping Mac cannot ring.
    /// 0: nothing, the Mac sleeps as it always does. 1: the Mac is kept from falling asleep on its own
    /// (the screen may still turn off). 2: the screen is kept on too, while the alarm is on it.
    /// It holds from 30 minutes before a check-in that can still ring until 15 minutes after its time,
    /// and never while the alarms are paused or the user turned this off. Closing the lid still sleeps the Mac.
    public static func awakeLevel(now: Date, occurrences: [Occurrence], states: [String: OccurrenceState], desired: Desired, enabled: Bool, pausedUntil: Date?) -> Int {
        guard enabled else { return 0 }
        if let until = pausedUntil, now < until { return 0 }
        let near = occurrences.contains { o in
            let d = o.fireAt.timeIntervalSince(now)
            guard d <= 30 * 60 && d >= -15 * 60 else { return false }
            return !(states[o.id]?.phase.isFinal ?? false)
        }
        guard near else { return 0 }
        if case .takeover = desired { return 2 }
        return 1
    }

    public static func prune(now: Date, states: inout [String: OccurrenceState]) {
        let cutoff = now.addingTimeInterval(-3 * 86_400)
        for (id, s) in states where s.fireAt < cutoff && s.phase.isFinal {
            states.removeValue(forKey: id)
        }
    }
}
