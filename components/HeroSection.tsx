import Image from "next/image";
import ConsultationTrigger from "./ConsultationTrigger";

export default function HeroSection() {
  return (
    <section className="hero" id="top">
      <div className="wrap hero-grid">
        <div className="hero-copy reveal">
          <span className="eyebrow">Integrated life &amp; wellness guidance</span>
          <h1>
            Find your way back to <em>alignment.</em>
          </h1>
          <p>
            One thoughtful space to explore the patterns shaping your life,
            environment and choices—through life coaching, Vastu guidance,
            numerology and holistic wellness.
          </p>
          <div className="actions">
            <ConsultationTrigger className="btn primary">
              Request a consultation &rarr;
            </ConsultationTrigger>
            <a className="btn ghost" href="#guidance">
              Explore the approach
            </a>
          </div>
          <p className="small">
            An introductory conversation to understand what support you are
            looking for.
          </p>
        </div>

        <div className="art reveal">
          <div className="photo-ring" aria-hidden="true" />
          <Image
            className="hero-photo"
            src="/assets/hero-wellness.webp"
            alt="Woman practising quiet meditation in a calm, naturally lit home"
            width={900}
            height={1350}
            priority
            sizes="(max-width: 480px) 100vw, (max-width: 900px) 620px, 460px"
          />
          <div className="art-note">
            <b>Pause. Notice. Re-align.</b>
            A more considered next step begins here.
          </div>
          <a
            className="photo-credit"
            href="https://www.pexels.com/photo/woman-meditating-at-home-6802935/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Photo: Vlada Karpovich / Pexels
          </a>
        </div>
      </div>
    </section>
  );
}
