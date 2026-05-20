"use client";

import { useEffect } from "react";

/** Opens the browser print dialog once the invoice view has mounted (fonts/layout). */
export function InvoicePrintAuto({ enabled = true }: { enabled?: boolean }) {
  useEffect(() => {
    if (!enabled) return;
    const id = window.setTimeout(() => window.print(), 400);
    return () => window.clearTimeout(id);
  }, [enabled]);
  return null;
}
