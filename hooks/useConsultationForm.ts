"use client";

import { useState, FormEvent, RefObject } from "react";
import { getAttribution, clearAttribution } from "@/lib/utm";

export interface FormState {
  name: string;
  phone: string;
  email: string;
  interest: string;
  message: string;
  company: string; // Honeypot field
}

export const initialFormState: FormState = {
  name: "",
  phone: "",
  email: "",
  interest: "",
  message: "",
  company: "",
};

export const REQUEST_TIMEOUT_MS = 10000;

export function normalizePhone(value: string): { raw: string; isValid: boolean } {
  let clean = value.replace(/[\s\-().]/g, "");

  if (clean.startsWith("+91")) {
    clean = clean.slice(3);
  } else if (clean.startsWith("91") && clean.length === 12) {
    clean = clean.slice(2);
  }

  const phoneRegex = /^[6-9]\d{9}$/;
  const isValid = phoneRegex.test(clean);

  return { raw: clean, isValid };
}

export function validateField(field: keyof FormState, value: string): string {
  switch (field) {
    case "name": {
      const trimmed = value.trim();
      if (trimmed.length < 2 || trimmed.length > 60) {
        return "Enter your name using 2-60 letters.";
      }
      const nameRegex = /^[a-zA-Z\s]+$/;
      if (!nameRegex.test(trimmed)) {
        return "Enter your name using 2-60 letters.";
      }
      return "";
    }
    case "phone": {
      const { isValid } = normalizePhone(value);
      if (!isValid) {
        return "Enter a valid 10-digit Indian mobile number beginning with 6-9.";
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
      if (!value.trim()) {
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
}

export function useConsultationForm() {
  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (field: keyof FormState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

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

  const handleSubmit = async (
    e: FormEvent,
    idPrefix?: string,
    successRef?: RefObject<HTMLElement | null>
  ) => {
    e.preventDefault();

    // Honeypot check: reject bots silently without submission
    if (formData.company) {
      return;
    }

    if (isSubmitting) {
      return;
    }

    setHasAttemptedSubmit(true);
    setSubmitError(null);

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
      const targetId = idPrefix ? `${idPrefix}_${firstInvalidField}` : firstInvalidField;
      const element = document.getElementById(targetId);
      element?.focus();
      return;
    }

    setIsSubmitting(true);

    const { raw: cleanPhone } = normalizePhone(formData.phone);
    const attribution = getAttribution();
    const resolvedTimezone =
      (typeof Intl !== "undefined" &&
        Intl.DateTimeFormat().resolvedOptions().timeZone) ||
      "Asia/Kolkata";
    const currentRoute =
      (typeof window !== "undefined" && window.location.pathname) || "/";

    const payload: Record<string, unknown> = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: cleanPhone,
      interest: formData.interest,
      countryCode: "+91",
      timezone: resolvedTimezone,
      route: currentRoute,
      ...attribution,
    };

    if (formData.message.trim()) {
      payload.message = formData.message.trim();
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      let data: {
        success?: boolean;
        message?: string;
        code?: string;
        data?: { status?: string };
      } | null = null;

      try {
        data = await response.json();
      } catch {
        // Non-JSON response / malformed payload
        throw new Error("MALFORMED_RESPONSE");
      }

      if (
        response.ok &&
        data?.success === true &&
        (data?.data?.status === "new" || data?.data?.status === "existing")
      ) {
        clearAttribution();
        setIsSuccess(true);
        setIsSubmitting(false);
        setTimeout(() => {
          successRef?.current?.focus();
        }, 50);
        return;
      }

      // API returned error response
      setIsSubmitting(false);
      if (response.status === 409 || data?.code === "USER_CONFLICT") {
        setSubmitError(
          data?.message ||
            "The details provided conflict with an existing enquiry. Please check your information and try again or reach out to us directly."
        );
      } else if (response.status === 400 || data?.code === "VALIDATION_ERROR") {
        setSubmitError(
          data?.message ||
            "Please check your details and try again. Some information seems to be missing or incorrect."
        );
      } else {
        setSubmitError(
          "Something went wrong while submitting your enquiry. Please try again later."
        );
      }
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      setIsSubmitting(false);

      const errorObj = err as { name?: string };
      if (errorObj?.name === "AbortError") {
        setSubmitError("Request timed out. Please check your connection and try again.");
      } else {
        setSubmitError(
          "Something went wrong while submitting your enquiry. Please check your connection and try again."
        );
      }
    }
  };

  const handleReset = (nameInputRef?: RefObject<HTMLInputElement | null>) => {
    setFormData(initialFormState);
    setErrors({});
    setHasAttemptedSubmit(false);
    setIsSubmitting(false);
    setSubmitError(null);
    setIsSuccess(false);
    setTimeout(() => {
      nameInputRef?.current?.focus();
    }, 50);
  };

  return {
    formData,
    errors,
    isSubmitting,
    submitError,
    isSuccess,
    handleChange,
    handleSubmit,
    handleReset,
  };
}
