import Foundation

/// What the user can tune. Every limit here is explained in Settings and can be changed there:
/// the alarm is insistent because the user asked for it, never because Samwise decides for them.
public struct AlarmSettings: Codable, Equatable {
    /// Small countdown this long before the takeover. 0 turns it off.
    public var headsUpSeconds: Int
    /// The takeover starts this long before the check-in time, so the phone is in hand when it rings.
    public var leadSeconds: Int
    /// A check-in found late (Mac was asleep) still fires inside this window.
    public var lateWindowSeconds: Int
    public var snoozeMinutes: Int
    public var maxSnoozes: Int
    /// After "I am doing my check-in now": ask "did you finish?" this much later.
    public var followUpMinutes: Int
    /// No answer to that question for this long: the screen is taken over again.
    public var followUpGraceMinutes: Int
    /// "escalating", "gentle" or "off".
    public var sound: String
    /// Raise the Mac's volume when it is muted or very low and the alarm is not answered.
    public var raiseVolume: Bool
    public var openJournalOnStart: Bool
    /// Show the user's own words on the alarm screen without pressing Tab first.
    public var showWordsRightAway: Bool
    /// Times used when the app is not connected to a Samwise account.
    public var localTimes: [String]
    /// Keep the app running: start at login and reopen if it closes.
    public var keepRunning: Bool

    public init(
        headsUpSeconds: Int = 300,
        leadSeconds: Int = 60,
        lateWindowSeconds: Int = 4 * 3600,
        snoozeMinutes: Int = 5,
        maxSnoozes: Int = 2,
        followUpMinutes: Int = 15,
        followUpGraceMinutes: Int = 10,
        sound: String = "escalating",
        raiseVolume: Bool = true,
        openJournalOnStart: Bool = true,
        showWordsRightAway: Bool = false,
        localTimes: [String] = ["16:00"],
        keepRunning: Bool = true
    ) {
        self.headsUpSeconds = headsUpSeconds
        self.leadSeconds = leadSeconds
        self.lateWindowSeconds = lateWindowSeconds
        self.snoozeMinutes = snoozeMinutes
        self.maxSnoozes = maxSnoozes
        self.followUpMinutes = followUpMinutes
        self.followUpGraceMinutes = followUpGraceMinutes
        self.sound = sound
        self.raiseVolume = raiseVolume
        self.openJournalOnStart = openJournalOnStart
        self.showWordsRightAway = showWordsRightAway
        self.localTimes = localTimes
        self.keepRunning = keepRunning
    }

    // Tolerant decoding: a settings file written by an older version keeps working.
    public init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        let d = AlarmSettings()
        headsUpSeconds = (try? c.decodeIfPresent(Int.self, forKey: .headsUpSeconds)) ?? d.headsUpSeconds
        leadSeconds = (try? c.decodeIfPresent(Int.self, forKey: .leadSeconds)) ?? d.leadSeconds
        lateWindowSeconds = (try? c.decodeIfPresent(Int.self, forKey: .lateWindowSeconds)) ?? d.lateWindowSeconds
        snoozeMinutes = (try? c.decodeIfPresent(Int.self, forKey: .snoozeMinutes)) ?? d.snoozeMinutes
        maxSnoozes = (try? c.decodeIfPresent(Int.self, forKey: .maxSnoozes)) ?? d.maxSnoozes
        followUpMinutes = (try? c.decodeIfPresent(Int.self, forKey: .followUpMinutes)) ?? d.followUpMinutes
        followUpGraceMinutes = (try? c.decodeIfPresent(Int.self, forKey: .followUpGraceMinutes)) ?? d.followUpGraceMinutes
        sound = (try? c.decodeIfPresent(String.self, forKey: .sound)) ?? d.sound
        raiseVolume = (try? c.decodeIfPresent(Bool.self, forKey: .raiseVolume)) ?? d.raiseVolume
        openJournalOnStart = (try? c.decodeIfPresent(Bool.self, forKey: .openJournalOnStart)) ?? d.openJournalOnStart
        showWordsRightAway = (try? c.decodeIfPresent(Bool.self, forKey: .showWordsRightAway)) ?? d.showWordsRightAway
        localTimes = (try? c.decodeIfPresent([String].self, forKey: .localTimes)) ?? d.localTimes
        keepRunning = (try? c.decodeIfPresent(Bool.self, forKey: .keepRunning)) ?? d.keepRunning
    }

    public var localCheckinTimes: [CheckinTime] {
        localTimes.compactMap { CheckinTime($0) }.sorted()
    }
}

// MARK: - What samwise.life tells a connected app (GET /api/mac/config)

public struct RemoteUser: Codable, Equatable {
    public var firstName: String?
    public var language: String?
    public var timezone: String?
    public init(firstName: String? = nil, language: String? = nil, timezone: String? = nil) {
        self.firstName = firstName
        self.language = language
        self.timezone = timezone
    }
}

public struct RemoteWords: Codable, Equatable {
    public var title: String
    public var body: String
    public init(title: String, body: String) {
        self.title = title
        self.body = body
    }
}

public struct RemoteCheckin: Codable, Equatable {
    /// "16:00", the user's wall clock in `user.timezone`.
    public var time: String
    /// The user's own journal text for this time of day, one block per part.
    public var words: [RemoteWords]?
    /// Where this check-in's written part lives (the right tab of the user's journal), when they have one.
    public var journalUrl: String?
    public init(time: String, words: [RemoteWords]? = nil, journalUrl: String? = nil) {
        self.time = time
        self.words = words
        self.journalUrl = journalUrl
    }
}

/// How one check-in stands on Samwise's side. `id` matches `Occurrence.id`.
public struct RemoteSlot: Codable, Equatable {
    public var id: String
    /// The check-in happened: a call that reached the person, or a written entry.
    public var done: Bool
    /// "call" (a check-in call that reached the person) or "written" (a written entry in their journal).
    public var doneSource: String?
    /// Samwise will phone the user at this time (false when calls are paused or an entry already exists).
    public var willCall: Bool
    public var callPlaced: Bool
    /// Samwise phoned and nobody picked up.
    public var callMissed: Bool

    public init(id: String, done: Bool = false, doneSource: String? = nil, willCall: Bool = true, callPlaced: Bool = false, callMissed: Bool = false) {
        self.id = id
        self.done = done
        self.doneSource = doneSource
        self.willCall = willCall
        self.callPlaced = callPlaced
        self.callMissed = callMissed
    }

    public init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        id = try c.decode(String.self, forKey: .id)
        done = (try? c.decodeIfPresent(Bool.self, forKey: .done)) ?? false
        doneSource = try? c.decodeIfPresent(String.self, forKey: .doneSource)
        willCall = (try? c.decodeIfPresent(Bool.self, forKey: .willCall)) ?? true
        callPlaced = (try? c.decodeIfPresent(Bool.self, forKey: .callPlaced)) ?? false
        callMissed = (try? c.decodeIfPresent(Bool.self, forKey: .callMissed)) ?? false
    }
}

public struct RemoteTask: Codable, Equatable {
    public var id: Int
    public var title: String
    public var detail: String?
    public init(id: Int, title: String, detail: String? = nil) {
        self.id = id
        self.title = title
        self.detail = detail
    }
}

public struct RemoteSupport: Codable, Equatable {
    /// The user has trusted people Samwise calls after a missed check-in.
    public var active: Bool
    public var graceMinutes: Int?
    public init(active: Bool, graceMinutes: Int? = nil) {
        self.active = active
        self.graceMinutes = graceMinutes
    }
}

public struct RemoteConfig: Codable, Equatable {
    public var user: RemoteUser?
    public var checkins: [RemoteCheckin]?
    public var slots: [RemoteSlot]?
    public var tasks: [RemoteTask]?
    public var support: RemoteSupport?
    public var journalUrl: String?
    /// Samwise's phone number, shown when a call was missed.
    public var samwiseNumber: String?
    public var latestVersion: String?
    public var downloadUrl: String?
    /// Lets the server tune the alarm per user without a new app build. Missing keys keep the local value.
    public var showWordsRightAway: Bool?

    public init() {}

    public var checkinTimes: [CheckinTime] {
        (checkins ?? []).compactMap { CheckinTime($0.time) }.sorted()
    }

    public func words(for time: CheckinTime) -> [RemoteWords] {
        for c in checkins ?? [] where CheckinTime(c.time) == time {
            return c.words ?? []
        }
        return []
    }

    public func slot(_ id: String) -> RemoteSlot? {
        (slots ?? []).first { $0.id == id }
    }

    public var timeZone: TimeZone? {
        guard let name = user?.timezone else { return nil }
        return TimeZone(identifier: name)
    }

    public static func decode(_ data: Data) throws -> RemoteConfig {
        let d = JSONDecoder()
        d.keyDecodingStrategy = .convertFromSnakeCase
        return try d.decode(RemoteConfig.self, from: data)
    }
}
