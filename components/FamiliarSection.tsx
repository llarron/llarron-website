import ConsultationTrigger from "./ConsultationTrigger";

export default function FamiliarSection() {
  return (
    <section className="section dark">
      <div className="wrap split">
        <div className="sticky reveal">
          <span className="eyebrow" style={{ color: "var(--lime)" }}>
            Does this feel familiar?
          </span>
          <h2>You don’t need every answer to take the next step.</h2>
          <p>
            People often seek guidance when several parts of life feel
            connected, but difficult to untangle alone.
          </p>
          <ConsultationTrigger className="btn light">
            Start a conversation
          </ConsultationTrigger>
        </div>

        <div className="checks reveal">
          <div className="check">
            <b>01</b>
            <p>
              You are at a crossroads and want a clearer way to think through
              your options.
            </p>
          </div>
          <div className="check">
            <b>02</b>
            <p>
              Your routines or surroundings feel out of step with how you want to
              live.
            </p>
          </div>
          <div className="check">
            <b>03</b>
            <p>
              You keep noticing patterns and want a structured space to reflect
              on them.
            </p>
          </div>
          <div className="check">
            <b>04</b>
            <p>
              You want guidance that considers your goals, environment and
              wellbeing together.
            </p>
          </div>
          <div className="check">
            <b>05</b>
            <p>
              You are ready for small, realistic changes—not dramatic promises or
              quick fixes.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
