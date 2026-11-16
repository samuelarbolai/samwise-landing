import AppKit

/// The Samwise house style, same as samwise.life: white ground, black ink and buttons,
/// forest as the only chromatic note, a gold four-point star.
enum Theme {
    static func rgb(_ hex: Int) -> NSColor {
        NSColor(srgbRed: CGFloat((hex >> 16) & 0xff) / 255, green: CGFloat((hex >> 8) & 0xff) / 255, blue: CGFloat(hex & 0xff) / 255, alpha: 1)
    }

    static let bg = NSColor.white
    static let paper = rgb(0xf7f5ef)
    static let ink = NSColor.black
    static let inkMute = rgb(0x4d4d4d)
    static let inkFaint = rgb(0x6b6b6b)
    static let ghost = rgb(0xb5b1a6)
    static let rule = rgb(0xe2dfd6)
    static let forest = rgb(0x1f3023)
    static let gold = rgb(0xd4a85a)
    static let red = rgb(0xa8322a)

    static func sans(_ size: CGFloat, _ weight: NSFont.Weight = .regular) -> NSFont {
        NSFont.systemFont(ofSize: size, weight: weight)
    }

    static func serif(_ size: CGFloat, _ weight: NSFont.Weight = .regular, italic: Bool = false) -> NSFont {
        let base = NSFont.systemFont(ofSize: size, weight: weight)
        var descriptor = base.fontDescriptor
        if let d = descriptor.withDesign(.serif) { descriptor = d }
        if italic { descriptor = descriptor.withSymbolicTraits(.italic) }
        return NSFont(descriptor: descriptor, size: size) ?? base
    }

    /// The house sparkle, the same path as the site's favicon, fitted to `rect`.
    static func star(in rect: NSRect) -> NSBezierPath {
        // Source path on a 24x24 grid: M12 0 Q13 11, 24 12 Q13 13, 12 24 Q11 13, 0 12 Q11 11, 12 0 Z
        func p(_ x: CGFloat, _ y: CGFloat) -> NSPoint {
            NSPoint(x: rect.minX + x / 24 * rect.width, y: rect.minY + y / 24 * rect.height)
        }
        let path = NSBezierPath()
        var current = p(12, 0)
        path.move(to: current)
        func quad(_ control: NSPoint, _ end: NSPoint) {
            let c1 = NSPoint(x: current.x + 2 / 3 * (control.x - current.x), y: current.y + 2 / 3 * (control.y - current.y))
            let c2 = NSPoint(x: end.x + 2 / 3 * (control.x - end.x), y: end.y + 2 / 3 * (control.y - end.y))
            path.curve(to: end, controlPoint1: c1, controlPoint2: c2)
            current = end
        }
        quad(p(13, 11), p(24, 12))
        quad(p(13, 13), p(12, 24))
        quad(p(11, 13), p(0, 12))
        quad(p(11, 11), p(12, 0))
        path.close()
        return path
    }

    /// Menu bar icon: the star as a template image, so macOS tints it for light and dark menu bars.
    static func menuBarImage() -> NSImage {
        let image = NSImage(size: NSSize(width: 18, height: 18), flipped: false) { _ in
            NSColor.black.setFill()
            Theme.star(in: NSRect(x: 2.5, y: 2.5, width: 13, height: 13)).fill()
            return true
        }
        image.isTemplate = true
        return image
    }

    /// App icon: forest tile, gold star. Drawn in code so the repository holds no binary art.
    static func drawAppIcon(side: CGFloat) {
        let inset = side * 0.1
        let tile = NSRect(x: inset, y: inset, width: side - 2 * inset, height: side - 2 * inset)
        let radius = tile.width * 0.225
        forest.setFill()
        NSBezierPath(roundedRect: tile, xRadius: radius, yRadius: radius).fill()
        gold.setFill()
        let s = tile.width * 0.52
        star(in: NSRect(x: tile.midX - s / 2, y: tile.midY - s / 2, width: s, height: s)).fill()
    }

    static func label(_ text: String, font: NSFont, color: NSColor, align: NSTextAlignment = .left, wraps: Bool = true) -> NSTextField {
        let l = wraps ? NSTextField(wrappingLabelWithString: text) : NSTextField(labelWithString: text)
        l.font = font
        l.textColor = color
        l.alignment = align
        l.isSelectable = false
        l.drawsBackground = false
        l.isBordered = false
        l.refusesFirstResponder = true
        return l
    }

    /// Height a wrapping label needs at `width`.
    static func height(of label: NSTextField, width: CGFloat) -> CGFloat {
        guard let cell = label.cell else { return 0 }
        let size = cell.cellSize(forBounds: NSRect(x: 0, y: 0, width: width, height: 20_000))
        return ceil(size.height)
    }
}

/// "Samwise" in the wordmark style with the gold star at its shoulder.
final class BrandView: NSView {
    private let size: CGFloat

    init(size: CGFloat = 24) {
        self.size = size
        super.init(frame: NSRect(x: 0, y: 0, width: size * 5.2, height: size * 1.5))
    }

    required init?(coder: NSCoder) { nil }

    override var isFlipped: Bool { true }

    private var text: NSAttributedString {
        NSAttributedString(string: "Samwise", attributes: [.font: Theme.serif(size, italic: true), .foregroundColor: Theme.ink])
    }

    var preferredSize: NSSize {
        let t = text.size()
        return NSSize(width: ceil(t.width + size * 0.6), height: ceil(t.height))
    }

    override var intrinsicContentSize: NSSize { preferredSize }

    override func draw(_ dirtyRect: NSRect) {
        let t = text
        let s = t.size()
        t.draw(at: NSPoint(x: 0, y: 0))
        Theme.gold.setFill()
        let side = size * 0.4
        Theme.star(in: NSRect(x: s.width + size * 0.08, y: size * 0.12, width: side, height: side)).fill()
    }
}

/// The site's button: black, bold, upper case. `secondary` is the outlined version, `quiet` is text only.
final class PillButton: NSView {
    enum Style { case primary, secondary, quiet }

    var title: String { didSet { needsDisplay = true; setAccessibilityLabel(title) } }
    var style: Style { didSet { needsDisplay = true } }
    var isEnabled = true { didSet { needsDisplay = true; window?.invalidateCursorRects(for: self) } }
    var onClick: (() -> Void)?
    var fontSize: CGFloat = 12
    private var pressed = false

    init(_ title: String, style: Style = .primary, onClick: (() -> Void)? = nil) {
        self.title = title
        self.style = style
        self.onClick = onClick
        super.init(frame: .zero)
        setAccessibilityElement(true)
        setAccessibilityRole(.button)
        setAccessibilityLabel(title)
    }

    required init?(coder: NSCoder) { nil }

    private var text: NSAttributedString {
        let color: NSColor
        switch style {
        case .primary: color = isEnabled ? .white : Theme.paper
        case .secondary: color = isEnabled ? Theme.ink : Theme.ghost
        case .quiet: color = isEnabled ? Theme.inkMute : Theme.ghost
        }
        return NSAttributedString(string: title.uppercased(), attributes: [
            .font: Theme.sans(fontSize, .bold),
            .foregroundColor: color,
            .kern: fontSize * 0.1,
        ])
    }

    var preferredSize: NSSize {
        let s = text.size()
        let pad: CGFloat = style == .quiet ? 16 : 40
        return NSSize(width: ceil(s.width) + pad, height: max(40, ceil(s.height) + 26))
    }

    override var intrinsicContentSize: NSSize { preferredSize }

    override func draw(_ dirtyRect: NSRect) {
        let r = bounds.insetBy(dx: 0.5, dy: 0.5)
        let path = NSBezierPath(roundedRect: r, xRadius: 10, yRadius: 10)
        switch style {
        case .primary:
            (isEnabled ? (pressed ? Theme.forest : Theme.ink) : Theme.ghost).setFill()
            path.fill()
        case .secondary:
            (pressed ? Theme.paper : Theme.bg).setFill()
            path.fill()
            (isEnabled ? Theme.ink : Theme.rule).setStroke()
            path.lineWidth = 1
            path.stroke()
        case .quiet:
            if pressed {
                Theme.paper.setFill()
                path.fill()
            }
        }
        let t = text
        let s = t.size()
        t.draw(at: NSPoint(x: bounds.midX - s.width / 2, y: bounds.midY - s.height / 2))
    }

    override func acceptsFirstMouse(for event: NSEvent?) -> Bool { true }

    override func mouseDown(with event: NSEvent) {
        guard isEnabled else { return }
        pressed = true
        needsDisplay = true
    }

    override func mouseUp(with event: NSEvent) {
        let inside = bounds.contains(convert(event.locationInWindow, from: nil))
        let was = pressed
        pressed = false
        needsDisplay = true
        if was && inside && isEnabled { onClick?() }
    }

    override func resetCursorRects() {
        if isEnabled { addCursorRect(bounds, cursor: .pointingHand) }
    }

    override func accessibilityPerformPress() -> Bool {
        guard isEnabled else { return false }
        onClick?()
        return true
    }
}
