"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useConsultationModal } from "@/context/ConsultationModalContext";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { openModal } = useConsultationModal();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

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
        const firstLink = drawerRef.current?.querySelector<HTMLAnchorElement>("a");
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
    <>
      <header className="site-header">
        <div className="wrap nav">
          <a
            className="logo"
            href="#top"
            aria-label="Llarron home"
            onClick={() => closeMenu()}
          >
            <Image
              src="/assets/llarron-logo.webp"
              alt="Llarron"
              width={158}
              height={58}
              priority
              style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "left center" }}
            />
          </a>

          {/* Desktop Navigation */}
          <nav className="desktop-nav" aria-label="Main navigation">
            <a href="#guidance">Guidance</a>
            <a href="#approach">Approach</a>
            <a href="#about">About</a>
            <a href="#faq">FAQs</a>
            <button
              className="btn primary"
              type="button"
              onClick={openModal}
            >
              Request a consultation
            </button>
          </nav>

          {/* Mobile Hamburger Toggle */}
          <button
            ref={menuButtonRef}
            className="menu"
            type="button"
            aria-expanded={isOpen}
            aria-controls="mobileDrawer"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            onClick={toggleMenu}
          >
            <span />
          </button>
        </div>
      </header>

      {/* Mobile Drawer (Rendered OUTSIDE <header> to avoid backdrop-filter bug in Safari) */}
      <div
        id="mobileDrawer"
        ref={drawerRef}
        className={`mobile-drawer ${isOpen ? "open" : ""}`}
        aria-label="Mobile navigation"
        aria-hidden={!isOpen}
      >
        <div className="wrap mobile-drawer-header">
          <a
            className="logo"
            href="#top"
            aria-label="Llarron home"
            onClick={() => closeMenu()}
          >
            <Image
              src="/assets/llarron-logo.webp"
              alt="Llarron"
              width={158}
              height={58}
              priority
              style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "left center" }}
            />
          </a>
          <button
            className="mobile-close-btn"
            type="button"
            aria-label="Close menu"
            onClick={() => closeMenu(true)}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="mobile-drawer-body">
          <nav className="mobile-drawer-links" aria-label="Mobile menu links">
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
            <button
              className="btn primary mobile-cta-btn"
              type="button"
              onClick={() => {
                closeMenu();
                openModal();
              }}
            >
              Request a consultation
            </button>
          </nav>
        </div>
      </div>
    </>
  );
}
