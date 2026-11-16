import AppKit

@discardableResult
func runTool(_ path: String, _ arguments: [String]) -> Int32 {
    let p = Process()
    p.executableURL = URL(fileURLWithPath: path)
    p.arguments = arguments
    p.standardOutput = FileHandle.nullDevice
    p.standardError = FileHandle.nullDevice
    do {
        try p.run()
        p.waitUntilExit()
        return p.terminationStatus
    } catch {
        return -1
    }
}

/// "Keep Samwise running": a per-user launchd agent that starts the app at login and reopens it if it closes.
/// It is only installed after the user says yes on the welcome screen, and Settings can turn it off.
enum Agent {
    static let label = bundleID

    static var plistURL: URL {
        URL(fileURLWithPath: NSHomeDirectory()).appendingPathComponent("Library/LaunchAgents/\(label).plist")
    }

    private static var domain: String { "gui/\(getuid())" }

    static var isInstalled: Bool { FileManager.default.fileExists(atPath: plistURL.path) }

    static var isLoaded: Bool { runTool("/bin/launchctl", ["print", "\(domain)/\(label)"]) == 0 }

    /// True when the app sits somewhere it will still be tomorrow (not on the disk image, not in a temporary copy).
    static var isStableLocation: Bool {
        let p = Bundle.main.bundlePath
        return p.hasSuffix(".app") && !p.contains("/AppTranslocation/") && !p.hasPrefix("/Volumes/")
    }

    @discardableResult
    static func install() -> Bool {
        guard isStableLocation, let executable = Bundle.main.executablePath else { return false }
        let plist: [String: Any] = [
            "Label": label,
            "ProgramArguments": [executable, "--launchd"],
            "RunAtLoad": true,
            "KeepAlive": true,
            "ThrottleInterval": 10,
            "ProcessType": "Interactive",
            "LimitLoadToSessionType": "Aqua",
            "AssociatedBundleIdentifiers": [bundleID],
        ]
        guard let data = try? PropertyListSerialization.data(fromPropertyList: plist, format: .xml, options: 0) else { return false }
        let fm = FileManager.default
        let same = (try? Data(contentsOf: plistURL)) == data
        if same && isLoaded { return true }
        try? fm.createDirectory(at: plistURL.deletingLastPathComponent(), withIntermediateDirectories: true)
        do {
            try data.write(to: plistURL, options: .atomic)
        } catch {
            Log.write("agent: could not write the launchd file: \(error.localizedDescription)")
            return false
        }
        if isLoaded {
            runTool("/bin/launchctl", ["bootout", "\(domain)/\(label)"])
            usleep(700_000)
        }
        var status = runTool("/bin/launchctl", ["bootstrap", domain, plistURL.path])
        if status != 0 {
            usleep(1_000_000)
            status = runTool("/bin/launchctl", ["bootstrap", domain, plistURL.path])
        }
        Log.write("agent: install \(status == 0 ? "ok" : "failed (\(status))")")
        return status == 0
    }

    /// Removes the agent. When this copy was started by the agent, launchd stops it as part of this call.
    static func uninstall() {
        try? FileManager.default.removeItem(at: plistURL)
        Log.write("agent: removed")
        runTool("/bin/launchctl", ["bootout", "\(domain)/\(label)"])
    }

    // MARK: One copy at a time

    static let showName = Notification.Name("\(bundleID).show")
    static let yieldName = Notification.Name("\(bundleID).yield")

    static func otherInstances() -> [NSRunningApplication] {
        let me = ProcessInfo.processInfo.processIdentifier
        return NSRunningApplication.runningApplications(withBundleIdentifier: bundleID).filter { $0.processIdentifier != me && !$0.isTerminated }
    }

    static func post(_ name: Notification.Name) {
        DistributedNotificationCenter.default().postNotificationName(name, object: nil, userInfo: nil, deliverImmediately: true)
    }

    /// Decides, before the app starts, whether this copy should run. Returns false when another copy already does.
    @MainActor
    static func shouldRun(options: Options, store: Store) -> Bool {
        if options.noAgent || options.replace { return true }
        let others = otherInstances()
        if options.launchd {
            // This is the kept-alive copy: any other copy steps aside for it.
            if !others.isEmpty { post(yieldName) }
            return true
        }
        if !others.isEmpty {
            post(showName)
            return false
        }
        // The keep-running agent is installed later, in AppController.start(), once this copy is listening
        // for the kept-alive copy's request to step aside.
        return true
    }
}

/// Copies the app into Applications when it is run from the disk image or the Downloads folder.
enum Mover {
    static var needsMove: Bool {
        let p = Bundle.main.bundlePath
        guard p.hasSuffix(".app") else { return false }
        return !p.hasPrefix("/Applications/") && !p.hasPrefix(NSHomeDirectory() + "/Applications/")
    }

    /// Returns the new location, or nil when the copy failed.
    static func copyToApplications() -> URL? {
        let fm = FileManager.default
        let source = Bundle.main.bundleURL
        var folder = URL(fileURLWithPath: "/Applications", isDirectory: true)
        if !fm.isWritableFile(atPath: folder.path) {
            folder = URL(fileURLWithPath: NSHomeDirectory()).appendingPathComponent("Applications", isDirectory: true)
            try? fm.createDirectory(at: folder, withIntermediateDirectories: true)
        }
        let target = folder.appendingPathComponent("Samwise.app")
        do {
            if fm.fileExists(atPath: target.path) { try fm.removeItem(at: target) }
            try fm.copyItem(at: source, to: target)
        } catch {
            Log.write("mover: \(error.localizedDescription)")
            return nil
        }
        runTool("/usr/bin/xattr", ["-dr", "com.apple.quarantine", target.path])
        return target
    }
}

/// Draws the app icon into an .iconset folder. Used once, by the build.
enum IconRenderer {
    static func render(to dir: String) {
        let sizes: [(String, Int)] = [
            ("icon_16x16", 16), ("icon_16x16@2x", 32), ("icon_32x32", 32), ("icon_32x32@2x", 64),
            ("icon_128x128", 128), ("icon_128x128@2x", 256), ("icon_256x256", 256), ("icon_256x256@2x", 512),
            ("icon_512x512", 512), ("icon_512x512@2x", 1024),
        ]
        try? FileManager.default.createDirectory(atPath: dir, withIntermediateDirectories: true)
        for (name, px) in sizes {
            guard let rep = NSBitmapImageRep(
                bitmapDataPlanes: nil, pixelsWide: px, pixelsHigh: px, bitsPerSample: 8, samplesPerPixel: 4,
                hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0
            ) else { continue }
            NSGraphicsContext.saveGraphicsState()
            NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: rep)
            Theme.drawAppIcon(side: CGFloat(px))
            NSGraphicsContext.restoreGraphicsState()
            if let data = rep.representation(using: .png, properties: [:]) {
                try? data.write(to: URL(fileURLWithPath: dir).appendingPathComponent(name + ".png"))
            }
        }
    }
}
