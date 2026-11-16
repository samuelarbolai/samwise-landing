import AppKit
import SamwiseCore

/// What the alarm screen says right now. One model, drawn on every display.
@MainActor
final class TakeoverModel {
    var id = ""
    var kind: TakeoverKind = .ringing
    var eyebrow = ""
    var title = ""
    var subtitle = ""
    /// Samwise's line of the day, shown while the user's own words are hidden.
    var line = ""
    var words: [RemoteWords] = []
    var wordsTitle = ""
    var showWords = false
    var wordsHint = ""
    var prompt = ""
    var commitPhrase = ""
    var skipPrompt = ""
    var skipPhrase = ""
    var skipNote = ""
    /// Letters typed so far, already reduced to letters and digits.
    var typed = ""
    var wrongAt: Date?
    var hint = ""
    var snoozeTitle: String?
    var snoozeEnabled = false
    var snoozeNote = ""
    var callTitle: String?
    var whatsAppTitle: String?
    var finishTitle: String?
    var why = ""
}

@MainActor
protocol TakeoverActions: AnyObject {
    func takeoverKey(_ event: NSEvent)
    func takeoverTouched()
    func takeoverSnooze()
    func takeoverCall()
    func takeoverWhatsApp()
    func takeoverFinish()
}

/// How many characters of `phrase` are covered once `count` letters have been typed.
func coveredPrefix(of phrase: String, letters count: Int) -> Int {
    if count <= 0 { return 0 }
    var seen = 0
    var index = 0
    for ch in phrase {
        index += 1
        seen += PhraseMatch.normalize(String(ch)).count
        if seen >= count { break }
    }
    return index
}

/// The line to type. Typed letters turn black; the rest waits in grey.
final class PhraseBox: NSView {
    var phrase = ""
    var typedLetters = 0
    var wrong = false
    var fontSize: CGFloat = 28

    override var isFlipped: Bool { true }

    private func parts() -> (typed: NSAttributedString, rest: NSAttributedString) {
        let font = NSFont.monospacedSystemFont(ofSize: fontSize, weight: .medium)
        let n = coveredPrefix(of: phrase, letters: typedLetters)
        let typed = NSAttributedString(string: String(phrase.prefix(n)), attributes: [.font: font, .foregroundColor: Theme.ink])
        let rest = NSAttributedString(string: String(phrase.dropFirst(n)), attributes: [.font: font, .foregroundColor: Theme.ghost])
        return (typed, rest)
    }

    func preferredSize() -> NSSize {
        let p = parts()
        let w = p.typed.size().width + p.rest.size().width
        let h = max(p.typed.size().height, p.rest.size().height)
        return NSSize(width: ceil(w) + fontSize * 2.4, height: ceil(h) + fontSize * 1.3)
    }

    override func draw(_ dirtyRect: NSRect) {
        let r = bounds.insetBy(dx: 1.5, dy: 1.5)
        let path = NSBezierPath(roundedRect: r, xRadius: 14, yRadius: 14)
        Theme.paper.setFill()
        path.fill()
        if wrong {
            Theme.red.setStroke()
            path.lineWidth = 2.5
        } else if typedLetters > 0 {
            Theme.forest.setStroke()
            path.lineWidth = 2.5
        } else {
            Theme.rule.setStroke()
            path.lineWidth = 1.5
        }
        path.stroke()

        let p = parts()
        let typedSize = p.typed.size()
        let restSize = p.rest.size()
        let total = typedSize.width + restSize.width
        let h = max(typedSize.height, restSize.height)
        let x = bounds.midX - total / 2
        let y = bounds.midY - h / 2
        p.typed.draw(at: NSPoint(x: x, y: y))
        p.rest.draw(at: NSPoint(x: x + typedSize.width, y: y))
        // The caret sits just before the next letter to type, never on top of it.
        Theme.gold.setFill()
        NSRect(x: x + typedSize.width - (typedLetters == 0 ? 7 : 1), y: y + 2, width: 3, height: h - 4).fill()
    }
}

/// The full-screen alarm. It takes keys itself (no text field): there is nothing to paste into.
final class TakeoverView: NSView {
    private let model: TakeoverModel
    private weak var actions: TakeoverActions?

    private let brand = BrandView(size: 26)
    private let eyebrow = Theme.label("", font: Theme.sans(12), color: Theme.inkFaint)
    private let title = Theme.label("", font: Theme.serif(54), color: Theme.ink)
    private let subtitle = Theme.label("", font: Theme.sans(20), color: Theme.inkMute)
    private let line = Theme.label("", font: Theme.serif(24), color: Theme.forest)
    private let wordsHint = Theme.label("", font: Theme.sans(13), color: Theme.inkFaint)
    private let wordsScroll = NSScrollView()
    private let wordsText = NSTextView()
    private let prompt = Theme.label("", font: Theme.sans(12), color: Theme.inkFaint)
    private let phrase = PhraseBox()
    private let hint = Theme.label("", font: Theme.sans(13), color: Theme.inkFaint)
    private let snooze = PillButton("", style: .secondary)
    private let call = PillButton("", style: .primary)
    private let whatsApp = PillButton("", style: .secondary)
    private let finish = PillButton("", style: .primary)
    private let snoozeNote = Theme.label("", font: Theme.sans(13), color: Theme.inkFaint)
    private let skipLine = Theme.label("", font: Theme.sans(14), color: Theme.inkFaint)
    private let skipNote = Theme.label("", font: Theme.sans(13), color: Theme.inkFaint)
    private let why = Theme.label("", font: Theme.sans(12.5), color: Theme.inkFaint)
    private var wordsFrame = NSRect.zero
    private var lastWordsKey = ""

    init(model: TakeoverModel, actions: TakeoverActions?) {
        self.model = model
        self.actions = actions
        super.init(frame: .zero)

        wordsText.isEditable = false
        wordsText.isSelectable = false
        wordsText.drawsBackground = false
        wordsText.textContainerInset = NSSize(width: 22, height: 18)
        wordsText.isVerticallyResizable = true
        wordsText.isHorizontallyResizable = false
        wordsText.autoresizingMask = [.width]
        wordsText.textContainer?.widthTracksTextView = true
        wordsScroll.documentView = wordsText
        wordsScroll.hasVerticalScroller = true
        wordsScroll.drawsBackground = false
        wordsScroll.borderType = .noBorder
        wordsScroll.autohidesScrollers = true

        snooze.onClick = { [weak self] in self?.actions?.takeoverSnooze() }
        call.onClick = { [weak self] in self?.actions?.takeoverCall() }
        whatsApp.onClick = { [weak self] in self?.actions?.takeoverWhatsApp() }
        finish.onClick = { [weak self] in self?.actions?.takeoverFinish() }

        for v in [brand, eyebrow, title, subtitle, line, wordsHint, wordsScroll, prompt, phrase, hint, snooze, call, whatsApp, finish, snoozeNote, skipLine, skipNote, why] as [NSView] {
            addSubview(v)
        }
        setAccessibilityLabel("Samwise check-in alarm")
    }

    required init?(coder: NSCoder) { nil }

    override var isFlipped: Bool { true }
    override var isOpaque: Bool { true }
    override var acceptsFirstResponder: Bool { true }
    override func acceptsFirstMouse(for event: NSEvent?) -> Bool { true }

    /// Scale for small and large displays; 1 on a 900-point-tall screen.
    private var k: CGFloat {
        let h = bounds.height > 0 ? bounds.height : 900
        return max(0.72, min(1.35, h / 900))
    }

    // MARK: Input

    override func keyDown(with event: NSEvent) {
        if model.showWords {
            switch event.keyCode {
            case 125, 121: scrollWords(by: 80); return
            case 126, 116: scrollWords(by: -80); return
            default: break
            }
        }
        actions?.takeoverKey(event)
    }

    override func mouseDown(with event: NSEvent) {
        window?.makeKey()
        window?.makeFirstResponder(self)
        actions?.takeoverTouched()
    }

    private func scrollWords(by delta: CGFloat) {
        let clip = wordsScroll.contentView
        let maxY = max(0, wordsText.frame.height - clip.bounds.height)
        let y = max(0, min(maxY, clip.bounds.origin.y + delta))
        clip.scroll(to: NSPoint(x: 0, y: y))
        wordsScroll.reflectScrolledClipView(clip)
    }

    // MARK: Content

    private func set(_ label: NSTextField, _ text: String, font: NSFont, color: NSColor, kern: CGFloat = 0, lineHeight: CGFloat = 1) {
        let p = NSMutableParagraphStyle()
        p.alignment = .center
        p.lineBreakMode = .byWordWrapping
        p.lineHeightMultiple = lineHeight
        label.attributedStringValue = NSAttributedString(string: text, attributes: [.font: font, .foregroundColor: color, .kern: kern, .paragraphStyle: p])
        label.isHidden = text.isEmpty
    }

    func refresh() {
        let k = self.k
        let commit = PhraseMatch.normalize(model.commitPhrase)
        let skip = PhraseMatch.normalize(model.skipPhrase)
        let onCommit = !model.typed.isEmpty && commit.hasPrefix(model.typed)
        let onSkip = !model.typed.isEmpty && !onCommit && skip.hasPrefix(model.typed)
        let wrong = model.wrongAt.map { Date().timeIntervalSince($0) < 0.7 } ?? false

        set(eyebrow, model.eyebrow.uppercased(), font: Theme.sans(12 * k, .bold), color: Theme.inkFaint, kern: 1.6)
        set(title, model.title, font: Theme.serif(54 * k), color: Theme.ink, kern: -0.8, lineHeight: 0.95)
        set(subtitle, model.subtitle, font: Theme.sans(20 * k), color: Theme.inkMute, lineHeight: 1.15)

        let showingWords = model.showWords && !model.words.isEmpty
        set(line, showingWords ? "" : model.line, font: Theme.serif(25 * k, italic: true), color: Theme.forest, lineHeight: 1.1)
        set(wordsHint, model.wordsHint, font: Theme.sans(13 * k), color: Theme.inkFaint)
        wordsScroll.isHidden = !showingWords
        if showingWords {
            let key = model.words.map { $0.title + "\u{1}" + $0.body }.joined(separator: "\u{2}") + "|\(k)|" + model.wordsTitle
            if key != lastWordsKey {
                lastWordsKey = key
                wordsText.textStorage?.setAttributedString(wordsString(k))
                wordsScroll.contentView.scroll(to: .zero)
            }
        }

        set(prompt, model.prompt.uppercased(), font: Theme.sans(12 * k, .bold), color: Theme.inkFaint, kern: 1.4)
        phrase.phrase = model.commitPhrase
        phrase.typedLetters = onCommit ? model.typed.count : 0
        phrase.wrong = wrong
        phrase.fontSize = 27 * k
        phrase.needsDisplay = true
        set(hint, model.hint, font: Theme.sans(13 * k), color: wrong ? Theme.red : Theme.inkFaint)

        configure(snooze, model.snoozeTitle, enabled: model.snoozeEnabled)
        configure(call, model.callTitle, enabled: true)
        configure(whatsApp, model.whatsAppTitle, enabled: true)
        configure(finish, model.finishTitle, enabled: true)
        set(snoozeNote, model.snoozeNote, font: Theme.sans(13 * k), color: Theme.inkFaint)

        // "To skip, type: I choose to skip this check-in", with the typed letters in black.
        let p = NSMutableParagraphStyle()
        p.alignment = .center
        let skipText = NSMutableAttributedString(string: model.skipPrompt + " ", attributes: [.font: Theme.sans(14 * k), .foregroundColor: Theme.inkFaint, .paragraphStyle: p])
        let mono = NSFont.monospacedSystemFont(ofSize: 14 * k, weight: .medium)
        let n = coveredPrefix(of: model.skipPhrase, letters: onSkip ? model.typed.count : 0)
        skipText.append(NSAttributedString(string: String(model.skipPhrase.prefix(n)), attributes: [.font: mono, .foregroundColor: Theme.ink, .paragraphStyle: p]))
        skipText.append(NSAttributedString(string: String(model.skipPhrase.dropFirst(n)), attributes: [.font: mono, .foregroundColor: Theme.inkMute, .paragraphStyle: p]))
        skipLine.attributedStringValue = skipText
        skipLine.isHidden = model.skipPhrase.isEmpty
        set(skipNote, model.skipNote, font: Theme.sans(13 * k), color: Theme.inkFaint)
        set(why, model.why, font: Theme.sans(12.5 * k), color: Theme.inkFaint, lineHeight: 1.15)

        needsLayout = true
        needsDisplay = true
    }

    private func configure(_ button: PillButton, _ title: String?, enabled: Bool) {
        button.isHidden = title == nil
        if let t = title, button.title != t { button.title = t }
        if button.isEnabled != enabled { button.isEnabled = enabled }
        button.fontSize = 12 * max(0.9, k)
    }

    private func wordsString(_ k: CGFloat) -> NSAttributedString {
        let out = NSMutableAttributedString()
        let head = NSMutableParagraphStyle()
        head.paragraphSpacing = 4
        let body = NSMutableParagraphStyle()
        body.lineHeightMultiple = 1.2
        body.paragraphSpacing = 16
        let last = NSMutableParagraphStyle()
        last.lineHeightMultiple = 1.2
        for (i, w) in model.words.enumerated() {
            // Words without a heading of their own (the person's opening words) get the general one.
            let heading = w.title.isEmpty ? (i == 0 ? model.wordsTitle : "") : w.title
            if !heading.isEmpty {
                out.append(NSAttributedString(string: heading.uppercased() + "\n", attributes: [.font: Theme.sans(11.5 * k, .bold), .foregroundColor: Theme.forest, .kern: 1.3, .paragraphStyle: head]))
            }
            let isLast = i == model.words.count - 1
            out.append(NSAttributedString(string: w.body.trimmingCharacters(in: .whitespacesAndNewlines) + (isLast ? "" : "\n"), attributes: [.font: Theme.serif(19 * k), .foregroundColor: Theme.ink, .paragraphStyle: isLast ? last : body]))
        }
        return out
    }

    // MARK: Layout

    override func layout() {
        super.layout()
        let k = self.k
        let W = bounds.width
        let H = bounds.height
        let margin = max(24, 40 * k)
        let col = min(880 * max(1, k), W - 2 * margin)

        let b = brand.preferredSize
        brand.frame = NSRect(x: margin, y: margin * 0.8, width: b.width, height: b.height)

        // Footer: why the screen is taken, pinned to the bottom.
        let whyWidth = min(col, 760 * max(1, k))
        let whyHeight = why.isHidden ? 0 : Theme.height(of: why, width: whyWidth)
        why.frame = NSRect(x: (W - whyWidth) / 2, y: H - margin * 0.8 - whyHeight, width: whyWidth, height: whyHeight)

        struct Row {
            let views: [NSView]
            let size: NSSize
            let gap: CGFloat
        }
        var rows: [Row] = []
        func addLabel(_ label: NSTextField, width: CGFloat, gap: CGFloat) {
            guard !label.isHidden else { return }
            rows.append(Row(views: [label], size: NSSize(width: width, height: Theme.height(of: label, width: width)), gap: gap))
        }

        addLabel(eyebrow, width: col, gap: 0)
        addLabel(title, width: col, gap: 14 * k)
        addLabel(subtitle, width: min(col, 720 * max(1, k)), gap: 16 * k)
        addLabel(line, width: min(col, 700 * max(1, k)), gap: 34 * k)

        var wordsRowIndex: Int?
        if !wordsScroll.isHidden {
            let width = min(col, 760 * max(1, k))
            wordsText.frame = NSRect(x: 0, y: 0, width: width, height: 10)
            var textHeight: CGFloat = 120
            if let lm = wordsText.layoutManager, let tc = wordsText.textContainer {
                tc.size = NSSize(width: width - 2 * wordsText.textContainerInset.width, height: .greatestFiniteMagnitude)
                lm.ensureLayout(for: tc)
                textHeight = ceil(lm.usedRect(for: tc).height) + 2 * wordsText.textContainerInset.height
            }
            wordsText.frame = NSRect(x: 0, y: 0, width: width, height: textHeight)
            let height = min(textHeight, max(120, H * 0.3))
            wordsRowIndex = rows.count
            rows.append(Row(views: [wordsScroll], size: NSSize(width: width, height: height), gap: 26 * k))
        }
        addLabel(wordsHint, width: col, gap: 10 * k)
        addLabel(prompt, width: col, gap: 30 * k)

        let boxSize = phrase.preferredSize()
        rows.append(Row(views: [phrase], size: NSSize(width: min(boxSize.width, col), height: boxSize.height), gap: 10 * k))
        addLabel(hint, width: col, gap: 10 * k)

        let buttons = [finish, call, whatsApp, snooze].filter { !$0.isHidden }
        if !buttons.isEmpty {
            let spacing: CGFloat = 12
            let width = buttons.reduce(CGFloat(0)) { $0 + $1.preferredSize.width } + spacing * CGFloat(buttons.count - 1)
            let height = buttons.map { $0.preferredSize.height }.max() ?? 44
            rows.append(Row(views: buttons, size: NSSize(width: width, height: height), gap: 24 * k))
        }
        addLabel(snoozeNote, width: col, gap: 10 * k)
        addLabel(skipLine, width: col, gap: 26 * k)
        addLabel(skipNote, width: min(col, 720 * max(1, k)), gap: 6 * k)

        let total = rows.reduce(CGFloat(0)) { $0 + $1.size.height + $1.gap }
        let top = b.height + margin * 1.2
        let bottom = H - margin * 0.8 - whyHeight - 16
        var y = max(top, top + (bottom - top - total) / 2)
        for (i, row) in rows.enumerated() {
            y += row.gap
            if row.views.count == 1, let v = row.views.first {
                v.frame = NSRect(x: (W - row.size.width) / 2, y: y, width: row.size.width, height: row.size.height).integral
                if i == wordsRowIndex { wordsFrame = v.frame }
            } else {
                var x = (W - row.size.width) / 2
                for v in row.views {
                    let s = (v as? PillButton)?.preferredSize ?? v.frame.size
                    v.frame = NSRect(x: x, y: y + (row.size.height - s.height) / 2, width: s.width, height: s.height).integral
                    x += s.width + 12
                }
            }
            y += row.size.height
        }
        if wordsScroll.isHidden { wordsFrame = .zero }
    }

    override func draw(_ dirtyRect: NSRect) {
        Theme.bg.setFill()
        bounds.fill()
        if wordsFrame != .zero {
            let path = NSBezierPath(roundedRect: wordsFrame.insetBy(dx: -1, dy: -1), xRadius: 14, yRadius: 14)
            Theme.paper.setFill()
            path.fill()
            Theme.rule.setStroke()
            path.lineWidth = 1
            path.stroke()
        }
    }
}

/// One alarm window. A panel so it can take keys without bringing the whole app forward,
/// and so it shows above full-screen apps on every Space.
final class TakeoverPanel: NSPanel {
    override var canBecomeKey: Bool { true }
    override var canBecomeMain: Bool { true }

    override func performKeyEquivalent(with event: NSEvent) -> Bool {
        // Command shortcuts (Cmd-Q, Cmd-W, Cmd-H) do nothing while the alarm is up.
        // macOS's own Force Quit (Cmd-Opt-Esc) is handled by the system and still works.
        if event.modifierFlags.contains(.command) { return true }
        return super.performKeyEquivalent(with: event)
    }

    override func cancelOperation(_ sender: Any?) {}
}

@MainActor
final class TakeoverPresenter {
    let model = TakeoverModel()
    weak var actions: TakeoverActions?
    var allowCapture = false
    private var panels: [TakeoverPanel] = []
    private var screenKey = ""

    var isUp: Bool { !panels.isEmpty }
    var screenCount: Int { panels.count }

    private func currentScreenKey() -> String {
        NSScreen.screens.map { NSStringFromRect($0.frame) }.joined(separator: "|")
    }

    /// Puts the alarm on every display (again, if displays changed) and redraws it.
    func show() {
        let key = currentScreenKey()
        if panels.isEmpty || key != screenKey {
            build()
            screenKey = key
        }
        refresh()
        keepOnTop()
    }

    private func build() {
        let fresh = panels.isEmpty
        for p in panels { p.orderOut(nil) }
        panels.removeAll()
        for screen in NSScreen.screens {
            let panel = TakeoverPanel(contentRect: NSRect(x: 0, y: 0, width: 640, height: 480), styleMask: [.borderless, .nonactivatingPanel], backing: .buffered, defer: false)
            panel.level = .screenSaver
            panel.collectionBehavior = [.canJoinAllSpaces, .fullScreenAuxiliary, .stationary, .ignoresCycle]
            panel.isOpaque = true
            panel.backgroundColor = Theme.bg
            panel.hasShadow = false
            panel.hidesOnDeactivate = false
            panel.isMovable = false
            panel.isReleasedWhenClosed = false
            panel.animationBehavior = .none
            panel.appearance = NSAppearance(named: .aqua)
            panel.sharingType = allowCapture ? .readOnly : .none
            panel.becomesKeyOnlyIfNeeded = false
            panel.setFrame(screen.frame, display: false)
            let view = TakeoverView(model: model, actions: actions)
            view.frame = NSRect(origin: .zero, size: screen.frame.size)
            view.autoresizingMask = [.width, .height]
            panel.contentView = view
            panel.alphaValue = fresh ? 0 : 1
            panel.orderFrontRegardless()
            panels.append(panel)
        }
        if fresh {
            NSAnimationContext.runAnimationGroup { context in
                context.duration = 0.3
                for p in panels { p.animator().alphaValue = 1 }
            }
        }
        Log.write("takeover: on \(panels.count) display(s)")
    }

    func refresh() {
        for p in panels { (p.contentView as? TakeoverView)?.refresh() }
    }

    /// Called every second while the alarm is up: stay in front and keep the keyboard.
    func keepOnTop() {
        guard !panels.isEmpty else { return }
        for p in panels where !p.isVisible { p.orderFrontRegardless() }
        if !NSApp.isActive { NSApp.activate(ignoringOtherApps: true) }
        if !panels.contains(where: { $0.isKeyWindow }) {
            let mouse = NSEvent.mouseLocation
            let target = panels.first { $0.frame.contains(mouse) } ?? panels[0]
            target.makeKeyAndOrderFront(nil)
            target.makeFirstResponder(target.contentView)
        }
    }

    var hasKeyboard: Bool { panels.contains { $0.isKeyWindow } }

    func hide() {
        guard !panels.isEmpty else { return }
        let old = panels
        panels.removeAll()
        screenKey = ""
        NSAnimationContext.runAnimationGroup({ context in
            context.duration = 0.25
            for p in old { p.animator().alphaValue = 0 }
        }, completionHandler: {
            for p in old { p.orderOut(nil) }
        })
        Log.write("takeover: off")
    }
}
