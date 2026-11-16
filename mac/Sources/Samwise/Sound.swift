import AppKit
import AVFoundation
import IOKit.pwr_mgt

/// The alarm's sounds, made in code (no audio files): a soft chime for the heads-up,
/// a ring that grows, and a sharper ring if nobody answers for a minute.
@MainActor
final class SoundEngine {
    enum Tone: String { case chime, ring, urgent }

    var muted = false
    private var players: [Tone: AVAudioPlayer] = [:]
    private var looping: Tone?
    /// The Mac's output volume before the alarm raised it, to put it back afterwards.
    private var savedVolume: Int?
    private var savedMuted: Bool?

    private static let sampleRate = 44_100.0

    private func player(_ tone: Tone) -> AVAudioPlayer? {
        if let p = players[tone] { return p }
        let data: Data
        switch tone {
        case .chime: data = Self.wav(Self.chime())
        case .ring: data = Self.wav(Self.ring())
        case .urgent: data = Self.wav(Self.urgent())
        }
        guard let p = try? AVAudioPlayer(data: data) else {
            Log.write("sound: could not prepare \(tone.rawValue)")
            return nil
        }
        p.prepareToPlay()
        players[tone] = p
        return p
    }

    /// One soft chime. Does nothing while a ring is looping.
    func chime(volume: Float = 0.5) {
        guard !muted, looping == nil, let p = player(.chime) else { return }
        p.numberOfLoops = 0
        p.currentTime = 0
        p.volume = volume
        p.play()
    }

    /// Keeps `tone` looping at `volume`. Safe to call every second.
    func loop(_ tone: Tone, volume: Float) {
        guard !muted else { return }
        if looping != tone {
            if let old = looping { players[old]?.stop() }
            guard let p = player(tone) else { return }
            p.numberOfLoops = -1
            p.currentTime = 0
            p.volume = volume
            p.play()
            looping = tone
            Log.write("sound: \(tone.rawValue) on")
        } else if let p = players[tone] {
            p.volume = volume
            if !p.isPlaying { p.play() }
        }
    }

    func stopLoop() {
        guard let tone = looping else { return }
        players[tone]?.stop()
        looping = nil
        Log.write("sound: off")
        restoreSystemVolume()
    }

    var isLooping: Bool { looping != nil }

    // MARK: The Mac's own volume

    /// If the Mac is muted or very quiet, bring it to `percent` so the alarm can be heard.
    /// The earlier volume is put back when the ring stops. Controlled by "Raise the volume" in Settings.
    func raiseSystemVolume(to percent: Int) {
        guard !muted, savedVolume == nil else { return }
        guard let current = Self.script("output volume of (get volume settings)")?.int32Value else { return }
        let isMuted = Self.script("output muted of (get volume settings)")?.booleanValue ?? false
        guard isMuted || Int(current) < percent else { return }
        savedVolume = Int(current)
        savedMuted = isMuted
        _ = Self.script("set volume output volume \(percent) without output muted")
        Log.write("sound: raised Mac volume from \(current) to \(percent)")
    }

    private func restoreSystemVolume() {
        guard let v = savedVolume else { return }
        let m = savedMuted ?? false
        _ = Self.script("set volume output volume \(v) \(m ? "with" : "without") output muted")
        savedVolume = nil
        savedMuted = nil
        Log.write("sound: Mac volume back to \(v)")
    }

    private static func script(_ source: String) -> NSAppleEventDescriptor? {
        var error: NSDictionary?
        let result = NSAppleScript(source: source)?.executeAndReturnError(&error)
        if error != nil { return nil }
        return result
    }

    // MARK: Waking the screen

    /// Lights a dimmed or sleeping display, as a key press would.
    static func wakeDisplay() {
        var assertion: IOPMAssertionID = 0
        _ = IOPMAssertionDeclareUserActivity("Samwise check-in alarm" as CFString, kIOPMUserActiveLocal, &assertion)
    }

    // MARK: Tones

    private static func note(_ frequency: Double, _ seconds: Double, gain: Double = 1, decay: Double = 5, harmonics: [Double] = [1, 0.35, 0.12]) -> [Float] {
        let n = Int(seconds * sampleRate)
        var out = [Float](repeating: 0, count: n)
        let attack = 0.008 * sampleRate
        let release = 0.02 * sampleRate
        for i in 0..<n {
            let t = Double(i) / sampleRate
            var v = 0.0
            for (h, amp) in harmonics.enumerated() {
                v += amp * sin(2 * .pi * frequency * Double(h + 1) * t)
            }
            var env = exp(-decay * t)
            if Double(i) < attack { env *= Double(i) / attack }
            if Double(n - i) < release { env *= Double(n - i) / release }
            out[i] = Float(v * env * gain * 0.6)
        }
        return out
    }

    private static func silence(_ seconds: Double) -> [Float] {
        [Float](repeating: 0, count: Int(seconds * sampleRate))
    }

    private static func chime() -> [Float] {
        var s: [Float] = []
        s.append(contentsOf: note(659.25, 0.45, decay: 6))
        s.append(contentsOf: note(880, 0.9, decay: 4.5))
        return s
    }

    private static func ring() -> [Float] {
        var s: [Float] = []
        for _ in 0..<2 {
            s.append(contentsOf: note(880, 0.2, decay: 3))
            s.append(contentsOf: silence(0.05))
            s.append(contentsOf: note(1318.5, 0.2, decay: 3))
            s.append(contentsOf: silence(0.05))
        }
        s.append(contentsOf: note(880, 0.5, decay: 4))
        s.append(contentsOf: silence(1.3))
        return s
    }

    private static func urgent() -> [Float] {
        let harsh: [Double] = [1, 0.6, 0.4, 0.25]
        var s: [Float] = []
        for _ in 0..<4 {
            s.append(contentsOf: note(1760, 0.13, decay: 1, harmonics: harsh))
            s.append(contentsOf: silence(0.07))
        }
        s.append(contentsOf: silence(0.5))
        return s
    }

    /// 16-bit mono WAV.
    private static func wav(_ samples: [Float]) -> Data {
        var data = Data()
        let byteCount = UInt32(samples.count * 2)
        func append32(_ v: UInt32) { withUnsafeBytes(of: v.littleEndian) { data.append(contentsOf: $0) } }
        func append16(_ v: UInt16) { withUnsafeBytes(of: v.littleEndian) { data.append(contentsOf: $0) } }
        data.append(contentsOf: Array("RIFF".utf8))
        append32(36 + byteCount)
        data.append(contentsOf: Array("WAVE".utf8))
        data.append(contentsOf: Array("fmt ".utf8))
        append32(16)
        append16(1)
        append16(1)
        append32(UInt32(sampleRate))
        append32(UInt32(sampleRate) * 2)
        append16(2)
        append16(16)
        data.append(contentsOf: Array("data".utf8))
        append32(byteCount)
        data.reserveCapacity(data.count + samples.count * 2)
        for s in samples {
            let clipped = max(-1, min(1, s))
            let v = Int16(clipped * 32_767)
            withUnsafeBytes(of: v.littleEndian) { data.append(contentsOf: $0) }
        }
        return data
    }
}
