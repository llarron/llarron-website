export default function GuidanceSection() {
  return (
    <section className="section" id="guidance">
      <div className="wrap">
        <div className="head reveal">
          <span className="eyebrow">Ways to work together</span>
          <h2>Different lenses. One connected view.</h2>
          <p>
            Choose the area that feels most relevant today. A consultation can
            help clarify which kind of guidance may suit your needs.
          </p>
        </div>

        <div className="cards">
          <article className="card reveal" data-n="1">
            <span className="icon" aria-hidden="true">◇</span>
            <h3>Life coaching</h3>
            <p>
              Reflect on where you are, name what matters and shape practical
              next steps with greater intention.
            </p>
          </article>

          <article className="card reveal" data-n="2">
            <span className="icon" aria-hidden="true">⌂</span>
            <h3>Vastu guidance</h3>
            <p>
              Explore how the arrangement and experience of your home or
              workspace may better support daily life.
            </p>
          </article>

          <article className="card reveal" data-n="3">
            <span className="icon" aria-hidden="true">Ⅸ</span>
            <h3>Numerology</h3>
            <p>
              Use number-based reflection as one lens for exploring personal
              tendencies, timing and decision-making.
            </p>
          </article>

          <article className="card reveal" data-n="4">
            <span className="icon" aria-hidden="true">○</span>
            <h3>Holistic wellness</h3>
            <p>
              Create space for sustainable routines and self-awareness that
              complement—not replace—professional care.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
