import Image from "next/image";
import ConsultationTrigger from "./ConsultationTrigger";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="wrap footer-grid">
        <div>
          <a className="logo" href="#top" aria-label="Llarron home">
            <Image
              src="/assets/llarron-logo.webp"
              alt="Llarron"
              width={190}
              height={100}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </a>
          <p>Life coaching · Vastu guidance · Numerology · Holistic wellness</p>
          <p>© {currentYear} Llarron. Prototype content subject to client approval.</p>
        </div>

        <div className="footer-links">
          <a href="#guidance">Guidance</a>
          <a href="#faq">FAQs</a>
          <ConsultationTrigger className="footer-link-btn">
            Contact
          </ConsultationTrigger>
        </div>
      </div>
    </footer>
  );
}
