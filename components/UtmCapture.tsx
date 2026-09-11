"use client";

import { useEffect } from "react";
import { captureAttribution } from "@/lib/utm";

/**
 * Lightweight Client Component mounted in root layout to capture
 * landing campaign parameters without converting the layout into a Client Component.
 */
export default function UtmCapture() {
  useEffect(() => {
    captureAttribution();
  }, []);

  return null;
}
