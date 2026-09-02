export default function AboutSection() {
  return (
    <section className="section about" id="about">
      <div className="wrap about-grid">
        <div
          className="portrait reveal"
          role="img"
          aria-label="Abstract placeholder for the Llarron coach portrait"
        >
          <div className="placeholder">
            <b>Coach portrait placeholder</b>
            <span>Approved photography to be added</span>
          </div>
        </div>

        <div className="about-copy reveal">
          <span className="eyebrow">Meet your guide</span>
          <h2>A space for thoughtful, integrated guidance.</h2>
          <p>
            Llarron brings several reflective practices into one conversation
            so you can look at a question from more than one angle. Every
            engagement begins with listening and stays grounded in your
            individual context.
          </p>
          <div>
            <span className="pill">Life coaching</span>
            <span className="pill">Vastu guidance</span>
            <span className="pill">Numerology</span>
            <span className="pill">Holistic wellness</span>
          </div>
          <p className="note">
            <strong>Profile details pending:</strong> The coach’s name,
            biography, credentials and approved photograph will be added once
            supplied by the client.
          </p>
        </div>
      </div>
    </section>
  );
}
