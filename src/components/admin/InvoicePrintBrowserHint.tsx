"use client";

/** Screen-only: browsers add URL/date to PDF unless the user disables headers & footers in print settings. */
export function InvoicePrintBrowserHint() {
  return (
    <div className="invoice-print-browser-hint">
      <strong>Cleaner PDF:</strong> In the print dialog, open <strong>More settings</strong> and{" "}
      <strong>turn off Headers and footers</strong> (Chrome / Edge) so the file does not include the page URL, date,
      or title along the edges.
    </div>
  );
}
