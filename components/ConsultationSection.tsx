"use client";

import { useState, useRef, FormEvent } from "react";

interface FormState {
  name: string;
  phone: string;
  email: string;
  interest: string;
  message: string;
  company: string; // Honeypot
}

const initialFormState: FormState = {
  name: "",
  phone: "",
  email: "",
  interest: "",
  message: "",
  company: "",
};

export default function ConsultationSection() {
  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  const validateField = (name: keyof FormState, value: string): string => {
    switch (name) {
      case "name": {
        const trimmed = value.trim();
        if (trimmed.length < 2) {
          return "Enter a valid name using letters.";
        }
        // Support Unicode letters/marks and common name punctuation, reject numbers
        const nameRegex = /^[\p{L}\p{M}][\p{L}\p{M}\s.'’-]*$/u;
        if (!nameRegex.test(trimmed) || /\d/.test(trimmed)) {
          return "Enter a valid name using letters.";
        }
        return "";
      }
      case "phone": {
        let digits = value.replace(/\D/g, "");
        if (digits.length === 12 && digits.startsWith("91")) {
          digits = digits.slice(2);
        }
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(digits)) {
          return "Enter a valid 10-digit Indian mobile number.";
        }
        return "";
      }
      case "email": {
        const trimmed = value.trim();
        if (!trimmed || trimmed.length > 254) {
          return "Enter a valid email address.";
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        if (!emailRegex.test(trimmed)) {
          return "Enter a valid email address.";
        }
        return "";
      }
      case "interest": {
        if (!value) {
          return "Please choose an area of interest.";
        }
        return "";
      }
      case "message": {
        if (value.trim().length > 600) {
          return "Keep your message within 600 characters.";
        }
        return "";
      }
      default:
        return "";
    }
  };

  const handleChange = (
    field: keyof FormState,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // If an error exists for this field or submit was attempted, re-evaluate to clear or update
    if (errors[field] || hasAttemptedSubmit) {
      const error = validateField(field, value);
      setErrors((prev) => {
        const next = { ...prev };
        if (error) {
          next[field] = error;
        } else {
          delete next[field];
        }
        return next;
      });
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Honeypot check: reject silently if bot filled out honeypot
    if (formData.company) {
      return;
    }

    setHasAttemptedSubmit(true);

    const fieldsToValidate: (keyof FormState)[] = [
      "name",
      "phone",
      "email",
      "interest",
      "message",
    ];

    const newErrors: Record<string, string> = {};
    let firstInvalidField: string | null = null;

    for (const field of fieldsToValidate) {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        if (!firstInvalidField) {
          firstInvalidField = field;
        }
      }
    }

    setErrors(newErrors);

    if (firstInvalidField) {
      const element = document.getElementById(firstInvalidField);
      element?.focus();
      return;
    }

    // Local-only validation passed
    setIsSuccess(true);
    setTimeout(() => {
      successRef.current?.focus();
    }, 50);
  };

  const handleReset = () => {
    setFormData(initialFormState);
    setErrors({});
    setHasAttemptedSubmit(false);
    setIsSuccess(false);
    setTimeout(() => {
      nameInputRef.current?.focus();
    }, 50);
  };

  return (
    <section className="section contact" id="consultation">
      <div className="wrap contact-grid">
        <div className="contact-copy reveal">
          <span className="eyebrow">Request a consultation</span>
          <h2>Tell Llarron what you’d like support with.</h2>
          <p>
            Complete this short form to preview the enquiry experience. Nothing is
            transmitted or stored.
          </p>
        </div>

        <div className="form-card reveal">
          <div id="formView" hidden={isSuccess}>
            <div className="demo">
              <strong>Prototype notice:</strong> This is a demo form. No backend is
              connected and no enquiry will be sent.
            </div>

            <form id="form" noValidate onSubmit={handleSubmit}>
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
                    maxLength={80}
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

              <button className="btn primary submit" type="submit">
                Validate demo enquiry
              </button>
              <p className="small center">Demo only · No data is sent or saved</p>
            </form>
          </div>

          <div
            ref={successRef}
            className={`success ${isSuccess ? "show" : ""}`}
            id="success"
            role="status"
            tabIndex={-1}
          >
            <b>Form checked successfully.</b>
            <p>
              Your details passed local validation. Nothing was submitted because
              this prototype has no backend.
            </p>
            <button
              className="btn primary"
              id="reset"
              type="button"
              onClick={handleReset}
            >
              Return to form
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
