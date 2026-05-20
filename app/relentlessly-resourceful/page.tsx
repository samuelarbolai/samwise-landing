"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import "../styles.css"
import "./styles.css"
import { chunkIdAtFraction } from "./audio-transcript"

const AUDIO_SRC = "/relentlessly-resourceful/audio"

function fmtTime(s: number): string {
  if (!Number.isFinite(s) || s < 0) return "0:00"
  const m = Math.floor(s / 60)
  const r = Math.floor(s % 60)
  return `${m}:${r < 10 ? "0" : ""}${r}`
}

function FootRef({ n }: { n: number }) {
  return (
    <a href={`#fn-${n}`} className="rr-fnref" aria-label={`Nota ${n}`}>
      [{n}]
    </a>
  )
}

export default function RelentlesslyResourcefulEs() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [activeId, setActiveId] = useState<string | null>(null)
  const lastScrollIdRef = useRef<string | null>(null)

  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    const onPlay = () => { setPlaying(true); setLoading(false); setError(null) }
    const onPause = () => setPlaying(false)
    const onEnded = () => { setPlaying(false); setActiveId(null) }
    const onWaiting = () => setLoading(true)
    const onPlaying = () => setLoading(false)
    const onLoadedMetadata = () => setDuration(a.duration || 0)
    const onTimeUpdate = () => {
      setCurrentTime(a.currentTime)
      const d = a.duration
      if (!Number.isFinite(d) || d <= 0) return
      const id = chunkIdAtFraction(a.currentTime / d)
      setActiveId(id)
      if (id && id !== lastScrollIdRef.current) {
        lastScrollIdRef.current = id
        const el = document.querySelector(`[data-rr-id="${id}"]`)
        if (el) (el as HTMLElement).scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }
    const onErr = () => {
      setError("No pudimos cargar el audio. Intenta de nuevo.")
      setLoading(false)
      setPlaying(false)
    }
    a.addEventListener("play", onPlay)
    a.addEventListener("pause", onPause)
    a.addEventListener("ended", onEnded)
    a.addEventListener("waiting", onWaiting)
    a.addEventListener("playing", onPlaying)
    a.addEventListener("loadedmetadata", onLoadedMetadata)
    a.addEventListener("timeupdate", onTimeUpdate)
    a.addEventListener("error", onErr)
    return () => {
      a.removeEventListener("play", onPlay)
      a.removeEventListener("pause", onPause)
      a.removeEventListener("ended", onEnded)
      a.removeEventListener("waiting", onWaiting)
      a.removeEventListener("playing", onPlaying)
      a.removeEventListener("loadedmetadata", onLoadedMetadata)
      a.removeEventListener("timeupdate", onTimeUpdate)
      a.removeEventListener("error", onErr)
    }
  }, [])

  const togglePlay = async () => {
    const a = audioRef.current
    if (!a) return
    setError(null)
    if (a.paused) {
      setLoading(true)
      try {
        await a.play()
      } catch {
        setError("No se pudo iniciar la reproducción.")
        setLoading(false)
      }
    } else {
      a.pause()
    }
  }

  const restart = () => {
    const a = audioRef.current
    if (!a) return
    a.pause()
    a.currentTime = 0
    setActiveId(null)
    lastScrollIdRef.current = null
  }

  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const a = audioRef.current
    if (!a || !Number.isFinite(a.duration) || a.duration <= 0) return
    const pct = Number(e.target.value) / 1000
    a.currentTime = pct * a.duration
  }

  const seekPct = duration > 0 ? Math.round((currentTime / duration) * 1000) : 0
  const mainLabel = loading ? "Cargando" : playing ? "Pausar" : "Escuchar el ensayo"
  const playing_cls = (id: string): string => (activeId === id ? "rr-playing" : "")

  const para = (id: string, body: ReactNode) => (
    <p data-rr-id={id} className={playing_cls(id)}>
      {body}
    </p>
  )

  return (
    <div className="editorial-root rr-root">
      <nav className="editorial-nav">
        <a href="/" className="brand">
          Samwise
        </a>
        <div className="nav-right">
          <a href="/" className="nav-link">
            ← Inicio
          </a>
          <a
            href="https://www.paulgraham.com/relres.html"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link"
          >
            EN ↗
          </a>
        </div>
      </nav>

      <div className="editorial-wrap editorial-wrap--narrow rr-page">
        <header className="rr-header">
          <div className="eyebrow rr-eyebrow">Ensayo · Paul Graham</div>
          <h1 data-rr-id="title" className={`editorial-h1 rr-title ${playing_cls("title")}`}>
            Implacablemente recursivo
          </h1>
          <div data-rr-id="date" className={`rr-date ${playing_cls("date")}`}>
            Marzo de 2009
          </div>

          <div className={`rr-listen ${playing ? "rr-listen--on" : ""}`} role="group" aria-label="Narración del ensayo">
            <button
              type="button"
              className="cta--primary rr-listen-main"
              onClick={togglePlay}
              aria-label={mainLabel}
              disabled={loading && !playing}
            >
              <span className="cta-text">{mainLabel}</span>
            </button>

            {(playing || currentTime > 0) && (
              <>
                <input
                  type="range"
                  className="rr-seek"
                  min={0}
                  max={1000}
                  value={seekPct}
                  onChange={onSeek}
                  aria-label="Posición en el audio"
                />
                <div className="rr-time" aria-live="off">
                  <span>{fmtTime(currentTime)}</span>
                  <span className="rr-time-sep">/</span>
                  <span>{fmtTime(duration)}</span>
                </div>
                <button
                  type="button"
                  className="rr-listen-stop"
                  onClick={restart}
                  aria-label="Reiniciar narración"
                >
                  Reiniciar
                </button>
              </>
            )}

            <audio ref={audioRef} src={AUDIO_SRC} preload="none" />
          </div>

          {error && <div className="rr-listen-error">{error}</div>}
        </header>

        <article className="rr-body letter-body">
          {para(
            "p1",
            <>
              Hace un par de días por fin logré reducir a dos palabras lo que significa ser un buen
              fundador de <em>startup</em>: implacablemente recursivo.
            </>,
          )}

          {para(
            "p2",
            <>
              Hasta entonces, lo mejor que había conseguido era reducir a una sola palabra la cualidad
              opuesta: <em>desventurado</em>. La mayoría de los diccionarios dicen que desventurado
              significa desafortunado. Pero los diccionarios no están haciendo muy bien su trabajo. A
              un equipo que juega mejor que sus rivales pero pierde por una mala decisión del árbitro
              se le podría llamar desafortunado, pero no desventurado. Desventurado implica pasividad.
              Ser desventurado es dejarse zarandear por las circunstancias: dejar que el mundo se
              salga con la suya contigo, en lugar de salirte tú con la tuya con el mundo.{" "}
              <FootRef n={1} />
            </>,
          )}

          {para(
            "p3",
            <>
              Por desgracia, no existe un antónimo de <em>desventurado</em>, lo que dificulta
              decirles a los fundadores a qué deben aspirar. &ldquo;No seas desventurado&rdquo; no es
              un gran grito de guerra.
            </>,
          )}

          {para(
            "p4",
            <>
              No es difícil expresar mediante metáforas la cualidad que buscamos. La mejor es
              probablemente la de un <em>running back</em> (el corredor en el fútbol americano). Un
              buen <em>running back</em> no solo es decidido, sino también flexible. Quiere avanzar
              por el campo, pero adapta sus planes sobre la marcha.
            </>,
          )}

          {para(
            "p5",
            <>
              Por desgracia, esto no es más que una metáfora, y no muy útil para la mayoría de la
              gente fuera de Estados Unidos. &ldquo;Sé como un <em>running back</em>&rdquo; no es
              mejor que &ldquo;No seas desventurado&rdquo;.
            </>,
          )}

          {para(
            "p6",
            <>
              Pero por fin he descubierto cómo expresar esta cualidad de manera directa. Estaba
              escribiendo una charla para inversores y tenía que explicar qué buscar en los
              fundadores. ¿Cómo sería alguien que fuera lo opuesto a desventurado? Sería
              implacablemente recursivo. No solo implacable. Eso no basta para hacer que las cosas
              salgan a tu favor, salvo en unos pocos terrenos bastante poco interesantes. En
              cualquier terreno interesante, las dificultades serán novedosas. Lo que significa que
              no puedes simplemente abrirte paso a la fuerza, porque al principio no sabes cuán
              difíciles son; no sabes si estás a punto de atravesar un bloque de espuma o de granito.
              Así que tienes que ser recursivo. Tienes que seguir probando cosas nuevas.
            </>,
          )}

          <blockquote data-rr-id="pull" className={`rr-pull ${playing_cls("pull")}`}>
            Sé implacablemente recursivo.
          </blockquote>

          {para(
            "p8",
            <>
              Eso suena bien, pero ¿no será simplemente una descripción de cómo tener éxito en
              general? Creo que no. Esta no es la receta para el éxito en la escritura o la pintura,
              por ejemplo. En ese tipo de trabajo la receta es más bien ser activamente curioso.{" "}
              <em>Recursivo</em> implica que los obstáculos son externos, como suelen serlo en las{" "}
              <em>startups</em>. Pero en la escritura y la pintura son sobre todo internos; el
              obstáculo es tu propia obtusidad. <FootRef n={2} />
            </>,
          )}

          {para(
            "p9",
            <>
              Probablemente haya otros campos en los que &ldquo;implacablemente recursivo&rdquo; sea
              la receta del éxito. Pero aunque otros campos la compartan, creo que esta es la mejor
              descripción breve que encontraremos de lo que hace a un buen fundador de{" "}
              <em>startup</em>. Dudo que pueda hacerse más precisa.
            </>,
          )}

          {para(
            "p10",
            <>
              Ahora que sabemos qué buscamos, surgen otras preguntas. Por ejemplo, ¿se puede enseñar
              esta cualidad? Después de cuatro años intentando enseñarla, diría que sí,
              sorprendentemente a menudo se puede. No a todo el mundo, pero sí a mucha gente.{" "}
              <FootRef n={3} /> Algunas personas son constitucionalmente pasivas, pero otras tienen
              una capacidad latente de ser implacablemente recursivas que solo necesita ser sacada a
              la luz.
            </>,
          )}

          {para(
            "p11",
            <>
              Esto es especialmente cierto en el caso de los jóvenes que, hasta ahora, siempre han
              estado bajo el yugo de algún tipo de autoridad. Ser implacablemente recursivo
              definitivamente no es la receta del éxito en las grandes empresas, ni en la mayoría de
              las escuelas. Ni siquiera quiero pensar cuál es la receta en las grandes empresas, pero
              sin duda es más larga y enrevesada, e implica alguna combinación de recursividad,
              obediencia y construcción de alianzas.
            </>,
          )}

          {para(
            "p12",
            <>
              Identificar esta cualidad también nos acerca a responder una pregunta que la gente
              suele hacerse: cuántas <em>startups</em> podría haber. No existe, como algunos parecen
              creer, ningún límite económico superior a ese número. No hay razón para creer que
              exista límite alguno a la cantidad de riqueza recién creada que los consumidores pueden
              absorber, como tampoco lo hay para el número de teoremas que pueden demostrarse. Así
              que probablemente el factor limitante del número de <em>startups</em> sea el grupo de
              fundadores potenciales. Algunas personas serían buenos fundadores, y otras no. Y ahora
              que podemos decir qué hace a un buen fundador, sabemos cómo poner un límite superior al
              tamaño de ese grupo.
            </>,
          )}

          {para(
            "p13",
            <>
              Esta prueba también es útil para los individuos. Si quieres saber si eres el tipo de
              persona adecuada para fundar una <em>startup</em>, pregúntate si eres implacablemente
              recursivo. Y si quieres saber si reclutar a alguien como cofundador, pregúntate si lo
              es.
            </>,
          )}

          {para(
            "p14",
            <>
              Incluso puedes usarla de forma táctica. Si yo dirigiera una <em>startup</em>, esta
              sería la frase que pegaría en el espejo. &ldquo;Haz algo que la gente quiera&rdquo; es
              el destino, pero &ldquo;Sé implacablemente recursivo&rdquo; es cómo llegar a él.
            </>,
          )}

          <hr className="rr-divider" />

          <h2 data-rr-id="notas" className={`rr-notes-heading ${playing_cls("notas")}`}>
            Notas
          </h2>

          <div id="fn-1" data-rr-id="n1a" className={`rr-note ${playing_cls("n1a")}`}>
            <span className="rr-note-num">[1]</span>
            Creo que la razón por la que los diccionarios se equivocan es que el significado de la
            palabra ha cambiado. Nadie que escribiera hoy un diccionario desde cero diría que{" "}
            <em>desventurado</em> significa desafortunado. Pero hace un par de siglos quizá sí. La
            gente estaba más a merced de las circunstancias en el pasado y, como resultado, muchas de
            las palabras que usamos para los buenos y malos desenlaces tienen su origen en palabras
            relacionadas con la suerte.
          </div>

          <div data-rr-id="n1b" className={`rr-note rr-note--cont ${playing_cls("n1b")}`}>
            Cuando vivía en Italia, una vez intentaba decirle a alguien que no había tenido mucho
            éxito haciendo algo, pero no lograba recordar la palabra italiana para
            &ldquo;éxito&rdquo;. Pasé un rato tratando de describir la palabra que quería decir. Por
            fin ella dijo: &ldquo;¡Ah! ¡Fortuna!&rdquo;.
          </div>

          <div id="fn-2" data-rr-id="n2" className={`rr-note ${playing_cls("n2")}`}>
            <span className="rr-note-num">[2]</span>
            Hay aspectos de las <em>startups</em> en los que la receta es ser activamente curioso.
            Puede haber momentos en los que lo que haces sea casi pura exploración. Por desgracia,
            esos momentos son una pequeña parte del total. Por otro lado, también lo son en la
            investigación.
          </div>

          <div id="fn-3" data-rr-id="n3" className={`rr-note ${playing_cls("n3")}`}>
            <span className="rr-note-num">[3]</span>
            Casi diría que a la mayoría de la gente, pero me doy cuenta de que (a) no tengo idea de
            cómo es la mayoría de la gente y (b) soy patológicamente optimista sobre la capacidad de
            las personas para cambiar.
          </div>

          <p data-rr-id="ack" className={`rr-ack ${playing_cls("ack")}`}>
            Gracias a Trevor Blackwell y Jessica Livingston por leer los borradores.
          </p>
        </article>

        <footer className="rr-footer">
          <a
            href="https://www.paulgraham.com/relres.html"
            target="_blank"
            rel="noopener noreferrer"
            className="rr-source-link"
          >
            Original en inglés · paulgraham.com/relres.html
          </a>
        </footer>
      </div>
    </div>
  )
}
