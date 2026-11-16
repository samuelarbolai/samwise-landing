import Foundation

/// Compares what the user typed with the line they have to type.
/// Spaces, punctuation, capitals and accents never count: "check in", "Check-in" and "checkin" are the same.
public enum PhraseMatch: Equatable {
    case empty
    case onTrack
    case offTrack
    case complete

    public static func normalize(_ text: String) -> String {
        let folded = text.folding(options: [.diacriticInsensitive, .caseInsensitive, .widthInsensitive], locale: Locale(identifier: "en_US"))
        return String(folded.lowercased().unicodeScalars.filter { CharacterSet.alphanumerics.contains($0) })
    }

    public static func check(typed: String, target: String) -> PhraseMatch {
        let t = normalize(typed)
        let goal = normalize(target)
        if t.isEmpty { return .empty }
        if t == goal { return .complete }
        if goal.hasPrefix(t) { return .onTrack }
        return .offTrack
    }
}

/// Every sentence the app shows, in English and Spanish. Voice: calm, plain, direct. No exclamation marks.
/// The app never says Samwise does something it does not do: lines about the phone call and about
/// trusted people are only used when the server confirmed them for this user.
public struct Copy {
    public let es: Bool

    public init(language: String?) {
        let l = (language ?? "en").lowercased()
        es = l.hasPrefix("es")
    }

    private func t(_ en: String, _ esText: String) -> String { es ? esText : en }

    // MARK: Lines to type

    public var commitPhrase: String { t("I am doing my check-in now", "Voy a hacer mi chequeo ahora") }
    public var skipPhrase: String { t("I choose to skip this check-in", "Elijo saltarme este chequeo") }
    public var pausePhrase: String { t("I choose to pause my alarms", "Elijo pausar mis alarmas") }

    // MARK: Takeover

    public func title(_ kind: TakeoverKind, time: String, secondsToCheckin: Int) -> String {
        switch kind {
        case .countdown:
            return t("Your check-in is in \(ScheduleMath.countdown(secondsToCheckin)).", "Tu chequeo es en \(ScheduleMath.countdown(secondsToCheckin)).")
        case .ringing:
            return t("It's time for your check-in.", "Es hora de tu chequeo.")
        case .late:
            return t("Your \(time) check-in is waiting.", "Tu chequeo de las \(time) te espera.")
        case .followUp:
            return t("Did your check-in happen?", "¿Hiciste tu chequeo?")
        case .missedCall:
            return t("You missed Samwise's call.", "No contestaste la llamada de Samwise.")
        case .test:
            return t("This is your check-in alarm.", "Esta es la alarma de tu chequeo.")
        }
    }

    /// `willCall`: Samwise phones this user at this time (confirmed by the server). `number`: Samwise's number.
    /// `deadline`: until when a call back keeps trusted people out of it ("16:30"), nil when that does not apply.
    public func subtitle(_ kind: TakeoverKind, time: String, minutesLate: Int, willCall: Bool, number: String?, deadline: String?, startedAt: String?) -> String {
        let callBack: String = {
            guard let n = number else { return "" }
            if let d = deadline {
                return t(" Call Samwise now: \(n). Before \(d), nobody is told.", " Llama a Samwise ahora: \(n). Antes de las \(d), nadie recibe aviso.")
            }
            return t(" Call Samwise now: \(n).", " Llama a Samwise ahora: \(n).")
        }()
        switch kind {
        case .countdown:
            return willCall
                ? t("Samwise calls your phone at \(time). Get it in your hand.", "Samwise te llama a las \(time). Ten el teléfono en la mano.")
                : t("Wrap up. It starts at \(time).", "Cierra lo que estás haciendo. Empieza a las \(time).")
        case .ringing:
            return willCall
                ? t("Samwise is calling your phone now. Pick up.", "Samwise te está llamando ahora. Contesta.")
                : t("Stop here. Do your check-in now.", "Para aquí. Haz tu chequeo ahora.")
        case .late:
            let ago = minutesLate >= 2
                ? t("It was \(minutesLate) minutes ago.", "Fue hace \(minutesLate) minutos.")
                : t("It is time.", "Es la hora.")
            return willCall ? ago + callBack : ago + t(" Do it now.", " Hazlo ahora.")
        case .followUp:
            let since = startedAt.map { t("You said you were starting at \($0).", "Dijiste que empezabas a las \($0).") } ?? ""
            return since + t(" If it is done, say so below. If not, do it now.", " Si ya está hecho, dilo abajo. Si no, hazlo ahora.")
        case .missedCall:
            return t("The phone rang and nobody picked up.", "El teléfono sonó y nadie contestó.") + callBack
        case .test:
            return t("Nothing is being called. This is only a test, so you know what to expect.", "No se está llamando a nadie. Es solo una prueba, para que sepas qué esperar.")
        }
    }

    public var typeToGetScreenBack: String { t("To get your screen back, type:", "Para recuperar tu pantalla, escribe:") }
    public var typeToSkip: String { t("To skip, type:", "Para saltarlo, escribe:") }
    public var wrongLetter: String { t("That letter is not next. Type the line as shown; capitals and spaces do not matter.", "Esa letra no sigue. Escribe la frase como aparece; mayúsculas y espacios no importan.") }
    public var clickToType: String { t("Click here, then type.", "Haz clic aquí y escribe.") }

    public func snooze(minutes: Int, left: Int) -> String {
        t("Snooze \(minutes) min (\(left) left)", "Posponer \(minutes) min (quedan \(left))")
    }
    public var noSnoozesLeft: String { t("No snoozes left", "No quedan pospuestos") }
    public var skipToday: String { t("Skip this check-in", "Saltar este chequeo") }
    public var backToCheckin: String { t("Back", "Volver") }
    public var iFinished: String { t("I finished my check-in", "Terminé mi chequeo") }
    public var endTest: String { t("End the test", "Terminar la prueba") }
    public var showWords: String { t("Press Tab to read your words.", "Presiona Tab para leer tus palabras.") }
    public var hideWords: String { t("Press Tab or Esc to go back.", "Presiona Tab o Esc para volver.") }
    public var yourWords: String { t("Your words", "Tus palabras") }
    public var soundHint: String { t("Any key or click quiets the sound for two minutes. Your screen stays until you type the line.", "Cualquier tecla o clic calla el sonido por dos minutos. La pantalla sigue hasta que escribas la frase.") }

    public func callSamwise(_ number: String) -> String { t("Call \(number)", "Llamar al \(number)") }
    public var openWhatsApp: String { t("Open Samwise on WhatsApp", "Abrir Samwise en WhatsApp") }

    /// Why the screen is taken, and that the user is in charge. Always on screen (product rule 2026-11-15).
    public var why: String {
        t("Why your screen is taken: you asked Samwise to make this check-in impossible to miss. You are always in charge. Snooze or skip above, or change this in Settings, the ✦ in your menu bar.",
          "Por qué se toma tu pantalla: le pediste a Samwise que este chequeo sea imposible de pasar por alto. Tú siempre decides. Pospón o sáltalo arriba, o cámbialo en Ajustes, el ✦ en tu barra de menús.")
    }

    public func snoozeConsequence(willCall: Bool, number: String?) -> String {
        guard willCall, let n = number else { return "" }
        return t("Snoozing lets the call ring out. Call Samwise back when you can: \(n).", "Si pospones, la llamada se pierde. Llama a Samwise cuando puedas: \(n).")
    }

    public func skipConsequence(supportActive: Bool) -> String {
        supportActive
            ? t("Skipping only clears your screen. If the check-in is missed, Samwise still calls your trusted people after 30 minutes.",
                "Saltarlo solo libera tu pantalla. Si el chequeo no ocurre, Samwise igual llama a tus personas de confianza después de 30 minutos.")
            : t("Skipping only clears your screen. The check-in itself is still yours to do.",
                "Saltarlo solo libera tu pantalla. El chequeo sigue siendo tuyo.")
    }

    /// Shown while the user's own words are hidden. Samwise's own lines, never a quote put in a real person's mouth.
    public func line(day: Int) -> String {
        let en = [
            "The work will still be here in ten minutes.",
            "You set this time when you were thinking clearly. Trust that version of you.",
            "Ten minutes now is worth more than another hour of this.",
            "Stop here. Come back to yourself first.",
            "Nothing on this screen matters more than the next ten minutes.",
            "You do not have to feel ready. You only have to start.",
            "This is the part of the day you chose to protect.",
        ]
        let esLines = [
            "El trabajo seguirá aquí en diez minutos.",
            "Elegiste esta hora cuando pensabas con claridad. Confía en esa versión de ti.",
            "Diez minutos ahora valen más que otra hora de esto.",
            "Para aquí. Primero vuelve a ti.",
            "Nada en esta pantalla importa más que los próximos diez minutos.",
            "No tienes que sentirte listo. Solo tienes que empezar.",
            "Esta es la parte del día que elegiste proteger.",
        ]
        let list = es ? esLines : en
        return list[((day % list.count) + list.count) % list.count]
    }

    // MARK: Small panel at the top of the screen

    public func headsUp(_ seconds: Int) -> String {
        t("Check-in in \(ScheduleMath.countdown(seconds)). Wrap up.", "Chequeo en \(ScheduleMath.countdown(seconds)). Ve cerrando.")
    }
    public func snoozedPill(_ seconds: Int) -> String {
        t("Snoozed. Back in \(ScheduleMath.countdown(seconds)).", "Pospuesto. Vuelve en \(ScheduleMath.countdown(seconds)).")
    }
    public var inProgress: String { t("Check-in in progress.", "Chequeo en curso.") }
    public var didYouFinish: String { t("Did you finish your check-in?", "¿Terminaste tu chequeo?") }
    public var yesDone: String { t("Yes, done", "Sí, listo") }
    public var notYet: String { t("Not yet", "Todavía no") }
    public var finishedShort: String { t("I finished", "Terminé") }

    // MARK: After the check-in

    public var afterTitle: String { t("After your check-in", "Después de tu chequeo") }
    public var afterIntro: String { t("You set these for yourself. Pick one and do it now.", "Te pusiste esto tú. Elige una y hazla ahora.") }
    public var doneTitle: String { t("Check-in done.", "Chequeo hecho.") }
    public func doneBody(next: String?) -> String {
        guard let n = next else { return t("Your screen is yours again.", "Tu pantalla vuelve a ser tuya.") }
        return t("Your screen is yours again. Next check-in: \(n).", "Tu pantalla vuelve a ser tuya. Próximo chequeo: \(n).")
    }
    public var close: String { t("Close", "Cerrar") }
    public var skippedPill: String { t("Skipped. Your screen is yours again.", "Saltado. Tu pantalla vuelve a ser tuya.") }
    public var testDonePill: String { t("Test over. That is what your check-in alarm looks like.", "Fin de la prueba. Así se ve la alarma de tu chequeo.") }
    public var startedPill: String { t("Go. Samwise will ask in 15 minutes if you finished.", "Ve. Samwise preguntará en 15 minutos si terminaste.") }
    public func eyebrow(name: String?, time: String, test: Bool) -> String {
        if test { return t("Test", "Prueba") }
        let label = t("Check-in", "Chequeo") + " · " + time
        guard let n = name, !n.isEmpty else { return label }
        return n + " · " + label
    }
    public var markDone: String { t("Done", "Hecho") }

    // MARK: Welcome, settings, connect, pause

    public var welcomeTitle: String { t("An alarm you cannot miss.", "Una alarma que no puedes ignorar.") }
    public var welcomeBody: String {
        t("One minute before your check-in, Samwise takes over every screen of this Mac and rings. To get your screen back, you type one line:",
          "Un minuto antes de tu chequeo, Samwise toma todas las pantallas de este Mac y suena. Para recuperar tu pantalla, escribes una frase:")
    }
    public var welcomeCharge: String {
        t("You can always snooze or skip, and you can change every limit in Settings. Samwise is insistent because you asked it to be. You stay in charge.",
          "Siempre puedes posponer o saltar, y puedes cambiar cada límite en Ajustes. Samwise insiste porque tú se lo pediste. Tú decides.")
    }
    public var moveWhy: String {
        t("Samwise is running from a temporary place. Move it to Applications so it is still there tomorrow.",
          "Samwise está corriendo desde un lugar temporal. Muévelo a Aplicaciones para que siga ahí mañana.")
    }
    public var moveButton: String { t("Move to Applications", "Mover a Aplicaciones") }
    public var done: String { t("Done", "Listo") }
    public var settingsTitle: String { t("Settings", "Ajustes") }
    public var sectionAccount: String { t("Samwise account", "Cuenta de Samwise") }
    public var sectionAlarm: String { t("The alarm", "La alarma") }
    public var sectionWords: String { t("Your words", "Tus palabras") }
    public var sectionRunning: String { t("Staying on", "Mantenerse activo") }

    public var connected: String { t("Connected to Samwise.", "Conectado a Samwise.") }
    public func connectedAs(_ name: String) -> String { t("Connected as \(name).", "Conectado como \(name).") }
    public var noTimesOnAccount: String {
        t("Your account has no active check-in time, so this Mac stays quiet. Set one with Samwise on WhatsApp.",
          "Tu cuenta no tiene una hora de chequeo activa, así que este Mac no sonará. Pon una con Samwise en WhatsApp.")
    }
    public func checkinAt(_ times: String, zone: String) -> String {
        t("Check-in at \(times)\(zone). The time comes from your Samwise account.", "Chequeo a las \(times)\(zone). La hora viene de tu cuenta de Samwise.")
    }
    public var disconnect: String { t("Disconnect this Mac", "Desconectar este Mac") }
    public var connectWhy: String {
        t("Connect your Samwise account and this Mac follows your real check-in times, knows when Samwise is calling, stops when the check-in is done, and shows your own words and what you planned for after.",
          "Conecta tu cuenta de Samwise y este Mac sigue tus horas reales de chequeo, sabe cuándo Samwise te llama, se detiene cuando el chequeo está hecho y muestra tus propias palabras y lo que planeaste para después.")
    }
    public var connectButton: String { t("Connect to Samwise", "Conectar con Samwise") }
    public var connectButtonShort: String { t("Connect", "Conectar") }
    public var localTimeLabel: String { t("Without an account, check-in at", "Sin cuenta, chequeo a las") }
    public var localTimeHelp: String {
        t("24-hour time on this Mac's clock. Several times: 08:30, 16:00. Press Return to save.",
          "Hora de 24 h en el reloj de este Mac. Varias horas: 08:30, 16:00. Presiona Enter para guardar.")
    }
    public var keepRunning: String { t("Keep Samwise running", "Mantener Samwise activo") }
    public var keepRunningWhy: String {
        t("Starts when you log in and reopens if it closes, because an alarm that quits by accident is an alarm you miss. Untick it and Samwise only runs when you open it.",
          "Se abre al iniciar sesión y se reabre si se cierra, porque una alarma que se cierra por accidente es una alarma que se pierde. Desmárcalo y Samwise solo corre cuando lo abras.")
    }

    public var off: String { t("Off", "Apagado") }
    public func minutesBefore(_ n: Int) -> String { t("\(n) minutes before", "\(n) minutos antes") }
    public func minutes(_ n: Int) -> String { t("\(n) minutes", "\(n) minutos") }
    public func times(_ n: Int) -> String {
        if n == 0 { return t("never", "nunca") }
        return n == 1 ? t("once", "una vez") : t("\(n) times", "\(n) veces")
    }
    public var headsUpLabel: String { t("Small countdown", "Cuenta regresiva pequeña") }
    public var snoozeLabel: String { t("Snooze", "Posponer") }
    public var snoozeWhy: String {
        t("Snoozes are counted so the check-in cannot be pushed away all afternoon. Skipping is always possible.",
          "Los pospuestos se cuentan para que el chequeo no se aplace toda la tarde. Saltarlo siempre es posible.")
    }
    public var soundLabel: String { t("Sound", "Sonido") }
    public var soundEscalating: String { t("Grows louder", "Sube de volumen") }
    public var soundGentle: String { t("Gentle", "Suave") }
    public var soundOff: String { t("No sound", "Sin sonido") }
    public var raiseVolume: String { t("Raise the Mac's volume if nobody answers", "Subir el volumen del Mac si nadie responde") }
    public var raiseVolumeWhy: String {
        t("After one minute without a key or a click, a muted or quiet Mac is set to 60%. The earlier volume comes back when the ring stops.",
          "Tras un minuto sin tecla ni clic, un Mac en silencio o muy bajo pasa a 60%. El volumen anterior vuelve cuando el sonido se detiene.")
    }
    public var showWordsSetting: String { t("Show my own words on the alarm right away", "Mostrar mis palabras en la alarma de inmediato") }
    public var showWordsWhy: String {
        t("Off: your words stay hidden until you press Tab, in case someone can see your screen.",
          "Apagado: tus palabras quedan ocultas hasta que presiones Tab, por si alguien ve tu pantalla.")
    }
    public var openJournalSetting: String { t("Open my journal when I start the check-in", "Abrir mi cuaderno cuando empiezo el chequeo") }
    public var turnOff: String { t("Turn off and remove from this Mac…", "Apagar y quitar de este Mac…") }
    public var turnOffTitle: String { t("Turn off Samwise on this Mac?", "¿Apagar Samwise en este Mac?") }
    public var turnOffBody: String {
        t("The alarm stops and Samwise no longer starts by itself. Your Samwise account and its phone calls do not change. Afterwards you can drag Samwise to the Trash.",
          "La alarma se detiene y Samwise ya no se abre solo. Tu cuenta de Samwise y sus llamadas no cambian. Después puedes arrastrar Samwise a la Papelera.")
    }
    public var turnOffConfirm: String { t("Turn off", "Apagar") }
    public var cancel: String { t("Cancel", "Cancelar") }

    public var pairTitle: String { t("Connect to Samwise", "Conectar con Samwise") }
    public var pairBody: String {
        t("Enter the WhatsApp number you use with Samwise, with the country code. Samwise sends a 6-digit code to that WhatsApp.",
          "Escribe el número de WhatsApp que usas con Samwise, con el código del país. Samwise envía un código de 6 dígitos a ese WhatsApp.")
    }
    public var codePlaceholder: String { t("6-digit code", "Código de 6 dígitos") }
    public var sendCode: String { t("Send code", "Enviar código") }
    public var sending: String { t("Sending…", "Enviando…") }
    public var connecting: String { t("Connecting…", "Conectando…") }
    public var codeSent: String {
        t("If that number has a Samwise account, the code is on its way to WhatsApp. It works for 10 minutes. No code after a minute? Check the number and send it again.",
          "Si ese número tiene cuenta de Samwise, el código va en camino a WhatsApp. Sirve por 10 minutos. ¿No llega en un minuto? Revisa el número y envíalo de nuevo.")
    }
    public var pairCodeBody: String { t("Or use a pairing code, if Samwise gave you one:", "O usa un código de enlace, si Samwise te dio uno:") }
    public var pairCodePlaceholder: String { t("Pairing code", "Código de enlace") }
    public var useCode: String { t("Use code", "Usar código") }
    public var badPhone: String { t("Enter the number with its country code, like +57 300 123 4567.", "Escribe el número con el código del país, como +57 300 123 4567.") }
    public var badCode: String { t("That code did not work. Check it, or send a new one.", "Ese código no funcionó. Revísalo o pide uno nuevo.") }
    public var tooManyTries: String { t("Too many tries. Wait a few minutes and try again.", "Demasiados intentos. Espera unos minutos y vuelve a intentar.") }
    /// Never leave the user hanging: what failed, whose side it is on, what still works.
    public var serverTrouble: String {
        t("Samwise could not be reached. That is on Samwise's side or your connection, not something you did. The alarm on this Mac keeps working; try connecting again in a few minutes.",
          "No se pudo contactar a Samwise. Es del lado de Samwise o de tu conexión, no algo que hiciste. La alarma en este Mac sigue funcionando; intenta conectar de nuevo en unos minutos.")
    }
    public var connectionLost: String {
        t("This Mac was disconnected from your Samwise account. It now uses the time set here. Connect again in Settings.",
          "Este Mac se desconectó de tu cuenta de Samwise. Ahora usa la hora puesta aquí. Conecta de nuevo en Ajustes.")
    }
    public var offlineNote: String {
        t("Samwise could not be reached just now, so this Mac is using the last schedule it received.",
          "No se pudo contactar a Samwise, así que este Mac usa el último horario que recibió.")
    }

    public var pauseTitle: String { t("Pause alarms", "Pausar alarmas") }
    public var pauseBody: String { t("While paused, this Mac stays quiet at check-in time.", "En pausa, este Mac no suena a la hora del chequeo.") }
    public var pauseBodyAccount: String {
        t("While paused, this Mac stays quiet at check-in time. Samwise still calls your phone; this only pauses the Mac.",
          "En pausa, este Mac no suena a la hora del chequeo. Samwise igual te llama al teléfono; esto solo pausa el Mac.")
    }
    public var pauseTomorrow: String { t("Until tomorrow", "Hasta mañana") }
    public func pauseDays(_ n: Int) -> String { t("For \(n) days", "Por \(n) días") }
    public var pauseType: String { t("To pause, type:", "Para pausar, escribe:") }
    public var pauseButton: String { t("Pause", "Pausar") }
    public var pauseMismatch: String { t("That does not match the line yet.", "Todavía no coincide con la frase.") }
    public var pauseWhy: String {
        t("The typed line is there so pausing is a choice and not a reflex. You can turn the alarms back on at any time from the menu bar.",
          "La frase está para que pausar sea una decisión y no un reflejo. Puedes reactivar las alarmas cuando quieras desde la barra de menús.")
    }
    public var notConnected: String { t("Not connected to Samwise", "Sin conexión con Samwise") }
    public var moveFailed: String { t("Samwise could not copy itself. Drag it to the Applications folder yourself, then open it there.", "Samwise no pudo copiarse. Arrástralo tú a la carpeta Aplicaciones y ábrelo desde ahí.") }
    public var ok: String { "OK" }

    // MARK: Menu

    public func nextCheckin(_ when: String) -> String { t("Next check-in: \(when)", "Próximo chequeo: \(when)") }
    public var noCheckins: String { t("No check-in times set", "No hay horas de chequeo") }
    public func pausedUntil(_ when: String) -> String { t("Alarms paused until \(when)", "Alarmas en pausa hasta \(when)") }
    public var testAlarm: String { t("Test the alarm now", "Probar la alarma ahora") }
    public var openJournal: String { t("Open my journal", "Abrir mi cuaderno") }
    public var afterMenu: String { t("After the check-in…", "Después del chequeo…") }
    public var settings: String { t("Settings…", "Ajustes…") }
    public var pause: String { t("Pause alarms…", "Pausar alarmas…") }
    public var resume: String { t("Turn alarms back on", "Reactivar alarmas") }
    public var updateAvailable: String { t("Update available…", "Hay una actualización…") }
    public var quit: String { t("Quit Samwise", "Salir de Samwise") }
    public var today: String { t("today", "hoy") }
    public var tomorrow: String { t("tomorrow", "mañana") }
}
