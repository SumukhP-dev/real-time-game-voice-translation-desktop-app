import Image from "next/image";

const heroPoints = [
  "Built for real ranked matches, with voice capture, transcription, and translation in one flow.",
  "Designed for gameplay speed, not generic translator workflows or manual workarounds.",
];

const proofStats = [
  { value: "167,928", label: "Impressions" },
  { value: "584", label: "Clicks" },
  { value: "2", label: "Signups" },
  { value: "2", label: "Backers" },
];

const tractionStats = [
  {
    value: "167,928",
    label: "Impressions",
    sub: "Gaming-focused Reddit reach",
  },
  {
    value: "584",
    label: "Clicks",
    sub: "Players who clicked to learn more",
  },
  {
    value: "$150.67",
    label: "Ad spend",
    sub: "Lean validation budget",
  },
  {
    value: "$0.26",
    label: "CPC",
    sub: "Efficient click cost",
  },
  {
    value: "0.348%",
    label: "CTR",
    sub: "Messaging resonance",
  },
  {
    value: "2 / 2",
    label: "Signups / backers",
    sub: "Initial conversion signal",
  },
];

const targetPlayers = [
  "Players who rely on voice comms to win rounds and coordinate fights.",
  "International lobbies where language becomes a gameplay disadvantage.",
  "Gamers who want a one-time desktop tool, not another subscription.",
];

const productFlow = [
  "Speech-to-text and translation tuned for match speed.",
  "Subtitles designed for quick reading during gameplay.",
  "Local AI models keep the experience fast and privacy-friendly.",
];

const advantageCards = [
  {
    title: "The problem",
    description:
      "Players in global games lose callouts and coordination because mixed-language lobbies still have no native live voice translation layer.",
    bullets: [
      "High-stakes team games depend on fast voice communication.",
      "Language barriers directly reduce coordination and player experience.",
      "Manual workarounds are too slow to use in a live match.",
    ],
  },
  {
    title: "Why this is better than generic tools",
    description:
      "Generic translators, mobile apps, and browser tools were not designed for live voice chat inside fast-paced competitive games.",
    bullets: [
      "Disconnected from in-game audio and timing.",
      "Too much friction for ranked or competitive play.",
      "No purpose-built subtitle workflow for rapid callouts.",
    ],
  },
  {
    title: "What makes it defensible",
    description:
      "The product already solves the full use case: capture, transcription, translation, display, and gameplay fit.",
    bullets: [
      "Working MVP rather than just a market hypothesis.",
      "Gaming-specific UX instead of generic AI tooling.",
      "Local processing and simple pricing improve trust and usability.",
    ],
  },
  {
    title: "Why now",
    description:
      "Multiplayer gaming is global, voice is still central to team play, and AI speech plus translation quality is finally good enough for this use case.",
    bullets: [
      "Large installed base of voice-chat heavy games.",
      "Better speech and translation quality than even a few years ago.",
      "Early paid demand tests already show attention and conversion.",
    ],
  },
];

export default function HomePage() {
  return (
    <>
      <header className="topbar">
        <div className="container">
          <div className="topbar-card">
            <div className="brand">
              <Image
                src="/app_icon.png"
                alt=""
                width={44}
                height={44}
                className="brand-mark brand-mark-img"
                aria-hidden="true"
              />
              <div className="brand-copy">
                <strong>Real-Time Game Voice Translation</strong>
                <span>
                  Live subtitles and translated speech for multiplayer voice chat
                </span>
              </div>
            </div>
            <div className="topbar-actions">
              <a
                className="button button-secondary"
                href="https://real-time-game-voice-translation.kit.com/1e575b7dba"
                target="_blank"
                rel="noreferrer"
              >
                Join Waitlist
              </a>
              <a
                className="button button-primary"
                href="https://www.kickstarter.com/projects/sumukhdev/real-time-game-voice-translation?ref=user_menu"
                target="_blank"
                rel="noreferrer"
              >
                Back on Kickstarter
              </a>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="container">
            <div className="hero-card">
              <div>
                <div className="eyebrow">
                  Built product • Early traction • Georgia Tech founder
                </div>
                <h1>Break the language barrier in game voice chat.</h1>
                <p className="subtitle">
                  A desktop app for CS2, Valorant, Apex, and Dota 2 that turns
                  foreign-language teammate comms into live subtitles and
                  translated speech.
                </p>

                <div className="hero-meta">
                  <span>Desktop app for Windows</span>
                  <span>Local AI workflow</span>
                  <span>No subscription required</span>
                </div>

                <div className="hero-points">
                  {heroPoints.map((point) => (
                    <div key={point} className="hero-point">
                      {point}
                    </div>
                  ))}
                </div>

                <div className="cta-row">
                  <a
                    className="button button-primary"
                    href="https://www.kickstarter.com/projects/sumukhdev/real-time-game-voice-translation?ref=user_menu"
                    target="_blank"
                    rel="noreferrer"
                  >
                    View Kickstarter
                  </a>
                  <a
                    className="button button-secondary"
                    href="https://real-time-game-voice-translation.kit.com/1e575b7dba"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Join the Email List
                  </a>
                </div>

                <div className="trust-strip" aria-label="Supported games">
                  <span className="trust-pill">CS2</span>
                  <span className="trust-pill">Valorant</span>
                  <span className="trust-pill">Apex</span>
                  <span className="trust-pill">Dota 2</span>
                </div>
              </div>

              <div className="hero-side">
                <div className="proof-panel">
                <div className="proof-header">
                  <Image
                    src="/app_icon.png"
                    alt=""
                    width={60}
                    height={60}
                    className="logo-mark logo-mark-img"
                    aria-hidden="true"
                  />
                    <div>
                      <h2>Live match preview</h2>
                      <p>
                        Working MVP with early traction and launch assets underway.
                      </p>
                    </div>
                  </div>

                  <div className="mockup" aria-label="Product preview">
                    <div className="mockup-toolbar">
                      <span className="mockup-dot" />
                      <span className="mockup-dot" />
                      <span className="mockup-dot" />
                      <span className="mockup-title">
                        Game voice translation overlay
                      </span>
                    </div>
                    <div className="mockup-body">
                      <div className="mockup-wave">
                        <span className="mockup-caption">
                          Enemy rotating B. Hold for three seconds.
                        </span>
                      </div>
                      <div className="mockup-subtitle">
                        <strong>Translated in real time</strong>
                        <span>
                          Live subtitles appear on screen so teammates speaking
                          another language become usable callouts.
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mini-stats">
                    {proofStats.map((stat) => (
                      <div key={stat.label} className="mini-stat">
                        <strong>{stat.value}</strong>
                        <span>{stat.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="proof-note">
                  <strong>Why this matters:</strong> this is beyond idea stage,
                  with a live MVP, paid demand testing, and early conversion
                  signal.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="progress">
          <div className="container">
            <div className="section-card">
              <div className="section-heading">
                <div>
                  <span className="section-kicker">Progress</span>
                  <h2>Current traction and validation</h2>
                </div>
                <p>
                  A lean Reddit test produced real attention and initial
                  conversions. The goal now is to keep turning that signal into
                  waitlist growth and backers.
                </p>
              </div>

              <div className="stats-grid">
                {tractionStats.map((stat) => (
                  <div key={stat.label} className="stat">
                    <div className="stat-value">{stat.value}</div>
                    <div className="stat-label">{stat.label}</div>
                    <div className="stat-sub">{stat.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="section-card">
              <div className="section-heading">
                <div>
                  <span className="section-kicker">Market</span>
                  <h2>Who this product is for</h2>
                </div>
                <p>
                  Competitive multiplayer games are global by default, but voice
                  tools still assume everyone speaks the same language.
                </p>
              </div>

              <div className="audience-grid">
                <div className="audience-card">
                  <h3>Target players</h3>
                  <p>
                    PC gamers who play team-based titles like CS2, Valorant,
                    Apex, and Dota 2, especially in solo queue and
                    mixed-language lobbies.
                  </p>
                  <ul className="list">
                    {targetPlayers.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="audience-card">
                  <h3>How it works in the match</h3>
                  <p>
                    The app captures game voice chat, transcribes it in real
                    time, and turns it into subtitles, with optional speech
                    translated back to teammates.
                  </p>
                  <ul className="list">
                    {productFlow.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="section-card">
              <div className="section-heading">
                <div>
                  <span className="section-kicker">Advantage</span>
                  <h2>Why this startup has a strategic edge</h2>
                </div>
                <p>
                  The advantage is not just translation quality. It is a
                  workflow built for live multiplayer communication, where speed
                  and readability matter most.
                </p>
              </div>

              <div className="info-grid">
                {advantageCards.map((card) => (
                  <div key={card.title} className="info-card">
                    <h3>{card.title}</h3>
                    <p>{card.description}</p>
                    <ul className="list">
                      {card.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="cta-band">
              <div>
                <span className="section-kicker">Get Involved</span>
                <h2>Follow the launch and help validate demand.</h2>
                <p>
                  Join the email list for launch updates, or back the
                  Kickstarter to help validate real demand for translated game
                  voice chat.
                </p>
              </div>
              <div className="cta-side">
                <a
                  className="button button-primary"
                  href="https://real-time-game-voice-translation.kit.com/1e575b7dba"
                  target="_blank"
                  rel="noreferrer"
                >
                  Join the Waitlist
                </a>
                <a
                  className="button button-secondary"
                  href="https://www.kickstarter.com/projects/sumukhdev/real-time-game-voice-translation?ref=user_menu"
                  target="_blank"
                  rel="noreferrer"
                >
                  Support on Kickstarter
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container">
          Real-Time Game Voice Translation • Built for global multiplayer voice
          chat
        </div>
      </footer>
    </>
  );
}
