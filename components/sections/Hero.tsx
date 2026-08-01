import OrbStage from "@/components/orb/OrbStage";

export default function Hero() {
  return (
    <section className="hero wrap">
      <div className="hero-grid">
        <div className="hero-left">
          <span className="hero-eyebrow label">
            <span className="pulse-dot" />
            Answers in &lt; 1s · live now
          </span>
          <h1>
            Call it.
            <br />
            Right now.
          </h1>
          <p className="sub">An AI service advisor that answers in under a second.</p>
          <div className="callrow">
            <div>
              <div className="phone">
                <span className="rings" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </span>
                <span className="num">+1 (555) 012-PITS</span>
              </div>
              <span className="phone-note label">placeholder line — swap for your DID</span>
            </div>
            <a href="tel:+15550127487" className="btn">
              Start a call
              <svg
                className="arw"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                aria-hidden="true"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
          </div>
        </div>
        <OrbStage />
      </div>
      <div className="scrollcue" aria-hidden="true">
        <span className="label">scroll</span>
        <span className="line" />
      </div>
    </section>
  );
}
