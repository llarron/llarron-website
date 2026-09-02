"use client";

import { useState } from "react";

interface FaqItem {
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    question: "What happens in the first consultation?",
    answer:
      "It is an introductory conversation to understand your goals, questions and expectations. The exact format and next steps will be confirmed directly by Llarron.",
  },
  {
    question: "Do I need to choose a service first?",
    answer:
      "No. Share what you are navigating, and the consultation can help clarify which form of guidance may be relevant.",
  },
  {
    question: "Can this replace medical or mental-health care?",
    answer:
      "No. Llarron’s offerings are for coaching, personal reflection and general wellness guidance. They do not replace qualified professional care.",
  },
  {
    question: "Are results guaranteed?",
    answer:
      "No specific outcome can be guaranteed. Experiences vary, and any decisions or actions remain your responsibility.",
  },
  {
    question: "Where are sessions held and what do they cost?",
    answer:
      "Session mode, availability, duration and fees have not yet been provided. Llarron can share confirmed details after receiving your enquiry.",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="section" id="faq">
      <div className="wrap">
        <div className="head center reveal">
          <span className="eyebrow">Frequently asked questions</span>
          <h2>A few things to know.</h2>
        </div>

        <div className="faq-list reveal">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <details
                key={faq.question}
                className="faq"
                open={isOpen}
                onToggle={(e) => {
                  const target = e.currentTarget;
                  if (target.open && openIndex !== index) {
                    setOpenIndex(index);
                  } else if (!target.open && openIndex === index) {
                    setOpenIndex(null);
                  }
                }}
              >
                <summary
                  onClick={(e) => {
                    e.preventDefault();
                    handleToggle(index);
                  }}
                >
                  <span>
                    {faq.question}
                    <i aria-hidden="true">+</i>
                  </span>
                </summary>
                <p>{faq.answer}</p>
              </details>
            );
          })}
        </div>
      </div>
    </section>
  );
}
