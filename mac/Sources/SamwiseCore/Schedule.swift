import Foundation

/// A wall-clock check-in time, e.g. 16:00, in the schedule's time zone.
public struct CheckinTime: Codable, Hashable, Comparable, CustomStringConvertible {
    public let hour: Int
    public let minute: Int

    public init?(hour: Int, minute: Int) {
        guard (0...23).contains(hour), (0...59).contains(minute) else { return nil }
        self.hour = hour
        self.minute = minute
    }

    /// Accepts "16:00", "16:00:00" and "7:05".
    public init?(_ text: String) {
        let parts = text.trimmingCharacters(in: .whitespacesAndNewlines).split(separator: ":")
        guard parts.count >= 2, parts.count <= 3, let h = Int(parts[0]), let m = Int(parts[1]) else { return nil }
        self.init(hour: h, minute: m)
    }

    public var description: String { String(format: "%02d:%02d", hour, minute) }

    public static func < (a: CheckinTime, b: CheckinTime) -> Bool {
        (a.hour, a.minute) < (b.hour, b.minute)
    }

    /// "16:00, 21:30" -> [16:00, 21:30]. Unreadable pieces are dropped.
    public static func list(_ text: String) -> [CheckinTime] {
        let pieces = text.split(whereSeparator: { $0 == "," || $0 == ";" || $0 == " " || $0 == "\n" })
        var seen = Set<CheckinTime>()
        var out: [CheckinTime] = []
        for p in pieces {
            if let t = CheckinTime(String(p)), !seen.contains(t) {
                seen.insert(t)
                out.append(t)
            }
        }
        return out.sorted()
    }
}

/// One check-in on one day. `id` is the local date and time in the schedule's zone ("2026-11-16T16:00"),
/// the same key the server uses, so the two sides talk about the same check-in.
public struct Occurrence: Hashable, Codable {
    public let id: String
    public let fireAt: Date
    public let time: CheckinTime

    public init(id: String, fireAt: Date, time: CheckinTime) {
        self.id = id
        self.fireAt = fireAt
        self.time = time
    }
}

public enum ScheduleMath {
    public static func calendar(_ timeZone: TimeZone) -> Calendar {
        var c = Calendar(identifier: .gregorian)
        c.timeZone = timeZone
        return c
    }

    /// Every check-in whose instant falls in [from, to].
    public static func occurrences(times: [CheckinTime], timeZone: TimeZone, from: Date, to: Date) -> [Occurrence] {
        guard from <= to, !times.isEmpty else { return [] }
        let cal = calendar(timeZone)
        let sortedTimes = Array(Set(times)).sorted()
        var out: [Occurrence] = []
        var day = cal.startOfDay(for: from.addingTimeInterval(-86_400))
        let lastDay = cal.startOfDay(for: to.addingTimeInterval(86_400))
        var guardCount = 0
        while day <= lastDay && guardCount < 400 {
            guardCount += 1
            let ymd = cal.dateComponents([.year, .month, .day], from: day)
            for t in sortedTimes {
                var c = DateComponents()
                c.year = ymd.year
                c.month = ymd.month
                c.day = ymd.day
                c.hour = t.hour
                c.minute = t.minute
                c.second = 0
                if let d = cal.date(from: c), d >= from, d <= to {
                    let id = String(format: "%04d-%02d-%02dT%02d:%02d", ymd.year ?? 0, ymd.month ?? 0, ymd.day ?? 0, t.hour, t.minute)
                    out.append(Occurrence(id: id, fireAt: d, time: t))
                }
            }
            guard let next = cal.date(byAdding: .day, value: 1, to: day) else { break }
            day = next
        }
        return out.sorted { $0.fireAt < $1.fireAt }
    }

    /// The next check-in that can still ring. `finished` holds the ids of check-ins that are already
    /// done, skipped or missed, which can happen before their time (a written entry earlier in the day).
    public static func next(after now: Date, times: [CheckinTime], timeZone: TimeZone, finished: Set<String> = []) -> Occurrence? {
        occurrences(times: times, timeZone: timeZone, from: now, to: now.addingTimeInterval(8 * 86_400))
            .first { $0.fireAt > now && !finished.contains($0.id) }
    }

    /// "16:00" for an instant, in the schedule's zone.
    public static func clock(_ date: Date, timeZone: TimeZone) -> String {
        let c = calendar(timeZone).dateComponents([.hour, .minute], from: date)
        return String(format: "%02d:%02d", c.hour ?? 0, c.minute ?? 0)
    }

    /// 0:42, 4:59, 1:02:03
    public static func countdown(_ seconds: Int) -> String {
        let s = max(0, seconds)
        if s >= 3600 { return String(format: "%d:%02d:%02d", s / 3600, (s % 3600) / 60, s % 60) }
        return String(format: "%d:%02d", s / 60, s % 60)
    }
}
