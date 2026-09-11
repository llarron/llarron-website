"use client";

import { useRef, useEffect } from "react";
import { useConsultationModal } from "@/context/ConsultationModalContext";
import { useConsultationForm } from "@/hooks/useConsultationForm";

export default function ConsultationModal() {
  const { isModalOpen, closeModal } = useConsultationModal();
  const {
    formData,
    errors,
    isSubmitting,
    submitError,
    isSuccess,
    handleChange,
    handleSubmit,
    handleReset,
  } = useConsultationForm();

  const modalRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const triggerElementRef = useRef<HTMLElement | null>(null);

  // Focus restoration & Escape handling & Scroll lock & Focus trapping
  useEffect(() => {
    if (!isModalOpen) return;

    // Save previous active element for focus restoration
    if (document.activeElement instanceof HTMLElement) {
      triggerElementRef.current = document.activeElement;
    }

    document.body.classList.add("lock");

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
        return;
      }

      // Focus trap
      if (e.key === "Tab" && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input:not([tabindex="-1"]), select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const focusable = Array.from(focusableElements).filter(
          (el) => el.offsetParent !== null && !el.hasAttribute("disabled")
        );

        if (focusable.length === 0) return;

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Initial focus on name input
    const timer = setTimeout(() => {
      nameInputRef.current?.focus();
    }, 100);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
      document.body.classList.remove("lock");

      // Restore focus to trigger element
      if (triggerElementRef.current) {
        triggerElementRef.current.focus();
      }
    };
  }, [isModalOpen, closeModal]);

  if (!isModalOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeModal();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modalTitle"
    >
      <div className="modal-container" ref={modalRef}>
        <button
          className="modal-close-btn"
          type="button"
          aria-label="Close modal"
          onClick={closeModal}
        >
          <svg
            width="22"
            height="22"
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

        <div className="modal-header">
          <span className="eyebrow">Request a consultation</span>
          <h2 id="modalTitle">Tell Llarron what you’d like support with.</h2>
          <p>
            Share your details and areas of interest. Our team will review your
            enquiry and get in touch with you.
          </p>
        </div>

        <div id="modalFormView" hidden={isSuccess}>
          <form
            id="modalForm"
            noValidate
            onSubmit={(e) => handleSubmit(e, "modal", successRef)}
          >
            <div className="hidden-field" aria-hidden="true">
              <label htmlFor="modal_company">Leave empty</label>
              <input
                id="modal_company"
                name="company"
                tabIndex={-1}
                autoComplete="off"
                value={formData.company}
                onChange={(e) => handleChange("company", e.target.value)}
              />
            </div>

            {submitError && (
              <div
                className="error"
                role="alert"
                style={{
                  padding: "12px 16px",
                  background: "#fff2f0",
                  border: "1px solid #ffccc7",
                  borderRadius: "10px",
                  marginBottom: "16px",
                  color: "#a8071a",
                  fontSize: "13px",
                  lineHeight: "1.4",
                }}
              >
                {submitError}
              </div>
            )}

            <div className="form-grid">
              <div className="field">
                <label htmlFor="modal_name">
                  Full name <span className="req">*</span>
                </label>
                <input
                  ref={nameInputRef}
                  id="modal_name"
                  name="name"
                  autoComplete="name"
                  maxLength={60}
                  required
                  value={formData.name}
                  aria-invalid={errors.name ? "true" : "false"}
                  aria-describedby="modal_nameError"
                  onChange={(e) => handleChange("name", e.target.value)}
                />
                <p className="error" id="modal_nameError" aria-live="polite">
                  {errors.name || ""}
                </p>
              </div>

              <div className="field">
                <label htmlFor="modal_phone">
                  Phone number <span className="req">*</span>
                </label>
                <input
                  id="modal_phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  maxLength={18}
                  placeholder="+91 98765 43210"
                  required
                  value={formData.phone}
                  aria-invalid={errors.phone ? "true" : "false"}
                  aria-describedby="modal_phoneError"
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
                <p className="error" id="modal_phoneError" aria-live="polite">
                  {errors.phone || ""}
                </p>
              </div>

              <div className="field full">
                <label htmlFor="modal_email">
                  Email address <span className="req">*</span>
                </label>
                <input
                  id="modal_email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  maxLength={254}
                  required
                  value={formData.email}
                  aria-invalid={errors.email ? "true" : "false"}
                  aria-describedby="modal_emailError"
                  onChange={(e) => handleChange("email", e.target.value)}
                />
                <p className="error" id="modal_emailError" aria-live="polite">
                  {errors.email || ""}
                </p>
              </div>

              <div className="field full">
                <label htmlFor="modal_interest">
                  What would you like guidance with? <span className="req">*</span>
                </label>
                <select
                  id="modal_interest"
                  name="interest"
                  required
                  value={formData.interest}
                  aria-invalid={errors.interest ? "true" : "false"}
                  aria-describedby="modal_interestError"
                  onChange={(e) => handleChange("interest", e.target.value)}
                >
                  <option value="">Choose an area</option>
                  <option value="Life coaching">Life coaching</option>
                  <option value="Vastu guidance">Vastu guidance</option>
                  <option value="Numerology">Numerology</option>
                  <option value="Holistic wellness">Holistic wellness</option>
                  <option value="Not sure yet">Not sure yet</option>
                </select>
                <p className="error" id="modal_interestError" aria-live="polite">
                  {errors.interest || ""}
                </p>
              </div>

              <div className="field full">
                <label htmlFor="modal_message">
                  Anything you’d like to share?{" "}
                  <span className="small">(optional)</span>
                </label>
                <textarea
                  id="modal_message"
                  name="message"
                  maxLength={600}
                  value={formData.message}
                  aria-invalid={errors.message ? "true" : "false"}
                  aria-describedby="modal_messageHelp modal_messageError"
                  onChange={(e) => handleChange("message", e.target.value)}
                />
                <p className="small" id="modal_messageHelp">
                  Please avoid sharing sensitive medical, financial or private
                  information.
                </p>
                <p className="error" id="modal_messageError" aria-live="polite">
                  {errors.message || ""}
                </p>
              </div>
            </div>

            <button
              className="btn primary submit"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Request consultation"}
            </button>
            <p className="small center" style={{ marginTop: "12px" }}>
              Please avoid sharing sensitive personal, medical or financial information.
            </p>
          </form>
        </div>

        <div
          ref={successRef}
          className={`success ${isSuccess ? "show" : ""}`}
          id="modal_success"
          role="status"
          tabIndex={-1}
        >
          <b>Thank you for reaching out.</b>
          <p>
            Your enquiry has been received successfully.
          </p>
          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "center",
              marginTop: "18px",
            }}
          >
            <button
              className="btn ghost"
              type="button"
              onClick={() => handleReset(nameInputRef)}
            >
              Submit another enquiry
            </button>
            <button
              className="btn primary"
              type="button"
              onClick={closeModal}
            >
              Done / Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
