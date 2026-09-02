"use client";

import { useEffect } from "react";

export default function ScrollReveal() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // If reduced motion is preferred or IntersectionObserver is unsupported, reveal all immediately
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      document.querySelectorAll(".reveal").forEach((el) => {
        el.classList.add("in");
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll(".reveal");
    elements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, []);

  return null;
}
