import AppKit
import SamwiseCore

let appVersion: String = (Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String) ?? "0.0.0"
let bundleID = "life.samwise.mac"

/// Launch flags. Normal use needs none; the build's end-to-end test uses them to drive the app.
struct Options {
    /// Started by launchd (the "keep running" agent).
    var launchd = false
    /// Never install or talk to the launchd agent.
    var noAgent = false
    /// Take over from a running copy instead of handing over to it.
    var replace = false
    var stateDir: URL?
    var apiBase = URL(string: "https://www.samwise.life")!
    var mute = false
    var testNow = false
    /// Let screenshots and screen sharing see the alarm (off by default: the alarm can show private words).
    var allowCapture = false
    var fakeNow: Date?
    var testHooks = false
    var noWelcome = false
    var send: String?
    var renderIcon: String?

    static func parse(_ args: [String]) -> Options {
        var o = Options()
        var i = 1
        func value() -> String? {
            guard i + 1 < args.count else { return nil }
            i += 1
            return args[i]
        }
        while i < args.count {
            switch args[i] {
            case "--launchd": o.launchd = true
            case "--no-agent": o.noAgent = true
            case "--replace": o.replace = true
            case "--mute": o.mute = true
            case "--test-now": o.testNow = true
            case "--allow-capture": o.allowCapture = true
            case "--test-hooks": o.testHooks = true
            case "--no-welcome": o.noWelcome = true
            case "--state-dir":
                if let v = value() { o.stateDir = URL(fileURLWithPath: (v as NSString).expandingTildeInPath, isDirectory: true) }
            case "--api-base":
                if let v = value(), let u = URL(string: v) { o.apiBase = u }
            case "--fake-now":
                if let v = value() { o.fakeNow = ISO8601DateFormatter().date(from: v) }
            case "--send":
                o.send = value()
            case "--render-icon":
                o.renderIcon = value()
            default:
                break
            }
            i += 1
        }
        return o
    }
}

/// The app's clock. Real time, except in the end-to-end test where it starts at a chosen moment and can jump.
@MainActor
final class Clock {
    var offset: TimeInterval = 0
    var now: Date { Date().addingTimeInterval(offset) }
}

/// A plain text log in the app's folder. It never holds journal text, task names or tokens.
enum Log {
    static var url: URL?
    private static let lock = NSLock()
    private static let stamp: ISO8601DateFormatter = {
        let f = ISO8601DateFormatter()
        f.formatOptions = [.withInternetDateTime]
        return f
    }()

    static func write(_ message: String) {
        lock.lock()
        defer { lock.unlock() }
        let line = "\(stamp.string(from: Date())) \(message)\n"
        FileHandle.standardError.write(Data(line.utf8))
        guard let url = url else { return }
        let fm = FileManager.default
        if let size = (try? fm.attributesOfItem(atPath: url.path))?[.size] as? Int, size > 1_000_000 {
            let old = url.deletingPathExtension().appendingPathExtension("old.log")
            try? fm.removeItem(at: old)
            try? fm.moveItem(at: url, to: old)
        }
        if !fm.fileExists(atPath: url.path) {
            fm.createFile(atPath: url.path, contents: nil)
        }
        if let h = try? FileHandle(forWritingTo: url) {
            defer { try? h.close() }
            _ = try? h.seekToEnd()
            try? h.write(contentsOf: Data(line.utf8))
        }
    }
}

struct QueuedEvent: Codable, Equatable {
    var kind: String
    var occurrence: String
    var detail: [String: String]
    var at: Date
}

/// Everything the app remembers between launches. One small JSON file.
struct Persisted: Codable {
    var settings = AlarmSettings()
    var states: [String: OccurrenceState] = [:]
    var pausedUntil: Date?
    var welcomed = false
    var installId = UUID().uuidString
    var events: [QueuedEvent] = []
    var testCounter = 0
    /// Check-ins before this moment are never shown: nothing fires "late" right after install,
    /// after the schedule changes, or after connecting an account.
    var activeSince: Date?

    init() {}

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        settings = (try? c.decodeIfPresent(AlarmSettings.self, forKey: .settings)) ?? AlarmSettings()
        states = (try? c.decodeIfPresent([String: OccurrenceState].self, forKey: .states)) ?? [:]
        pausedUntil = try? c.decodeIfPresent(Date.self, forKey: .pausedUntil)
        welcomed = (try? c.decodeIfPresent(Bool.self, forKey: .welcomed)) ?? false
        installId = (try? c.decodeIfPresent(String.self, forKey: .installId)) ?? UUID().uuidString
        events = (try? c.decodeIfPresent([QueuedEvent].self, forKey: .events)) ?? []
        testCounter = (try? c.decodeIfPresent(Int.self, forKey: .testCounter)) ?? 0
        activeSince = try? c.decodeIfPresent(Date.self, forKey: .activeSince)
    }
}

@MainActor
final class Store {
    let dir: URL
    var data = Persisted()
    /// Set when another copy of the app takes over: this copy must not write any more.
    var frozen = false
    private var dirty = false

    private var stateURL: URL { dir.appendingPathComponent("state.json") }
    private var tokenURL: URL { dir.appendingPathComponent("token") }
    private var configURL: URL { dir.appendingPathComponent("config.json") }
    var statusURL: URL { dir.appendingPathComponent("status.json") }
    var logURL: URL { dir.appendingPathComponent("samwise.log") }

    init(dir: URL?) {
        if let dir = dir {
            self.dir = dir
        } else {
            let base = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first
                ?? URL(fileURLWithPath: NSHomeDirectory()).appendingPathComponent("Library/Application Support")
            self.dir = base.appendingPathComponent("Samwise", isDirectory: true)
        }
        try? FileManager.default.createDirectory(at: self.dir, withIntermediateDirectories: true, attributes: [.posixPermissions: 0o700])
        load()
    }

    func load() {
        guard let raw = try? Data(contentsOf: stateURL) else { return }
        if let d = try? JSONDecoder().decode(Persisted.self, from: raw) {
            data = d
        } else {
            // Unreadable state: keep a copy for diagnosis and start clean rather than crash at every launch.
            try? raw.write(to: dir.appendingPathComponent("state.broken.json"))
            Log.write("state.json unreadable, starting clean")
        }
    }

    func touch() { dirty = true }

    func saveIfNeeded() {
        if dirty { save() }
    }

    func save() {
        guard !frozen else { return }
        dirty = false
        let encoder = JSONEncoder()
        encoder.outputFormatting = [.sortedKeys]
        guard let raw = try? encoder.encode(data) else { return }
        do {
            try raw.write(to: stateURL, options: .atomic)
        } catch {
            Log.write("could not save state: \(error.localizedDescription)")
        }
    }

    // MARK: Connection to a Samwise account

    var token: String? {
        guard let raw = try? String(contentsOf: tokenURL, encoding: .utf8) else { return nil }
        let t = raw.trimmingCharacters(in: .whitespacesAndNewlines)
        return t.isEmpty ? nil : t
    }

    func setToken(_ token: String?) {
        guard !frozen else { return }
        let fm = FileManager.default
        if let token = token {
            fm.createFile(atPath: tokenURL.path, contents: Data(token.utf8), attributes: [.posixPermissions: 0o600])
        } else {
            try? fm.removeItem(at: tokenURL)
            try? fm.removeItem(at: configURL)
        }
    }

    func cachedConfig() -> RemoteConfig? {
        guard token != nil, let raw = try? Data(contentsOf: configURL) else { return nil }
        return try? RemoteConfig.decode(raw)
    }

    func cacheConfig(_ raw: Data) {
        guard !frozen else { return }
        FileManager.default.createFile(atPath: configURL.path, contents: raw, attributes: [.posixPermissions: 0o600])
    }
}

/// Compares "1.2.0" style versions.
func isVersion(_ a: String, newerThan b: String) -> Bool {
    let x = a.split(separator: ".").map { Int($0) ?? 0 }
    let y = b.split(separator: ".").map { Int($0) ?? 0 }
    for i in 0..<max(x.count, y.count) {
        let l = i < x.count ? x[i] : 0
        let r = i < y.count ? y[i] : 0
        if l != r { return l > r }
    }
    return false
}
