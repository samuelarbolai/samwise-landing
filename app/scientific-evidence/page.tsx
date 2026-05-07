"use client"

import { useEffect, useState } from "react"
import "../styles.css"

type Lang = "en" | "es"

type Ref = {
  authors: string
  rest: string
  journal: string
  detail: string
  doi?: string
}

const copy = {
  en: {
    eyebrow: "Scientific Evidence",
    h1Pre: "What ",
    h1Em: "actually",
    h1Post: " makes therapy work.",
    lede: "Decades of clinical research point to a single variable as the strongest and most replicated predictor of therapeutic success — and it is the variable our solution is built around.",
    findingsLabel: "The findings",
    findingsCount: "Meta-analysis by Kazantzis et al., 2016",
    stat1Tag: "Quantity of homework completed",
    stat1Meaning: "Large effect on outcomes at end of treatment.",
    stat1Detail: "When patients actually complete the homework assigned between sessions, the clinical improvement measured at the end of therapy is large in magnitude (Hedges' g).",
    stat1Source: "15 studies · n = 1,537 · 95% CI [0.57, 1.02]",
    stat2Tag: "Quality of homework — follow-up",
    stat2Meaning: "Even larger effect at follow-up. Changes last.",
    stat2Detail: "It is not enough to do the homework: doing it with quality predicts even greater improvements weeks and months after therapy ends. People do not relapse.",
    stat2Source: "Behavior Therapy · 47(5), 755–772",
    interpHeadingPre: "What it means, in ",
    interpHeadingEm: "plain terms",
    interpHeadingPost: ".",
    interpP1Pre: "In psychotherapy, clinical effects are rarely enormous. An effect considered ",
    interpP1Quoted: "large",
    interpP1Mid: " (Hedges' ",
    interpP1Em: "g",
    interpP1End: " ≥ 0.80) is exceptional — equivalent to a change that the patient, their family and the clinician can clearly recognize in daily life.",
    interpP2Pre: "Kazantzis et al.'s 2016 meta-analysis, published in ",
    interpP2Em1: "Behavior Therapy",
    interpP2Mid: ", found exactly that: when patients complete the homework their therapist assigns between sessions, the effect on clinical outcomes is ",
    interpP2Strong1: "large",
    interpP2Mid2: ". And when that homework is done ",
    interpP2Strong2: "with quality",
    interpP2Mid3: ", the benefit at follow-up is even ",
    interpP2Strong3: "greater",
    interpP2End: " than at the end of treatment.",
    pullquote: "The quality of practice outside the consulting room predicts greater improvements at follow-up than those observed at the end of therapy.",
    interpP3Pre: "It is an unusual finding in the clinical literature: most interventions ",
    interpP3Em: "lose",
    interpP3End: " effect over time. Here, the changes grow. That is why we built our entire solution around this single variable: getting the homework done, and getting it done well.",
    biblioHeading: "The Literature",
    biblioSub: "Peer-reviewed studies that support our approach.",
    biblioGroup1: "Primary study",
    biblioGroup2: "Supporting meta-analyses",
    biblioGroup3: "Modern reviews and mechanism",
    biblioGroup4: "Key empirical studies",
    honestyLabel: "A note on honesty",
    honestyHeading: "We do not promise absolute certainties. We promise to work on the variable that science has identified as the most important.",
    honestyP1: "No psychological treatment works for 100% of people. What we can say, with replicated backing across four separate meta-analyses, is that adherence to and quality of between-session homework is one of the strongest and most consistent predictors of therapeutic change — comparable in magnitude to the effect of the therapeutic alliance itself.",
    honestyP2: "That is why we built our tool around that variable. We are not reinventing psychotherapy; we are strengthening it at the point where the evidence says it most often breaks down.",
    navHome: "Home",
    navLanding: "Samwise →",
    footer: "Last updated · May 2026",
  },
  es: {
    eyebrow: "Evidencia Científica",
    h1Pre: "Lo que ",
    h1Em: "realmente",
    h1Post: " hace que la terapia funcione.",
    lede: "Décadas de investigación clínica apuntan a una sola variable como el predictor más fuerte y replicado del éxito terapéutico — y es la variable sobre la que está construida nuestra solución.",
    findingsLabel: "Los Hallazgos",
    findingsCount: "Meta-análisis de Kazantzis et al., 2016",
    stat1Tag: "Cantidad de tareas completadas",
    stat1Meaning: "Efecto grande sobre los resultados al final del tratamiento.",
    stat1Detail: "Cuando los pacientes realmente completan las tareas asignadas entre sesiones, la mejoría clínica medida al terminar la terapia es de magnitud grande (Hedges' g).",
    stat1Source: "15 estudios · n = 1,537 · IC 95% [0.57, 1.02]",
    stat2Tag: "Calidad de las tareas — seguimiento",
    stat2Meaning: "Efecto aún mayor en seguimiento. Los cambios duran.",
    stat2Detail: "No basta con hacer las tareas: hacerlas con calidad predice mejoras todavía mayores semanas y meses después de terminada la terapia. La gente no recae.",
    stat2Source: "Behavior Therapy · 47(5), 755–772",
    interpHeadingPre: "Qué significa, en ",
    interpHeadingEm: "lenguaje claro",
    interpHeadingPost: ".",
    interpP1Pre: "En psicoterapia, los efectos clínicos rara vez son enormes. Un efecto considerado ",
    interpP1Quoted: "grande",
    interpP1Mid: " (Hedges' ",
    interpP1Em: "g",
    interpP1End: " ≥ 0.80) es excepcional — equivale a un cambio que el paciente, su familia y el clínico pueden reconocer claramente en la vida diaria.",
    interpP2Pre: "El meta-análisis de 2016 de Kazantzis et al., publicado en ",
    interpP2Em1: "Behavior Therapy",
    interpP2Mid: ", encontró exactamente eso: cuando los pacientes completan las tareas que les indica su terapeuta entre sesiones, el efecto sobre los resultados clínicos es ",
    interpP2Strong1: "grande",
    interpP2Mid2: ". Y cuando esas tareas se hacen ",
    interpP2Strong2: "con calidad",
    interpP2Mid3: ", el beneficio en seguimiento es todavía ",
    interpP2Strong3: "mayor",
    interpP2End: " que al final del tratamiento.",
    pullquote: "La calidad de la práctica fuera del consultorio predice mejoras más grandes en seguimiento que las observadas al terminar la terapia.",
    interpP3Pre: "Es un hallazgo poco frecuente en la literatura clínica: la mayoría de las intervenciones ",
    interpP3Em: "pierden",
    interpP3End: " efecto con el tiempo. Aquí, los cambios crecen. Por eso construimos toda nuestra solución alrededor de esta única variable: lograr que las tareas se hagan, y que se hagan bien.",
    biblioHeading: "La Literatura",
    biblioSub: "Estudios revisados por pares que respaldan nuestro enfoque.",
    biblioGroup1: "Estudio principal",
    biblioGroup2: "Meta-análisis de respaldo",
    biblioGroup3: "Revisiones modernas y mecanismo",
    biblioGroup4: "Estudios empíricos clave",
    honestyLabel: "Una nota sobre honestidad",
    honestyHeading: "No prometemos certezas absolutas. Prometemos trabajar sobre la variable que la ciencia ha identificado como la más importante.",
    honestyP1: "Ningún tratamiento psicológico funciona para el 100% de las personas. Lo que sí podemos decir, con respaldo replicado en cuatro meta-análisis distintos, es que la adherencia y la calidad en las tareas entre sesiones es uno de los predictores más fuertes y consistentes del cambio terapéutico — comparable en magnitud al efecto de la alianza terapéutica misma.",
    honestyP2: "Por eso construimos nuestra herramienta alrededor de esa variable. No reinventamos la psicoterapia; la potenciamos en el punto donde la evidencia dice que más se rompe.",
    navHome: "Inicio",
    navLanding: "Samwise →",
    footer: "Última actualización · Mayo 2026",
  },
}

const refs: { primary: Ref[]; supporting: Ref[]; modern: Ref[]; empirical: Ref[] } = {
  primary: [
    {
      authors: "Kazantzis, N., Whittington, C., Zelencich, L., Kyrios, M., Norton, P. J., & Hofmann, S. G.",
      rest: " (2016). Quantity and quality of homework compliance: A meta-analysis of relations with outcome in cognitive behavior therapy. ",
      journal: "Behavior Therapy, 47",
      detail: "(5), 755–772.",
      doi: "https://doi.org/10.1016/j.beth.2016.05.002",
    },
  ],
  supporting: [
    {
      authors: "Kazantzis, N., Deane, F. P., & Ronan, K. R.",
      rest: " (2000). Homework assignments in cognitive and behavioral therapy: A meta-analysis. ",
      journal: "Clinical Psychology: Science and Practice, 7",
      detail: "(2), 189–202.",
      doi: "https://doi.org/10.1093/clipsy.7.2.189",
    },
    {
      authors: "Kazantzis, N., Whittington, C. J., & Dattilio, F. M.",
      rest: " (2010). Meta-analysis of homework effects in cognitive and behavioral therapy: A replication and extension. ",
      journal: "Clinical Psychology: Science and Practice, 17",
      detail: "(2), 144–156.",
      doi: "https://doi.org/10.1111/j.1468-2850.2010.01204.x",
    },
    {
      authors: "Mausbach, B. T., Moore, R., Roesch, S., Cardenas, V., & Patterson, T. L.",
      rest: " (2010). The relationship between homework compliance and therapy outcomes: An updated meta-analysis. ",
      journal: "Cognitive Therapy and Research, 34",
      detail: "(5), 429–438.",
      doi: "https://doi.org/10.1007/s10608-010-9297-z",
    },
  ],
  modern: [
    {
      authors: "Ryum, T., & Kazantzis, N.",
      rest: " (2024). Homework as a driver of change in psychotherapy. ",
      journal: "Journal of Clinical Psychology, 80",
      detail: "(5).",
      doi: "https://doi.org/10.1002/jclp.23627",
    },
    {
      authors: "Lim, J. A., & Kazantzis, N.",
      rest: " (2023). Integrating between-session homework in psychotherapy: A systematic review of immediate in-session and intermediate outcomes. ",
      journal: "Psychotherapy, 60",
      detail: "(2), 232–247.",
      doi: "https://doi.org/10.1037/pst0000488",
    },
    {
      authors: "Kazantzis, N., Luong, H. K., Usatoff, A. S., Impala, T., Yew, R. Y., & Hofmann, S. G.",
      rest: " (2018). The processes of cognitive behavioral therapy: A review of meta-analyses. ",
      journal: "Cognitive Therapy and Research, 42",
      detail: "(4), 349–357.",
    },
    {
      authors: "Wheaton, M. G., & Chen, S. R.",
      rest: " (2021). Homework completion in treating obsessive–compulsive disorder with exposure and ritual prevention: A review of the empirical literature. ",
      journal: "Cognitive Therapy and Research, 45",
      detail: "(2), 236–249.",
      doi: "https://doi.org/10.1007/s10608-020-10125-0",
    },
  ],
  empirical: [
    {
      authors: "Burns, D. D., & Spangler, D. L.",
      rest: " (2000). Does psychotherapy homework lead to improvements in depression in cognitive-behavioral therapy or does improvement lead to increased homework compliance? ",
      journal: "Journal of Consulting and Clinical Psychology, 68",
      detail: "(1), 46–56.",
    },
    {
      authors: "Conklin, L. R., & Strunk, D. R.",
      rest: " (2015). A session-to-session examination of homework engagement in cognitive therapy for depression: Do patients experience immediate benefits? ",
      journal: "Behaviour Research and Therapy, 72",
      detail: ", 56–62.",
    },
    {
      authors: "Decker, S. E., Kiluk, B. D., Frankforter, T., Babuscio, T., Nich, C., & Carroll, K. M.",
      rest: " (2016). Just showing up is not enough: Homework adherence and outcome in cognitive-behavioral therapy for cocaine dependence. ",
      journal: "Journal of Consulting and Clinical Psychology, 84",
      detail: "(10), 907–912.",
    },
    {
      authors: "Stirman, S. W., Gutner, C. A., Suvak, M. K., Adler, A., Calloway, A., & Resick, P. A.",
      rest: " (2018). Homework completion, patient characteristics, and symptom change in cognitive processing therapy for PTSD. ",
      journal: "Behavior Therapy, 49",
      detail: "(5), 741–755.",
    },
  ],
}

function RefList({ items }: { items: Ref[] }) {
  return (
    <ol className="biblio-list">
      {items.map((r, i) => (
        <li key={i}>
          <span className="authors">{r.authors}</span>
          {r.rest}
          <span className="journal">{r.journal}</span>
          {r.detail}
          {r.doi && (
            <>
              {" "}
              <a href={r.doi} target="_blank" rel="noopener noreferrer">
                {r.doi.replace("https://", "")}
              </a>
            </>
          )}
        </li>
      ))}
    </ol>
  )
}

export default function EditorialScientificValidation() {
  const [lang, setLang] = useState<Lang>("en")
  const t = copy[lang]

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible")
            observer.unobserve(e.target)
          }
        })
      },
      { threshold: 0.12 }
    )
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [lang])

  return (
    <div className="editorial-root">
      <nav className="editorial-nav">
        <a href="/" className="brand">Samwise</a>
        <div className="nav-right">
          <a href="/" className="nav-link">
            ← {t.navHome}
          </a>
          <div className="lang-toggle" role="group" aria-label="Language">
            <button onClick={() => setLang("en")} aria-pressed={lang === "en"}>EN</button>
            <span className="sep">/</span>
            <button onClick={() => setLang("es")} aria-pressed={lang === "es"}>ES</button>
          </div>
        </div>
      </nav>

      <div className="editorial-wrap">
        <header className="hero">
          <div className="eyebrow reveal">{t.eyebrow}</div>
          <h1 className="editorial-h1 reveal">
            {t.h1Pre}
            <em>{t.h1Em}</em>
            {t.h1Post}
          </h1>
          <p className="lede reveal">{t.lede}</p>
        </header>

        <section className="headline-stats">
          <div className="section-label">
            <span>{t.findingsLabel}</span>
            <span className="count">{t.findingsCount}</span>
          </div>

          <div className="stats-grid">
            <div className="stat reveal">
              <div className="stat-tag">{t.stat1Tag}</div>
              <div className="stat-figure">
                <span className="symbol">g</span>{" "}
                <span className="approx">≈</span> 0.79
              </div>
              <div className="stat-meaning">{t.stat1Meaning}</div>
              <div className="stat-detail">{t.stat1Detail}</div>
              <div className="stat-source">{t.stat1Source}</div>
            </div>

            <div className="stat reveal">
              <div className="stat-tag">{t.stat2Tag}</div>
              <div className="stat-figure">
                <span className="symbol">g</span>{" "}
                <span className="approx">≈</span> 1.07
              </div>
              <div className="stat-meaning">{t.stat2Meaning}</div>
              <div className="stat-detail">{t.stat2Detail}</div>
              <div className="stat-source">{t.stat2Source}</div>
            </div>
          </div>
        </section>

        <section className="interpretation">
          <h2 className="interp-heading reveal">
            {t.interpHeadingPre}
            <em>{t.interpHeadingEm}</em>
            {t.interpHeadingPost}
          </h2>

          <div className="interp-body reveal">
            <p>
              {t.interpP1Pre}&ldquo;{t.interpP1Quoted}&rdquo;{t.interpP1Mid}
              <em>{t.interpP1Em}</em>
              {t.interpP1End}
            </p>

            <p>
              {t.interpP2Pre}
              <em>{t.interpP2Em1}</em>
              {t.interpP2Mid}
              <strong>{t.interpP2Strong1}</strong>
              {t.interpP2Mid2}
              <strong>{t.interpP2Strong2}</strong>
              {t.interpP2Mid3}
              <strong>{t.interpP2Strong3}</strong>
              {t.interpP2End}
            </p>

            <div className="pullquote">&ldquo;{t.pullquote}&rdquo;</div>

            <p>
              {t.interpP3Pre}
              <em>{t.interpP3Em}</em>
              {t.interpP3End}
            </p>
          </div>
        </section>

        <section className="bibliography">
          <h2 className="biblio-heading">{t.biblioHeading}</h2>
          <p className="biblio-sub">{t.biblioSub}</p>

          <div className="biblio-group">
            <div className="biblio-group-label">{t.biblioGroup1}</div>
            <RefList items={refs.primary} />
          </div>

          <div className="biblio-group">
            <div className="biblio-group-label">{t.biblioGroup2}</div>
            <RefList items={refs.supporting} />
          </div>

          <div className="biblio-group">
            <div className="biblio-group-label">{t.biblioGroup3}</div>
            <RefList items={refs.modern} />
          </div>

          <div className="biblio-group">
            <div className="biblio-group-label">{t.biblioGroup4}</div>
            <RefList items={refs.empirical} />
          </div>
        </section>
      </div>

      <section className="honesty">
        <div className="honesty-inner">
          <div className="honesty-label">{t.honestyLabel}</div>
          <h3 className="honesty-heading">{t.honestyHeading}</h3>
          <div className="honesty-body">
            <p>{t.honestyP1}</p>
            <p>{t.honestyP2}</p>
          </div>
        </div>
      </section>

      <div className="editorial-wrap">
        <footer className="editorial-footer">
          <span className="ornament">·</span>
          {t.footer}
        </footer>
      </div>
    </div>
  )
}
