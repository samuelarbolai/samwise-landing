import AppKit
import SamwiseCore

@MainActor
final class AppDelegate: NSObject, NSApplicationDelegate {
    private let controller: AppController

    init(controller: AppController) {
        self.controller = controller
    }

    func applicationDidFinishLaunching(_ notification: Notification) {
        buildMainMenu()
        controller.start()
    }

    /// Opening the app again while it runs (from Finder or Spotlight) shows its window.
    func applicationShouldHandleReopen(_ sender: NSApplication, hasVisibleWindows flag: Bool) -> Bool {
        controller.showMainWindow()
        return false
    }

    /// The alarm cannot be quit away while it is on screen; typing the skip line is the way out.
    /// Shutting down or logging out is never blocked.
    func applicationShouldTerminate(_ sender: NSApplication) -> NSApplication.TerminateReply {
        controller.canQuit ? .terminateNow : .terminateCancel
    }

    func applicationWillTerminate(_ notification: Notification) {
        controller.store.saveIfNeeded()
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool { false }

    /// A menu-bar app shows no menu bar of its own, but text fields need these for Cmd-C, Cmd-V and Cmd-W.
    private func buildMainMenu() {
        let main = NSMenu()
        let appItem = NSMenuItem()
        main.addItem(appItem)
        let appMenu = NSMenu()
        appItem.submenu = appMenu
        appMenu.addItem(withTitle: "Close Window", action: #selector(NSWindow.performClose(_:)), keyEquivalent: "w")

        let editItem = NSMenuItem()
        main.addItem(editItem)
        let edit = NSMenu(title: "Edit")
        editItem.submenu = edit
        edit.addItem(withTitle: "Cut", action: #selector(NSText.cut(_:)), keyEquivalent: "x")
        edit.addItem(withTitle: "Copy", action: #selector(NSText.copy(_:)), keyEquivalent: "c")
        edit.addItem(withTitle: "Paste", action: #selector(NSText.paste(_:)), keyEquivalent: "v")
        edit.addItem(withTitle: "Select All", action: #selector(NSText.selectAll(_:)), keyEquivalent: "a")
        NSApp.mainMenu = main
    }
}

@main
struct SamwiseMain {
    @MainActor
    static func main() {
        let options = Options.parse(CommandLine.arguments)

        if let dir = options.renderIcon {
            IconRenderer.render(to: dir)
            return
        }

        let store = Store(dir: options.stateDir)
        Log.url = store.logURL
        Log.write("launch \(appVersion) \(CommandLine.arguments.dropFirst().joined(separator: " "))")

        guard Agent.shouldRun(options: options, store: store) else {
            Log.write("another copy is running; it was asked to show its window")
            return
        }

        let app = NSApplication.shared
        app.setActivationPolicy(.accessory)
        let controller = AppController(options: options, store: store)
        let delegate = AppDelegate(controller: controller)
        app.delegate = delegate
        withExtendedLifetime(delegate) {
            app.run()
        }
    }
}
