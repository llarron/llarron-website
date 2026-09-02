"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);

  const closeMenu = useCallback((restoreFocus = false) => {
    setIsOpen(false);
    if (restoreFocus && menuButtonRef.current) {
      menuButtonRef.current.focus();
    }
  }, []);

  const toggleMenu = () => {
    if (isOpen) {
      closeMenu();
    } else {
      setIsOpen(true);
      setTimeout(() => {
        const firstLink = navRef.current?.querySelector<HTMLAnchorElement>("a");
        firstLink?.focus();
      }, 50);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("lock");
    } else {
      document.body.classList.remove("lock");
    }
    return () => {
      document.body.classList.remove("lock");
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeMenu(true);
      }
    };

    const handleResize = () => {
      if (window.innerWidth > 720 && isOpen) {
        closeMenu();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen, closeMenu]);

  return (
    <header>
      <div className="wrap nav">
        <a className="logo" href="#top" aria-label="Llarron home" onClick={() => closeMenu()}>
          <Image
            src="/assets/llarron-logo.webp"
            alt="Llarron"
            width={158}
            height={58}
            priority
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </a>

        <nav
          id="siteNav"
          ref={navRef}
          className={isOpen ? "open" : ""}
          aria-label="Main navigation"
        >
          <a href="#guidance" onClick={() => closeMenu()}>
            Guidance
          </a>
          <a href="#approach" onClick={() => closeMenu()}>
            Approach
          </a>
          <a href="#about" onClick={() => closeMenu()}>
            About
          </a>
          <a href="#faq" onClick={() => closeMenu()}>
            FAQs
          </a>
          <a
            className="btn primary"
            href="#consultation"
            onClick={() => closeMenu()}
          >
            Request a consultation
          </a>
        </nav>

        <button
          ref={menuButtonRef}
          className="menu"
          type="button"
          aria-expanded={isOpen}
          aria-controls="siteNav"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          onClick={toggleMenu}
        >
          <span />
        </button>
      </div>
    </header>
  );
}
