type InvoiceLineLike = { quantity: number; unitPrice: number };

export function invoiceTotals(invoice: { lines: InvoiceLineLike[]; taxRate: number }) {
  const subtotal = invoice.lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
  const tax = subtotal * (invoice.taxRate / 100);
  return { subtotal, tax, total: subtotal + tax };
}

type PdfTotalsInput = { lines: InvoiceLineLike[]; taxRate: number; showTaxOnPdf?: boolean };

/** Amounts as shown on the printed invoice (respects “hide VAT on PDF”). */
export function invoicePdfTotals(invoice: PdfTotalsInput) {
  const { subtotal, tax, total } = invoiceTotals(invoice);
  if (invoice.showTaxOnPdf === false) {
    return { subtotal, tax: 0, total: subtotal, showTaxOnPdf: false as const };
  }
  return { subtotal, tax, total, showTaxOnPdf: true as const };
}
