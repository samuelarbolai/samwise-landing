import XCTest
@testable import SamwiseCore

final class EngineTests: XCTestCase {
    let tz = TimeZone(identifier: "America/Bogota")!
    let id = "2026-11-16T16:00"

    func at(_ s: String) -> Date {
        let f = ISO8601DateFormatter()
        return f.date(from: s)!
    }

    /// One 16:00 check-in in Bogota on 2026-11-16 (21:00 UTC).
    func day() -> [Occurrence] {
        ScheduleMath.occurrences(times: [CheckinTime("16:00")!], timeZone: tz, from: at("2026-11-16T05:00:00Z"), to: at("2026-11-17T04:59:59Z"))
    }

    func step(_ now: String, _ states: inout [String: OccurrenceState], settings: AlarmSettings = AlarmSettings(), remote: [String: RemoteSlot] = [:], pausedUntil: Date? = nil) -> (desired: Desired, events: [EngineEvent]) {
        Engine.step(now: at(now), occurrences: day(), states: &states, settings: settings, remote: remote, pausedUntil: pausedUntil)
    }

    // MARK: Schedule

    func testOccurrenceIsLocalWallClock() {
        let o = day()
        XCTAssertEqual(o.count, 1)
        XCTAssertEqual(o[0].id, id)
        XCTAssertEqual(o[0].fireAt, at("2026-11-16T21:00:00Z"))
        XCTAssertEqual(ScheduleMath.clock(o[0].fireAt, timeZone: tz), "16:00")
    }

    func testNextSkipsToTomorrowAfterTheTime() {
        let n = ScheduleMath.next(after: at("2026-11-16T21:00:01Z"), times: [CheckinTime("16:00")!], timeZone: tz)
        XCTAssertEqual(n?.id, "2026-11-17T16:00")
    }

    func testNextLeavesOutACheckinThatIsAlreadyFinished() {
        let times = [CheckinTime("16:00")!]
        let before = at("2026-11-16T19:00:00Z") // 14:00 in Bogota, two hours before
        XCTAssertEqual(ScheduleMath.next(after: before, times: times, timeZone: tz)?.id, "2026-11-16T16:00")
        XCTAssertEqual(ScheduleMath.next(after: before, times: times, timeZone: tz, finished: ["2026-11-16T16:00"])?.id, "2026-11-17T16:00")
        XCTAssertEqual(ScheduleMath.next(after: before, times: times, timeZone: tz, finished: ["2026-11-15T16:00"])?.id, "2026-11-16T16:00")
    }

    func testTheMacIsKeptAwakeOnlyAroundACheckinThatCanStillRing() {
        func level(_ now: String, states: [String: OccurrenceState] = [:], desired: Desired = .idle, enabled: Bool = true, pausedUntil: Date? = nil) -> Int {
            Engine.awakeLevel(now: at(now), occurrences: day(), states: states, desired: desired, enabled: enabled, pausedUntil: pausedUntil)
        }
        XCTAssertEqual(level("2026-11-16T20:29:00Z"), 0) // 15:29, 31 minutes before
        XCTAssertEqual(level("2026-11-16T20:30:00Z"), 1) // 15:30
        XCTAssertEqual(level("2026-11-16T20:59:30Z", desired: .takeover(id: id, kind: .countdown)), 2)
        XCTAssertEqual(level("2026-11-16T21:03:00Z", desired: .snoozed(id: id, secondsLeft: 120)), 1)
        XCTAssertEqual(level("2026-11-16T21:15:00Z"), 1) // 16:15, still not answered
        XCTAssertEqual(level("2026-11-16T21:15:01Z", desired: .takeover(id: id, kind: .late)), 0) // after that the Mac may sleep again
        XCTAssertEqual(level("2026-11-16T20:45:00Z", enabled: false), 0)
        XCTAssertEqual(level("2026-11-16T20:45:00Z", pausedUntil: at("2026-11-17T05:00:00Z")), 0)
        XCTAssertEqual(level("2026-11-16T20:45:00Z", pausedUntil: at("2026-11-16T20:00:00Z")), 1) // a pause that is over
        for phase in [Phase.done, .skipped, .missed] {
            let states = [id: OccurrenceState(id: id, fireAt: at("2026-11-16T21:00:00Z"), phase: phase)]
            XCTAssertEqual(level("2026-11-16T20:45:00Z", states: states), 0)
        }
        let open = [id: OccurrenceState(id: id, fireAt: at("2026-11-16T21:00:00Z"), phase: .committed)]
        XCTAssertEqual(level("2026-11-16T21:05:00Z", states: open, desired: .inProgress(id: id, askFinished: false)), 1)
    }

    func testTimeListParsing() {
        XCTAssertEqual(CheckinTime.list("16:00, 8:30;21:30 nonsense 25:00").map { $0.description }, ["08:30", "16:00", "21:30"])
        XCTAssertEqual(CheckinTime("16:00:00")?.description, "16:00")
        XCTAssertNil(CheckinTime("24:00"))
    }

    func testCountdownText() {
        XCTAssertEqual(ScheduleMath.countdown(42), "0:42")
        XCTAssertEqual(ScheduleMath.countdown(299), "4:59")
        XCTAssertEqual(ScheduleMath.countdown(3723), "1:02:03")
        XCTAssertEqual(ScheduleMath.countdown(-5), "0:00")
    }

    // MARK: The typed line

    func testPhraseIgnoresSpacesCapitalsPunctuationAndAccents() {
        let c = Copy(language: "en")
        XCTAssertEqual(PhraseMatch.check(typed: "", target: c.commitPhrase), .empty)
        XCTAssertEqual(PhraseMatch.check(typed: "i am doing", target: c.commitPhrase), .onTrack)
        XCTAssertEqual(PhraseMatch.check(typed: "I AM DOING MY CHECKIN NOW", target: c.commitPhrase), .complete)
        XCTAssertEqual(PhraseMatch.check(typed: "i am doing my check in now.", target: c.commitPhrase), .complete)
        XCTAssertEqual(PhraseMatch.check(typed: "i will", target: c.commitPhrase), .offTrack)
        XCTAssertEqual(PhraseMatch.normalize("Elijó Saltarme"), "elijosaltarme")
    }

    func testCommitAndSkipLinesNeverShadowEachOther() {
        for lang in ["en", "es"] {
            let c = Copy(language: lang)
            let a = PhraseMatch.normalize(c.commitPhrase)
            let b = PhraseMatch.normalize(c.skipPhrase)
            XCTAssertFalse(a.hasPrefix(b), lang)
            XCTAssertFalse(b.hasPrefix(a), lang)
        }
    }

    // MARK: A normal afternoon

    func testQuietUntilTheHeadsUp() {
        var s: [String: OccurrenceState] = [:]
        let r = step("2026-11-16T20:50:00Z", &s)
        XCTAssertEqual(r.desired, .idle)
        XCTAssertTrue(r.events.isEmpty)
        XCTAssertTrue(s.isEmpty)
    }

    func testHeadsUpThenTakeoverThenRingingThenLate() {
        var s: [String: OccurrenceState] = [:]
        // The small countdown comes five minutes before the check-in itself, not before the alarm.
        XCTAssertEqual(step("2026-11-16T20:54:30Z", &s).desired, .idle)
        XCTAssertTrue(s.isEmpty)
        XCTAssertEqual(step("2026-11-16T20:55:00Z", &s).desired, .headsUp(id: id, secondsToCheckin: 300))
        XCTAssertEqual(step("2026-11-16T20:55:30Z", &s).desired, .headsUp(id: id, secondsToCheckin: 270))

        let fired = step("2026-11-16T20:59:00Z", &s)
        XCTAssertEqual(fired.desired, .takeover(id: id, kind: .countdown))
        XCTAssertEqual(fired.events, [EngineEvent("fired", id, ["late_seconds": "0"])])
        XCTAssertEqual(s[id]?.phase, .ringing)

        // No second "fired" for the same check-in.
        XCTAssertTrue(step("2026-11-16T20:59:30Z", &s).events.isEmpty)

        XCTAssertEqual(step("2026-11-16T21:00:10Z", &s).desired, .takeover(id: id, kind: .ringing))
        XCTAssertEqual(step("2026-11-16T21:03:00Z", &s).desired, .takeover(id: id, kind: .late))
    }

    func testTypedLineGivesTheScreenBackAndAsksLater() {
        var s: [String: OccurrenceState] = [:]
        _ = step("2026-11-16T20:59:00Z", &s)
        let e = Engine.commit(id, now: at("2026-11-16T21:00:20Z"), states: &s, settings: AlarmSettings())
        XCTAssertEqual(e, EngineEvent("committed", id, ["seconds_on_screen": "80"]))

        XCTAssertEqual(step("2026-11-16T21:10:00Z", &s).desired, .inProgress(id: id, askFinished: false))

        let ask = step("2026-11-16T21:15:30Z", &s)
        XCTAssertEqual(ask.desired, .inProgress(id: id, askFinished: true))
        XCTAssertEqual(ask.events, [EngineEvent("asked_finished", id)])
        // Asked only once.
        XCTAssertTrue(step("2026-11-16T21:16:00Z", &s).events.isEmpty)

        // No answer for ten minutes: the screen is taken again.
        let back = step("2026-11-16T21:25:31Z", &s)
        XCTAssertEqual(back.desired, .takeover(id: id, kind: .followUp))
        XCTAssertEqual(back.events, [EngineEvent("came_back", id)])

        XCTAssertNotNil(Engine.finish(id, now: at("2026-11-16T21:26:00Z"), states: &s))
        XCTAssertEqual(step("2026-11-16T21:26:01Z", &s).desired, .idle)
        XCTAssertEqual(s[id]?.phase, .done)
        XCTAssertEqual(s[id]?.finishSource, "self")
    }

    func testNotYetTwiceThenTheScreenComesBack() {
        var s: [String: OccurrenceState] = [:]
        _ = step("2026-11-16T20:59:00Z", &s)
        _ = Engine.commit(id, now: at("2026-11-16T21:00:00Z"), states: &s, settings: AlarmSettings())
        _ = step("2026-11-16T21:15:00Z", &s)
        _ = Engine.notYet(id, now: at("2026-11-16T21:15:10Z"), states: &s)
        XCTAssertEqual(step("2026-11-16T21:16:00Z", &s).desired, .inProgress(id: id, askFinished: false))
        XCTAssertEqual(step("2026-11-16T21:20:10Z", &s).desired, .inProgress(id: id, askFinished: true))
        _ = Engine.notYet(id, now: at("2026-11-16T21:20:20Z"), states: &s)
        _ = step("2026-11-16T21:25:20Z", &s)
        _ = Engine.notYet(id, now: at("2026-11-16T21:25:30Z"), states: &s)
        XCTAssertEqual(step("2026-11-16T21:25:31Z", &s).desired, .takeover(id: id, kind: .followUp))
    }

    func testQuietedRingComesBackAfterTwoMinutes() {
        var s: [String: OccurrenceState] = [:]
        _ = step("2026-11-16T21:00:00Z", &s)
        Engine.silence(id, now: at("2026-11-16T21:00:10Z"), states: &s)
        XCTAssertNotNil(s[id]?.silencedAt)
        XCTAssertTrue(step("2026-11-16T21:01:00Z", &s).events.isEmpty)
        XCTAssertNotNil(s[id]?.silencedAt)
        let r = step("2026-11-16T21:02:10Z", &s)
        XCTAssertEqual(r.events, [EngineEvent("resound", id)])
        XCTAssertNil(s[id]?.silencedAt)
        XCTAssertEqual(r.desired, .takeover(id: id, kind: .ringing))
    }

    // MARK: Snooze and skip: the user is always in charge

    func testSnoozeTwiceAtMostAndItComesBack() {
        var s: [String: OccurrenceState] = [:]
        let settings = AlarmSettings()
        _ = step("2026-11-16T20:59:00Z", &s)
        XCTAssertTrue(Engine.canSnooze(id, states: s, settings: settings))
        XCTAssertEqual(Engine.snooze(id, now: at("2026-11-16T21:00:00Z"), states: &s, settings: settings), EngineEvent("snoozed", id, ["count": "1"]))
        XCTAssertEqual(step("2026-11-16T21:02:00Z", &s).desired, .snoozed(id: id, secondsLeft: 180))

        let back = step("2026-11-16T21:05:00Z", &s)
        XCTAssertEqual(back.desired, .takeover(id: id, kind: .late))
        XCTAssertEqual(back.events, [EngineEvent("snooze_over", id)])

        XCTAssertNotNil(Engine.snooze(id, now: at("2026-11-16T21:05:10Z"), states: &s, settings: settings))
        _ = step("2026-11-16T21:10:10Z", &s)
        XCTAssertFalse(Engine.canSnooze(id, states: s, settings: settings))
        XCTAssertNil(Engine.snooze(id, now: at("2026-11-16T21:10:20Z"), states: &s, settings: settings))
        XCTAssertEqual(step("2026-11-16T21:10:30Z", &s).desired, .takeover(id: id, kind: .late))
    }

    func testSkipAlwaysClearsTheScreen() {
        var s: [String: OccurrenceState] = [:]
        _ = step("2026-11-16T20:59:00Z", &s)
        XCTAssertEqual(Engine.skip(id, now: at("2026-11-16T21:00:05Z"), states: &s), EngineEvent("skipped", id, ["source": "skip"]))
        XCTAssertEqual(step("2026-11-16T21:00:06Z", &s).desired, .idle)
        XCTAssertEqual(step("2026-11-16T22:00:00Z", &s).desired, .idle)
    }

    func testPausedAlarmsStayQuiet() {
        var s: [String: OccurrenceState] = [:]
        let until = at("2026-11-17T12:00:00Z")
        XCTAssertEqual(step("2026-11-16T20:55:00Z", &s, pausedUntil: until).desired, .idle)
        let r = step("2026-11-16T20:59:00Z", &s, pausedUntil: until)
        XCTAssertEqual(r.desired, .idle)
        XCTAssertEqual(r.events, [EngineEvent("skipped", id, ["source": "paused"])])
        // Turning alarms back on later does not bring an old check-in back.
        XCTAssertEqual(step("2026-11-16T21:30:00Z", &s).desired, .idle)
    }

    // MARK: What Samwise reports

    func testNoAlarmWhenSamwiseAlreadyCountsTheCheckin() {
        var s: [String: OccurrenceState] = [:]
        let remote = [id: RemoteSlot(id: id, done: true, doneSource: "written")]
        let r = step("2026-11-16T20:59:00Z", &s, remote: remote)
        XCTAssertEqual(r.desired, .idle)
        XCTAssertEqual(r.events, [EngineEvent("done", id, ["source": "samwise_entry", "visible": "0"])])
        XCTAssertEqual(step("2026-11-16T21:00:30Z", &s, remote: remote).desired, .idle)
    }

    func testReachedCallEndsTheAlarmOnItsOwn() {
        var s: [String: OccurrenceState] = [:]
        _ = step("2026-11-16T20:59:00Z", &s)
        let remote = [id: RemoteSlot(id: id, done: true, doneSource: "call", callPlaced: true)]
        let r = step("2026-11-16T21:08:00Z", &s, remote: remote)
        XCTAssertEqual(r.desired, .idle)
        XCTAssertEqual(r.events, [EngineEvent("done", id, ["source": "samwise_call", "visible": "1"])])
    }

    func testMissedCallTakesTheScreenAgainOnce() {
        var s: [String: OccurrenceState] = [:]
        _ = step("2026-11-16T20:59:00Z", &s)
        _ = Engine.commit(id, now: at("2026-11-16T21:00:05Z"), states: &s, settings: AlarmSettings())
        let remote = [id: RemoteSlot(id: id, callPlaced: true, callMissed: true)]
        let r = step("2026-11-16T21:02:00Z", &s, remote: remote)
        XCTAssertEqual(r.desired, .takeover(id: id, kind: .missedCall))
        XCTAssertEqual(r.events, [EngineEvent("call_missed_seen", id)])

        // Typing the line again gives the screen back; the same missed call does not take it twice.
        _ = Engine.commit(id, now: at("2026-11-16T21:02:30Z"), states: &s, settings: AlarmSettings())
        XCTAssertEqual(step("2026-11-16T21:03:00Z", &s, remote: remote).desired, .inProgress(id: id, askFinished: false))
    }

    // MARK: A real call next to the alarm (1.0.3 got three things wrong here)

    /// Samwise's call is placed and its result is not in yet.
    func onThePhone() -> [String: RemoteSlot] { [id: RemoteSlot(id: id, callPlaced: true, callOpen: true)] }
    /// The call was answered and Samwise does not count it; the trusted people are told at 16:37:10.
    func notCounted(tellAt: String? = "2026-11-16T21:37:10Z", toldAt: String? = nil) -> [String: RemoteSlot] {
        [id: RemoteSlot(id: id, callPlaced: true, callUnfinished: true, tellAt: tellAt, toldAt: toldAt)]
    }

    func testAQuietedMacStaysQuietWhileSamwiseIsOnThePhone() {
        var s: [String: OccurrenceState] = [:]
        _ = step("2026-11-16T21:00:00Z", &s)
        Engine.silence(id, now: at("2026-11-16T21:00:08Z"), states: &s)

        // 16:02:08: two minutes after the key press. 1.0.3 rang again here, into the call.
        let during = step("2026-11-16T21:02:08Z", &s, remote: onThePhone())
        XCTAssertTrue(during.events.isEmpty)
        XCTAssertNotNil(s[id]?.silencedAt)
        XCTAssertEqual(during.desired, .takeover(id: id, kind: .ringing))

        // Past the ring with the call still open: the screen says Samwise called, not "call Samwise now".
        let later = step("2026-11-16T21:04:00Z", &s, remote: onThePhone())
        XCTAssertEqual(later.desired, .takeover(id: id, kind: .onCall))
        XCTAssertTrue(later.events.isEmpty)
        XCTAssertNotNil(s[id]?.silencedAt)

        // The result is in and the call did not count: the screen says so, and the Mac rings again.
        let after = step("2026-11-16T21:07:49Z", &s, remote: notCounted())
        XCTAssertEqual(after.desired, .takeover(id: id, kind: .unfinished))
        // It also reports that this screen named the hour: that is how Samwise knows the person was told in time.
        XCTAssertEqual(after.events, [EngineEvent("resound", id), EngineEvent("alert_ahead_seen", id, ["why": "unfinished", "on": "screen"])])
        XCTAssertNil(s[id]?.silencedAt)
        XCTAssertTrue(step("2026-11-16T21:07:50Z", &s, remote: notCounted()).events.isEmpty)
        // That screen names the hour, so no separate warning follows for the same alert.
        XCTAssertEqual(s[id]?.warnedFor, "2026-11-16T21:37:10Z")
        _ = Engine.commit(id, now: at("2026-11-16T21:08:30Z"), states: &s, settings: AlarmSettings())
        XCTAssertTrue(step("2026-11-16T21:08:31Z", &s, remote: notCounted()).events.isEmpty)
    }

    func testWithoutACallAQuietedRingStillComesBack() {
        var s: [String: OccurrenceState] = [:]
        _ = step("2026-11-16T21:00:00Z", &s)
        Engine.silence(id, now: at("2026-11-16T21:00:08Z"), states: &s)
        // A call that was placed and already has its result does not keep the Mac quiet.
        let placed = [id: RemoteSlot(id: id, callPlaced: true)]
        XCTAssertEqual(step("2026-11-16T21:02:08Z", &s, remote: placed).events, [EngineEvent("resound", id)])
    }

    func testACallThatDidNotCountWarnsOnceAndLeavesTheScreenAlone() {
        var s: [String: OccurrenceState] = [:]
        _ = step("2026-11-16T20:59:00Z", &s)
        _ = Engine.commit(id, now: at("2026-11-16T21:02:25Z"), states: &s, settings: AlarmSettings())
        XCTAssertTrue(step("2026-11-16T21:03:00Z", &s, remote: onThePhone()).events.isEmpty)

        // 16:07:49: the call's result arrives. 1.0.3 said "Check-in done." here.
        let r = step("2026-11-16T21:07:49Z", &s, remote: notCounted())
        XCTAssertEqual(r.desired, .inProgress(id: id, askFinished: false))
        XCTAssertEqual(r.events, [EngineEvent("alert_ahead_seen", id, ["why": "unfinished", "on": "panel"])])
        XCTAssertEqual(s[id]?.phase, .committed)
        // Said once.
        XCTAssertTrue(step("2026-11-16T21:08:19Z", &s, remote: notCounted()).events.isEmpty)

        // "I finished" is the user's word for this Mac. It does not change what Samwise does, and nothing new is announced.
        XCTAssertNotNil(Engine.finish(id, now: at("2026-11-16T21:09:00Z"), states: &s))
        let done = step("2026-11-16T21:09:01Z", &s, remote: notCounted())
        XCTAssertEqual(done.desired, .idle)
        XCTAssertTrue(done.events.isEmpty)
        XCTAssertEqual(s[id]?.finishSource, "self")

        // The person calls back and that call does not count either: it has its own time and its own warning.
        let second = step("2026-11-16T21:30:00Z", &s, remote: notCounted(tellAt: "2026-11-16T22:05:00Z"))
        XCTAssertEqual(second.events, [EngineEvent("alert_ahead_seen", id, ["why": "unfinished", "on": "panel"])])
        XCTAssertEqual(second.desired, .idle)
    }

    func testEndedByOwnWordIsStillWarnedWhenTheCallWentUnanswered() {
        var s: [String: OccurrenceState] = [:]
        _ = step("2026-11-16T20:59:00Z", &s)
        _ = Engine.commit(id, now: at("2026-11-16T20:59:30Z"), states: &s, settings: AlarmSettings())
        XCTAssertNotNil(Engine.finish(id, now: at("2026-11-16T20:59:50Z"), states: &s))
        let missed = [id: RemoteSlot(id: id, callPlaced: true, callMissed: true, tellAt: "2026-11-16T21:35:41Z")]
        let r = step("2026-11-16T21:06:00Z", &s, remote: missed)
        XCTAssertEqual(r.desired, .idle)
        XCTAssertEqual(r.events, [EngineEvent("alert_ahead_seen", id, ["why": "missed", "on": "panel"])])
        XCTAssertTrue(step("2026-11-16T21:06:30Z", &s, remote: missed).events.isEmpty)
    }

    func testAMissedCallAfterTheTypedLineTakesTheScreenAndThatIsTheWarning() {
        var s: [String: OccurrenceState] = [:]
        _ = step("2026-11-16T20:59:00Z", &s)
        _ = Engine.commit(id, now: at("2026-11-16T21:00:05Z"), states: &s, settings: AlarmSettings())
        let missed = [id: RemoteSlot(id: id, callPlaced: true, callMissed: true, tellAt: "2026-11-16T21:35:41Z")]
        let r = step("2026-11-16T21:06:00Z", &s, remote: missed)
        XCTAssertEqual(r.desired, .takeover(id: id, kind: .missedCall))
        XCTAssertEqual(r.events, [EngineEvent("call_missed_seen", id)])
        _ = Engine.commit(id, now: at("2026-11-16T21:06:30Z"), states: &s, settings: AlarmSettings())
        let after = step("2026-11-16T21:06:31Z", &s, remote: missed)
        XCTAssertEqual(after.desired, .inProgress(id: id, askFinished: false))
        XCTAssertTrue(after.events.isEmpty)
    }

    func testNoWarningWhenNothingIsAheadOrSamwiseCountsTheCheckin() {
        // The trusted people were already told: nothing is ahead any more.
        var s: [String: OccurrenceState] = [:]
        _ = step("2026-11-16T20:59:00Z", &s)
        _ = Engine.commit(id, now: at("2026-11-16T21:02:25Z"), states: &s, settings: AlarmSettings())
        let told = step("2026-11-16T21:38:00Z", &s, remote: notCounted(toldAt: "2026-11-16T21:37:36Z"))
        XCTAssertFalse(told.events.contains { $0.kind == "alert_ahead_seen" })

        // No trusted people, so no time: the call did not count, and nobody is told.
        var t: [String: OccurrenceState] = [:]
        _ = step("2026-11-16T20:59:00Z", &t)
        _ = Engine.commit(id, now: at("2026-11-16T21:02:25Z"), states: &t, settings: AlarmSettings())
        XCTAssertTrue(step("2026-11-16T21:07:49Z", &t, remote: notCounted(tellAt: nil)).events.isEmpty)

        // Samwise counts the check-in: the alarm ends, with no warning.
        var u: [String: OccurrenceState] = [:]
        _ = step("2026-11-16T20:59:00Z", &u)
        _ = Engine.commit(id, now: at("2026-11-16T21:02:25Z"), states: &u, settings: AlarmSettings())
        let good = [id: RemoteSlot(id: id, done: true, doneSource: "call", callPlaced: true, tellAt: "2026-11-16T23:00:00Z")]
        XCTAssertEqual(step("2026-11-16T21:07:49Z", &u, remote: good).events, [EngineEvent("done", id, ["source": "samwise_call", "visible": "1"])])

        // A test alarm never gets one.
        var v: [String: OccurrenceState] = [:]
        v[id] = OccurrenceState(id: id, fireAt: at("2026-11-16T21:00:00Z"), phase: .committed, isTest: true)
        XCTAssertFalse(step("2026-11-16T21:07:49Z", &v, remote: notCounted()).events.contains { $0.kind == "alert_ahead_seen" })
    }

    func testTheScreenThatComesBackSaysTheCallDidNotCount() {
        var s: [String: OccurrenceState] = [:]
        _ = step("2026-11-16T20:59:00Z", &s)
        _ = Engine.commit(id, now: at("2026-11-16T21:02:25Z"), states: &s, settings: AlarmSettings())
        _ = step("2026-11-16T21:07:49Z", &s, remote: notCounted())
        XCTAssertEqual(step("2026-11-16T21:17:30Z", &s, remote: notCounted()).desired, .inProgress(id: id, askFinished: true))
        let back = step("2026-11-16T21:27:31Z", &s, remote: notCounted())
        XCTAssertEqual(back.desired, .takeover(id: id, kind: .unfinished))
        XCTAssertEqual(back.events, [EngineEvent("came_back", id)])
        XCTAssertEqual(s[id]?.cameBack, true)
    }

    func testAStateFileFromAnOlderVersionStillLoads() throws {
        var s: [String: OccurrenceState] = [:]
        _ = step("2026-11-16T20:59:00Z", &s)
        let data = try JSONEncoder().encode(s)
        // 1.0.3 wrote no "warnedFor" key; a state without it is exactly what this version writes before any warning.
        XCTAssertFalse(String(decoding: data, as: UTF8.self).contains("warnedFor"))
        XCTAssertNil(try JSONDecoder().decode([String: OccurrenceState].self, from: data)[id]?.warnedFor)
    }

    // MARK: Sleep, restarts, old check-ins

    func testFoundLateStillFiresInsideTheWindow() {
        var s: [String: OccurrenceState] = [:]
        let r = step("2026-11-16T23:00:00Z", &s)
        XCTAssertEqual(r.desired, .takeover(id: id, kind: .late))
        XCTAssertEqual(r.events, [EngineEvent("fired", id, ["late_seconds": "7200"])])
    }

    func testTooOldIsMarkedMissedAndNeverShown() {
        var s: [String: OccurrenceState] = [:]
        let r = step("2026-11-17T01:00:01Z", &s)
        XCTAssertEqual(r.desired, .idle)
        XCTAssertEqual(r.events, [EngineEvent("missed", id, ["seen": "0"])])
        XCTAssertEqual(s[id]?.phase, .missed)
    }

    func testStateSurvivesARestart() throws {
        var s: [String: OccurrenceState] = [:]
        _ = step("2026-11-16T20:59:00Z", &s)
        let data = try JSONEncoder().encode(s)
        var restored = try JSONDecoder().decode([String: OccurrenceState].self, from: data)
        XCTAssertEqual(restored, s)
        let r = step("2026-11-16T21:00:30Z", &restored)
        XCTAssertEqual(r.desired, .takeover(id: id, kind: .ringing))
        XCTAssertTrue(r.events.isEmpty)
    }

    func testThreeRestartsWhileRingingDropTheTakeover() {
        var s: [String: OccurrenceState] = [:]
        _ = step("2026-11-16T20:59:00Z", &s)
        XCTAssertTrue(Engine.noteRelaunch(now: at("2026-11-16T21:00:00Z"), states: &s).isEmpty)
        XCTAssertTrue(Engine.noteRelaunch(now: at("2026-11-16T21:00:10Z"), states: &s).isEmpty)
        XCTAssertEqual(step("2026-11-16T21:00:11Z", &s).desired, .takeover(id: id, kind: .ringing))
        let e = Engine.noteRelaunch(now: at("2026-11-16T21:00:20Z"), states: &s)
        XCTAssertEqual(e, [EngineEvent("crash_guard", id, ["relaunches": "3"])])
        XCTAssertEqual(step("2026-11-16T21:00:21Z", &s).desired, .idle)
    }

    func testPruneForgetsOldFinishedCheckins() {
        var s: [String: OccurrenceState] = [:]
        var old = OccurrenceState(id: "2026-11-10T16:00", fireAt: at("2026-11-10T21:00:00Z"), phase: .done)
        old.finishedAt = at("2026-11-10T21:20:00Z")
        s[old.id] = old
        s[id] = OccurrenceState(id: id, fireAt: at("2026-11-16T21:00:00Z"), phase: .done)
        Engine.prune(now: at("2026-11-16T22:00:00Z"), states: &s)
        XCTAssertEqual(Array(s.keys), [id])
    }

    // MARK: Test alarm

    func testTestAlarmNeverCountsAsACheckin() {
        var s: [String: OccurrenceState] = [:]
        let now = at("2026-11-16T15:00:00Z")
        s["test-1"] = OccurrenceState(id: "test-1", fireAt: now, phase: .pending, isTest: true)
        let r = Engine.step(now: now, occurrences: [], states: &s, settings: AlarmSettings())
        XCTAssertEqual(r.desired, .takeover(id: "test-1", kind: .test))
        XCTAssertFalse(Engine.canSnooze("test-1", states: s, settings: AlarmSettings()))
        XCTAssertEqual(Engine.commit("test-1", now: now.addingTimeInterval(5), states: &s, settings: AlarmSettings()), EngineEvent("test_done", "test-1"))
        XCTAssertEqual(Engine.step(now: now.addingTimeInterval(6), occurrences: [], states: &s, settings: AlarmSettings()).desired, .idle)
    }

    func testTestAlarmRunsEvenWhenPaused() {
        var s: [String: OccurrenceState] = [:]
        let now = at("2026-11-16T15:00:00Z")
        s["test-1"] = OccurrenceState(id: "test-1", fireAt: now, phase: .pending, isTest: true)
        let r = Engine.step(now: now, occurrences: [], states: &s, settings: AlarmSettings(), pausedUntil: now.addingTimeInterval(3600))
        XCTAssertEqual(r.desired, .takeover(id: "test-1", kind: .test))
    }

    // MARK: What the server sends

    func testConfigDecodesFromTheServerShape() throws {
        let json = """
        {
          "user": {"first_name": "Alex", "language": "es", "timezone": "America/Bogota"},
          "checkins": [{"time": "16:00", "words": [{"title": "Opening", "body": "My own words."}]}, {"time": "bad"}],
          "slots": [{"id": "2026-11-16T16:00", "done": false, "will_call": true, "call_placed": true, "call_missed": true}],
          "tasks": [{"id": 7, "title": "Call a friend", "detail": null}],
          "support": {"active": true, "grace_minutes": 30},
          "journal_url": "https://example.com/doc",
          "samwise_number": "+1 555 010 0000",
          "latest_version": "1.0.0",
          "unknown_future_key": {"a": 1}
        }
        """
        let c = try RemoteConfig.decode(Data(json.utf8))
        XCTAssertEqual(c.user?.firstName, "Alex")
        XCTAssertEqual(c.checkinTimes.map { $0.description }, ["16:00"])
        XCTAssertEqual(c.words(for: CheckinTime("16:00")!).first?.title, "Opening")
        XCTAssertEqual(c.slot("2026-11-16T16:00")?.callMissed, true)
        XCTAssertEqual(c.slot("2026-11-16T16:00")?.done, false)
        // Keys added in 1.0.4 are missing here, as from an older server: nothing is assumed.
        XCTAssertEqual(c.slot("2026-11-16T16:00")?.callOpen, false)
        XCTAssertEqual(c.slot("2026-11-16T16:00")?.callUnfinished, false)
        XCTAssertNil(c.slot("2026-11-16T16:00")?.tellAt)
        XCTAssertEqual(c.slot("2026-11-16T16:00")?.alertAhead(at("2026-11-16T21:10:00Z")), false)
        XCTAssertEqual(c.tasks?.first?.id, 7)
        XCTAssertEqual(c.support?.graceMinutes, 30)
        XCTAssertEqual(c.timeZone?.identifier, "America/Bogota")
        XCTAssertEqual(c.journalUrl, "https://example.com/doc")
    }

    /// The exact shape samwise.life sends (lib/mac/server.ts): opening words without a title, a journal tab per check-in.
    func testConfigDecodesWhatSamwiseLifeSends() throws {
        let json = """
        {
          "user": {"first_name": "Alex", "language": "en", "timezone": "America/Bogota"},
          "checkins": [{"time": "16:00", "words": [{"title": "", "body": "My opening words."}], "journal_url": "https://example.com/doc?tab=t.1"},
                       {"time": "21:30", "words": [], "journal_url": null}],
          "slots": [{"id": "2026-11-16T16:00", "done": true, "done_source": "written", "will_call": false, "call_placed": false, "call_open": false,
                     "call_missed": false, "call_unfinished": false, "tell_at": null, "told_at": null},
                    {"id": "2026-11-16T21:30", "done": false, "done_source": null, "will_call": true, "call_placed": true, "call_open": false,
                     "call_missed": false, "call_unfinished": true, "tell_at": "2026-11-17T03:07:10Z", "told_at": null},
                    {"id": "2026-11-15T21:30", "done": false, "done_source": null, "will_call": true, "call_placed": true, "call_open": true,
                     "call_missed": false, "call_unfinished": false, "tell_at": null, "told_at": "2026-11-16T03:07:36Z"}],
          "tasks": [{"id": 12, "title": "Call a friend", "detail": ""}],
          "support": {"active": true, "grace_minutes": 30},
          "journal_url": "https://example.com/doc",
          "samwise_number": "+1 555 010 0000",
          "latest_version": "1.0.0",
          "download_url": "https://example.com/mac",
          "show_words_right_away": false
        }
        """
        let c = try RemoteConfig.decode(Data(json.utf8))
        XCTAssertEqual(c.checkinTimes.map { $0.description }, ["16:00", "21:30"])
        XCTAssertEqual(c.checkins?.first?.journalUrl, "https://example.com/doc?tab=t.1")
        XCTAssertNil(c.checkins?.last?.journalUrl)
        XCTAssertEqual(c.words(for: CheckinTime("16:00")!).first?.title, "")
        XCTAssertEqual(c.words(for: CheckinTime("16:00")!).first?.body, "My opening words.")
        XCTAssertTrue(c.words(for: CheckinTime("21:30")!).isEmpty)
        XCTAssertEqual(c.slot("2026-11-16T16:00")?.doneSource, "written")
        XCTAssertEqual(c.slot("2026-11-16T21:30")?.willCall, true)
        let night = c.slot("2026-11-16T21:30")
        XCTAssertEqual(night?.callUnfinished, true)
        XCTAssertEqual(night?.tellDate, at("2026-11-17T03:07:10Z"))
        XCTAssertEqual(night?.alertAhead(at("2026-11-17T03:07:09Z")), true)
        XCTAssertEqual(night?.alertAhead(at("2026-11-17T03:07:10Z")), false)
        XCTAssertNil(night?.toldDate)
        XCTAssertEqual(c.slot("2026-11-15T21:30")?.callOpen, true)
        XCTAssertEqual(c.slot("2026-11-15T21:30")?.toldDate, at("2026-11-16T03:07:36Z"))
        XCTAssertEqual(c.slot("2026-11-16T16:00")?.alertAhead(at("2026-11-16T21:00:00Z")), false)
        XCTAssertEqual(c.showWordsRightAway, false)
        XCTAssertEqual(c.downloadUrl, "https://example.com/mac")
    }

    func testOldSettingsFileStillLoads() throws {
        let s = try JSONDecoder().decode(AlarmSettings.self, from: Data("{\"snoozeMinutes\": 3}".utf8))
        XCTAssertEqual(s.snoozeMinutes, 3)
        XCTAssertEqual(s.maxSnoozes, 2)
        XCTAssertEqual(s.localTimes, ["16:00"])
    }

    // MARK: Wording rules

    func testCallIsOnlyPromisedWhenTheServerConfirmedIt() {
        let c = Copy(language: "en")
        let withCall = c.subtitle(.ringing, time: "16:00", minutesLate: 0, willCall: true, number: "+1 555 010 0000", deadline: "16:30", startedAt: nil)
        let without = c.subtitle(.ringing, time: "16:00", minutesLate: 0, willCall: false, number: nil, deadline: nil, startedAt: nil)
        XCTAssertTrue(withCall.contains("calling your phone"))
        XCTAssertFalse(without.lowercased().contains("call"))
        XCTAssertFalse(c.skipConsequence(supportActive: false).contains("trusted people"))
        XCTAssertTrue(c.skipConsequence(supportActive: true).contains("trusted people"))
    }

    func testEveryLineExistsInBothLanguages() {
        for lang in ["en", "es"] {
            let c = Copy(language: lang)
            for kind in [TakeoverKind.countdown, .ringing, .late, .followUp, .missedCall, .onCall, .unfinished, .test] {
                XCTAssertFalse(c.title(kind, time: "16:00", secondsToCheckin: 42).isEmpty)
                XCTAssertFalse(c.subtitle(kind, time: "16:00", minutesLate: 12, willCall: true, number: "+1 555 010 0000", deadline: "16:30", startedAt: "16:01").isEmpty)
            }
            for d in -3...9 { XCTAssertFalse(c.line(day: d).isEmpty) }
            XCTAssertFalse(c.why.contains("!"))
            for missed in [true, false] {
                let warning = c.alertAhead(deadline: "16:37", missed: missed)
                XCTAssertTrue(warning.contains("16:37"), lang)
                // Two lines, so the panel stays narrow.
                XCTAssertEqual(warning.split(separator: "\n").count, 2, lang)
            }
            XCTAssertNotEqual(c.alertAhead(deadline: "16:37", missed: true), c.alertAhead(deadline: "16:37", missed: false))
            XCTAssertFalse(c.gotIt.isEmpty)
            XCTAssertNotEqual(c.soundHint(call: true), c.soundHint(call: false))
        }
    }

    func testACallThatDidNotCountNeverPromisesMoreThanSamwiseDoes() {
        let c = Copy(language: "en")
        let number = "+1 555 010 0000"
        // Ahead: the hour, and the way to stop it.
        let ahead = c.subtitle(.unfinished, time: "16:00", minutesLate: 8, willCall: true, number: number, deadline: "16:37", startedAt: nil)
        XCTAssertTrue(ahead.contains("at about 16:37"))
        XCTAssertTrue(ahead.contains("trusted people"))
        XCTAssertTrue(ahead.contains(number))
        // Told: said as a fact, with the hour it happened.
        let told = c.subtitle(.unfinished, time: "16:00", minutesLate: 40, willCall: true, number: number, deadline: nil, startedAt: nil, toldAt: "16:37")
        XCTAssertTrue(told.contains("called your trusted people at 16:37"))
        // Still ahead for a second call: what is coming is said first.
        let both = c.subtitle(.unfinished, time: "16:00", minutesLate: 40, willCall: true, number: number, deadline: "17:05", startedAt: nil, toldAt: "16:37")
        XCTAssertTrue(both.contains("at about 17:05"))
        // Nobody to tell: trusted people are not mentioned at all.
        let alone = c.subtitle(.unfinished, time: "16:00", minutesLate: 8, willCall: true, number: number, deadline: nil, startedAt: nil)
        XCTAssertFalse(alone.contains("trusted people"))
        XCTAssertTrue(alone.contains(number))
        // While the call is open the Mac does not tell someone who is on it to call Samwise "now".
        let onCall = c.subtitle(.onCall, time: "16:00", minutesLate: 3, willCall: true, number: number, deadline: "16:30", startedAt: nil)
        XCTAssertFalse(onCall.contains("Call Samwise now"))
        XCTAssertTrue(onCall.contains("stays quiet"))
        // The sound hint mentions Samwise's call only for someone Samwise phones.
        XCTAssertFalse(c.soundHint(call: false).contains("Samwise"))
        XCTAssertTrue(c.soundHint(call: true).contains("Samwise's call"))
    }
}
