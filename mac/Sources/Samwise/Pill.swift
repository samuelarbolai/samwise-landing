import AppKit

/// The small panel at the top of the screen: the five-minute countdown, "snoozed", "check-in in progress"
/// and "did you finish?". It floats above other windows but never takes the keyboard.
final class PillView: NSView {
    private let label = Theme.label("", font: Theme.sans(14, .medium), color: Theme.ink, wraps: false)
    private var buttons: [PillButton] = []
    private var buttonsKey = ""
    var emphasis = false { didSet { needsDisplay = true } }

    init() {
        super.init(frame: .zero)
        // One line, or two when the text carries a line break (the warning that Samwise has not counted a check-in).
        label.usesSingleLineMode = false
        label.maximumNumberOfLines = 2
        addSubview(label)
    }

    required init?(coder: NSCoder) { nil }

    override var isFlipped: Bool { true }
    override func acceptsFirstMouse(for event: NSEvent?) -> Bool { true }
    override var mouseDownCanMoveWindow: Bool { true }

    func update(text: String, actions: [(title: String, style: PillButton.Style, run: () -> Void)]) {
        label.stringValue = text
        label.font = Theme.sans(emphasis ? 15 : 14, emphasis ? .semibold : .medium)
        let key = actions.map { $0.title }.joined(separator: "|")
        if key != buttonsKey {
            buttonsKey = key
            for b in buttons { b.removeFromSuperview() }
            buttons = actions.map { a in
                let b = PillButton(a.title, style: a.style, onClick: a.run)
                b.fontSize = 11
                addSubview(b)
                return b
            }
        } else {
            for (b, a) in zip(buttons, actions) { b.onClick = a.run }
        }
        needsLayout = true
        needsDisplay = true
    }

    private let padX: CGFloat = 18
    private let starSide: CGFloat = 14

    func preferredSize() -> NSSize {
        label.sizeToFit()
        var w = padX + starSide + 10 + ceil(label.frame.width) + padX
        for b in buttons { w += b.preferredSize.width + 8 }
        if !buttons.isEmpty { w += 4 }
        return NSSize(width: w, height: max(buttons.isEmpty ? 44 : 56, ceil(label.frame.height) + 20))
    }

    override func layout() {
        super.layout()
        label.sizeToFit()
        let h = bounds.height
        label.frame = NSRect(x: padX + starSide + 10, y: (h - label.frame.height) / 2, width: ceil(label.frame.width), height: label.frame.height)
        var x = label.frame.maxX + 14
        for b in buttons {
            let s = b.preferredSize
            b.frame = NSRect(x: x, y: (h - s.height) / 2, width: s.width, height: s.height)
            x += s.width + 8
        }
    }

    override func draw(_ dirtyRect: NSRect) {
        let r = bounds.insetBy(dx: 1, dy: 1)
        let path = NSBezierPath(roundedRect: r, xRadius: min(r.height / 2, 18), yRadius: min(r.height / 2, 18))
        Theme.bg.setFill()
        path.fill()
        (emphasis ? Theme.gold : Theme.rule).setStroke()
        path.lineWidth = emphasis ? 2 : 1
        path.stroke()
        Theme.gold.setFill()
        Theme.star(in: NSRect(x: padX, y: (bounds.height - starSide) / 2, width: starSide, height: starSide)).fill()
    }
}

@MainActor
final class PillPresenter {
    private var panel: NSPanel?
    private let view = PillView()
    private var lastSize = NSSize.zero
    private var placed = false

    var isUp: Bool { panel != nil }

    func show(text: String, emphasis: Bool = false, actions: [(title: String, style: PillButton.Style, run: () -> Void)] = []) {
        view.emphasis = emphasis
        view.update(text: text, actions: actions)
        let size = view.preferredSize()

        if panel == nil {
            let p = NSPanel(contentRect: NSRect(origin: .zero, size: size), styleMask: [.borderless, .nonactivatingPanel], backing: .buffered, defer: false)
            p.level = .statusBar
            p.collectionBehavior = [.canJoinAllSpaces, .fullScreenAuxiliary, .stationary, .ignoresCycle]
            p.isOpaque = false
            p.backgroundColor = .clear
            p.hasShadow = true
            p.hidesOnDeactivate = false
            p.isReleasedWhenClosed = false
            p.isMovableByWindowBackground = true
            p.appearance = NSAppearance(named: .aqua)
            p.animationBehavior = .none
            view.frame = NSRect(origin: .zero, size: size)
            view.autoresizingMask = [.width, .height]
            p.contentView = view
            panel = p
            placed = false
            lastSize = .zero
        }
        guard let p = panel else { return }
        if size != lastSize {
            lastSize = size
            if placed {
                // Keep the top edge and the centre where the user left the panel.
                let f = p.frame
                p.setFrame(NSRect(x: f.midX - size.width / 2, y: f.maxY - size.height, width: size.width, height: size.height), display: true)
            } else {
                let mouse = NSEvent.mouseLocation
                let screen = NSScreen.screens.first { $0.frame.contains(mouse) } ?? NSScreen.main ?? NSScreen.screens.first
                let area = screen?.visibleFrame ?? NSRect(x: 0, y: 0, width: 1280, height: 800)
                p.setFrame(NSRect(x: area.midX - size.width / 2, y: area.maxY - size.height - 10, width: size.width, height: size.height), display: true)
                placed = true
            }
            p.invalidateShadow()
        }
        if !p.isVisible { p.orderFrontRegardless() }
    }

    func hide() {
        panel?.orderOut(nil)
        panel = nil
    }
}
