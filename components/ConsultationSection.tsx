"use client";

import { useRef } from "react";
import { useConsultationForm } from "@/hooks/useConsultationForm";

export default function ConsultationSection() {
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

  const nameInputRef = useRef<HTMLInputElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  return (
    <section className="section contact" id="consultation">
      <div className="wrap contact-grid">
        <div className="contact-copy reveal">
          <span className="eyebrow">Request a consultation</span>
          <h2>Tell Llarron what you’d like support with.</h2>
          <p>
            Share your details and areas of interest. Our team will review your
            enquiry and get in touch with you.
          </p>
        </div>

        <div className="form-card reveal">
          <div id="formView" hidden={isSuccess}>
            <form
              id="form"
              noValidate
              onSubmit={(e) => handleSubmit(e, undefined, successRef)}
            >
              <div className="hidden-field" aria-hidden="true">
                <label htmlFor="company">Leave empty</label>
                <input
                  id="company"
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
                  <label htmlFor="name">
                    Full name <span className="req">*</span>
                  </label>
                  <input
                    ref={nameInputRef}
                    id="name"
                    name="name"
                    autoComplete="name"
                    maxLength={60}
                    required
                    value={formData.name}
                    aria-invalid={errors.name ? "true" : "false"}
                    aria-describedby="nameError"
                    onChange={(e) => handleChange("name", e.target.value)}
                  />
                  <p className="error" id="nameError" aria-live="polite">
                    {errors.name || ""}
                  </p>
                </div>

                <div className="field">
                  <label htmlFor="phone">
                    Phone number <span className="req">*</span>
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    maxLength={18}
                    placeholder="+91 98765 43210"
                    required
                    value={formData.phone}
                    aria-invalid={errors.phone ? "true" : "false"}
                    aria-describedby="phoneError"
                    onChange={(e) => handleChange("phone", e.target.value)}
                  />
                  <p className="error" id="phoneError" aria-live="polite">
                    {errors.phone || ""}
                  </p>
                </div>

                <div className="field full">
                  <label htmlFor="email">
                    Email address <span className="req">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    maxLength={254}
                    required
                    value={formData.email}
                    aria-invalid={errors.email ? "true" : "false"}
                    aria-describedby="emailError"
                    onChange={(e) => handleChange("email", e.target.value)}
                  />
                  <p className="error" id="emailError" aria-live="polite">
                    {errors.email || ""}
                  </p>
                </div>

                <div className="field full">
                  <label htmlFor="interest">
                    What would you like guidance with? <span className="req">*</span>
                  </label>
                  <select
                    id="interest"
                    name="interest"
                    required
                    value={formData.interest}
                    aria-invalid={errors.interest ? "true" : "false"}
                    aria-describedby="interestError"
                    onChange={(e) => handleChange("interest", e.target.value)}
                  >
                    <option value="">Choose an area</option>
                    <option value="Life coaching">Life coaching</option>
                    <option value="Vastu guidance">Vastu guidance</option>
                    <option value="Numerology">Numerology</option>
                    <option value="Holistic wellness">Holistic wellness</option>
                    <option value="Not sure yet">Not sure yet</option>
                  </select>
                  <p className="error" id="interestError" aria-live="polite">
                    {errors.interest || ""}
                  </p>
                </div>

                <div className="field full">
                  <label htmlFor="message">
                    Anything you’d like to share?{" "}
                    <span className="small">(optional)</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    maxLength={600}
                    value={formData.message}
                    aria-invalid={errors.message ? "true" : "false"}
                    aria-describedby="messageHelp messageError"
                    onChange={(e) => handleChange("message", e.target.value)}
                  />
                  <p className="small" id="messageHelp">
                    Please avoid sharing sensitive medical, financial or private
                    information.
                  </p>
                  <p className="error" id="messageError" aria-live="polite">
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
            id="success"
            role="status"
            tabIndex={-1}
          >
            <b>Thank you for reaching out.</b>
            <p>
              Your enquiry has been received successfully.
            </p>
            <button
              className="btn primary"
              id="reset"
              type="button"
              onClick={() => handleReset(nameInputRef)}
            >
              Submit another enquiry
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
