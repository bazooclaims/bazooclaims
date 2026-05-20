import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { InvoicePrintAuto } from "@/components/admin/InvoicePrintAuto";
import { InvoicePrintBrowserHint } from "@/components/admin/InvoicePrintBrowserHint";
import { siteConfig } from "@/config/site";
import { invoicePdfTotals } from "@/lib/admin/invoice-math";
import { bootstrapAdminIfNeeded, readDb } from "@/lib/admin/store";
import type { VendorKind } from "@/types/admin";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ preview?: string }> };

function formatCompanyAddress(profile: {
  addressLines: string[];
  city?: string;
  postcode?: string;
  country: string;
}): string[] {
  const lines = [...profile.addressLines.map((l) => l.trim()).filter(Boolean)];
  const tail = [profile.city, profile.postcode].filter(Boolean).join(" ").trim();
  if (tail) lines.push(tail);
  if (profile.country) lines.push(profile.country);
  return lines;
}

const kindLabel: Record<VendorKind, string> = {
  courtesy_hire: "Courtesy / credit hire",
  solicitor: "Solicitor",
  recovery: "Recovery",
  insurer: "Insurer",
  other: "Partner",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await bootstrapAdminIfNeeded();
  const { id } = await params;
  const db = await readDb();
  const invoice = db.invoices.find((i) => i.id === id);
  if (!invoice) return { title: "Invoice" };
  return { title: invoice.number };
}

export default async function InvoicePrintPage({ params, searchParams }: Props) {
  await bootstrapAdminIfNeeded();
  const { id } = await params;
  const sp = await searchParams;
  const isPreview = sp.preview === "1" || sp.preview === "true";
  const db = await readDb();
  const invoice = db.invoices.find((i) => i.id === id);
  if (!invoice) notFound();
  const pdfTotals = invoicePdfTotals(invoice);
  const profile = db.companyProfile;
  const docLabel = (invoice.documentTitle?.trim() || "Tax invoice").slice(0, 64);
  const displayName = profile.tradingName?.trim() || profile.legalName;
  const logoSrc =
    profile.logoPath && profile.logoPath.startsWith("/") ? `${siteConfig.url}${profile.logoPath}` : null;
  const addrLines = formatCompanyAddress(profile);
  const claim = invoice.claimId ? db.claims.find((c) => c.id === invoice.claimId) : undefined;

  const printVendors =
    invoice.showLinkedVendorsOnPdf && invoice.linkedVendorIds?.length
      ? db.vendors.filter((v) => invoice.linkedVendorIds!.includes(v.id) && v.allowOnInvoice)
      : [];

  const printStaff =
    invoice.showStaffOnPdf && invoice.assignedStaffId
      ? db.staff.find((s) => s.id === invoice.assignedStaffId && s.active)
      : undefined;

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,600;0,9..40,700;1,9..40,400&family=Instrument+Sans:wght@500;600&display=swap');
.invoice-print-outer { box-sizing: border-box; }
.invoice-print-card { box-sizing: border-box; }
.invoice-print-browser-hint {
  margin: 0 auto 16px;
  max-width: 780px;
  padding: 12px 14px;
  border-radius: 8px;
  background: #fef3c7;
  border: 1px solid #fcd34d;
  font-size: 12px;
  line-height: 1.45;
  color: #78350f;
  box-sizing: border-box;
}
@media print {
  @page { size: A4; margin: 10mm; }
  html, body {
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
    background: #fff !important;
    height: auto !important;
  }
  .admin-print-shell { padding: 0 !important; margin: 0 !important; background: #fff !important; }
  .invoice-print-outer {
    padding: 0 !important;
    margin: 0 !important;
    background: #fff !important;
    width: 100% !important;
    max-width: none !important;
    min-height: 0 !important;
  }
  .invoice-print-card {
    max-width: none !important;
    width: 100% !important;
    margin: 0 !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    border: none !important;
  }
  .invoice-print-browser-hint { display: none !important; }
}`,
        }}
      />
      <div
        className="invoice-print-outer print:bg-white print:p-0"
        style={{
          margin: 0,
          padding: isPreview ? "12px" : "28px 36px 40px",
          fontFamily: "'DM Sans', ui-sans-serif, system-ui, sans-serif",
          color: "#0f172a",
          background: "#f8fafc",
          fontSize: 13,
          lineHeight: 1.45,
        }}
      >
        {!isPreview ? <InvoicePrintBrowserHint /> : null}
        <div
          className="invoice-print-card mx-auto w-full max-w-[780px] bg-white print:mx-0 print:max-w-none"
          style={{
            borderRadius: 12,
            boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.12)",
            overflow: "hidden",
            border: "1px solid #e2e8f0",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "stretch",
              justifyContent: "space-between",
              gap: 24,
              padding: "28px 32px",
              background: "linear-gradient(120deg, #0f172a 0%, #134e4a 55%, #0d9488 100%)",
              color: "#f8fafc",
            }}
          >
            <div style={{ minWidth: 200, flex: "1 1 220px" }}>
              {logoSrc ? (
                <div style={{ marginBottom: 12 }}>
                  <Image
                    src={logoSrc}
                    alt=""
                    width={220}
                    height={64}
                    unoptimized
                    style={{ height: 52, width: "auto", maxWidth: 220, objectFit: "contain", objectPosition: "left" }}
                  />
                </div>
              ) : null}
              <div
                style={{
                  fontFamily: "'Instrument Sans', sans-serif",
                  fontSize: 22,
                  fontWeight: 600,
                  letterSpacing: "-0.02em",
                }}
              >
                {displayName}
              </div>
              {profile.tradingName?.trim() && profile.legalName !== profile.tradingName ? (
                <div style={{ marginTop: 4, fontSize: 11, opacity: 0.85 }}>{profile.legalName}</div>
              ) : null}
            </div>
            <div style={{ textAlign: "right", minWidth: 180 }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.16em", opacity: 0.75 }}>
                {docLabel}
              </div>
              <div style={{ marginTop: 8, fontSize: 26, fontWeight: 700, letterSpacing: "-0.03em" }}>
                {invoice.number}
              </div>
              <div style={{ marginTop: 10, fontSize: 12, opacity: 0.9 }}>
                Issued {invoice.issueDate}
                <br />
                Due {invoice.dueDate}
                <br />
                <span style={{ textTransform: "capitalize" }}>{invoice.status}</span>
              </div>
            </div>
          </div>

          <div style={{ padding: "26px 32px 8px", display: "grid", gap: 20, gridTemplateColumns: "1fr 1fr" }}>
            <div
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: 10,
                padding: "16px 18px",
                background: "#f8fafc",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: "#64748b",
                }}
              >
                From
              </div>
              <div style={{ marginTop: 8, fontWeight: 600 }}>{displayName}</div>
              <div style={{ marginTop: 6, color: "#475569", fontSize: 12 }}>
                {addrLines.map((line) => (
                  <div key={line}>{line}</div>
                ))}
                {profile.phone ? <div style={{ marginTop: 6 }}>Tel {profile.phone}</div> : null}
                {profile.email ? <div>{profile.email}</div> : null}
                {profile.website ? <div>{profile.website}</div> : null}
                {profile.vatNumber && pdfTotals.showTaxOnPdf !== false ? (
                  <div style={{ marginTop: 8, fontWeight: 600, color: "#0f172a" }}>VAT {profile.vatNumber}</div>
                ) : null}
                {profile.companyNumber ? (
                  <div style={{ marginTop: 4, fontSize: 12, color: "#475569" }}>Company no. {profile.companyNumber}</div>
                ) : null}
              </div>
            </div>
            <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: "16px 18px" }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: "#64748b",
                }}
              >
                Bill to
              </div>
              <div style={{ marginTop: 8, fontWeight: 600 }}>{invoice.clientName}</div>
              {invoice.clientEmail ? <div style={{ marginTop: 4, color: "#475569" }}>{invoice.clientEmail}</div> : null}
              {invoice.clientAddress ? (
                <div style={{ marginTop: 8, color: "#475569", fontSize: 12, whiteSpace: "pre-wrap" }}>
                  {invoice.clientAddress}
                </div>
              ) : null}
            </div>
          </div>

          {claim ? (
            <div style={{ padding: "0 32px 8px", fontSize: 11, color: "#64748b" }}>
              Linked claim: <strong style={{ color: "#0f172a" }}>{claim.reference}</strong> ·{" "}
              {claim.vehicleRegistration}
              {claim.vehicleMakeModel?.trim() ? ` · ${claim.vehicleMakeModel}` : ""}
              {claim.thirdPartyVehicleMakeModel?.trim()
                ? ` · Third party: ${claim.thirdPartyVehicleMakeModel}`
                : ""}
            </div>
          ) : null}

          {printStaff ? (
            <div style={{ padding: "0 32px 12px", fontSize: 12, color: "#334155" }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: "#64748b",
                }}
              >
                Your contact
              </div>
              <div style={{ marginTop: 6, fontWeight: 600, color: "#0f172a" }}>{printStaff.name}</div>
              <div style={{ marginTop: 2, color: "#475569" }}>{printStaff.role}</div>
            </div>
          ) : null}

          <div style={{ padding: "12px 32px 28px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "#0f172a", color: "#f1f5f9" }}>
                  <th style={{ textAlign: "left", padding: "10px 12px", fontWeight: 600 }}>Description</th>
                  <th style={{ textAlign: "right", padding: "10px 12px", fontWeight: 600, width: 56 }}>Qty</th>
                  <th style={{ textAlign: "right", padding: "10px 12px", fontWeight: 600, width: 100 }}>Unit</th>
                  <th style={{ textAlign: "right", padding: "10px 12px", fontWeight: 600, width: 100 }}>Net</th>
                </tr>
              </thead>
              <tbody>
                {invoice.lines.map((l, i) => (
                  <tr
                    key={l.id}
                    style={{
                      borderBottom: "1px solid #e2e8f0",
                      background: i % 2 === 0 ? "#fff" : "#f8fafc",
                    }}
                  >
                    <td style={{ padding: "10px 12px", color: "#1e293b" }}>{l.description}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right", color: "#475569" }}>{l.quantity}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                      £{l.unitPrice.toFixed(2)}
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                      £{(l.quantity * l.unitPrice).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
              <div style={{ width: 280, borderRadius: 10, border: "1px solid #e2e8f0", overflow: "hidden" }}>
                {pdfTotals.showTaxOnPdf !== false ? (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "#f8fafc" }}>
                      <span style={{ color: "#64748b" }}>Net (ex VAT)</span>
                      <span style={{ fontVariantNumeric: "tabular-nums" }}>£{pdfTotals.subtotal.toFixed(2)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", borderTop: "1px solid #e2e8f0" }}>
                      <span style={{ color: "#64748b" }}>VAT @ {invoice.taxRate}%</span>
                      <span style={{ fontVariantNumeric: "tabular-nums" }}>£{pdfTotals.tax.toFixed(2)}</span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "12px 14px",
                        background: "linear-gradient(90deg, #0f766e, #0d9488)",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: 15,
                      }}
                    >
                      <span>Total inc VAT</span>
                      <span style={{ fontVariantNumeric: "tabular-nums" }}>£{pdfTotals.total.toFixed(2)}</span>
                    </div>
                  </>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "12px 14px",
                      background: "linear-gradient(90deg, #0f766e, #0d9488)",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 15,
                    }}
                  >
                    <span>Total</span>
                    <span style={{ fontVariantNumeric: "tabular-nums" }}>£{pdfTotals.total.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>

            {invoice.notes ? (
              <div style={{ marginTop: 24, padding: 14, borderRadius: 10, background: "#f1f5f9", color: "#475569", fontSize: 12 }}>
                {invoice.notes}
              </div>
            ) : null}

            {printVendors.length > 0 ? (
              <div style={{ marginTop: 28, pageBreakInside: "avoid" }}>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.14em",
                    color: "#64748b",
                  }}
                >
                  Partner references
                </div>
                <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                  {printVendors.map((v) => (
                    <div
                      key={v.id}
                      style={{
                        border: "1px solid #cbd5e1",
                        borderRadius: 8,
                        padding: "12px 14px",
                        background: "#fff",
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>{v.name}</div>
                      <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{kindLabel[v.kind]}</div>
                      {v.address ? (
                        <div style={{ marginTop: 6, fontSize: 11, color: "#475569", whiteSpace: "pre-wrap" }}>{v.address}</div>
                      ) : null}
                      <div style={{ marginTop: 6, fontSize: 11, color: "#475569" }}>
                        {[v.email, v.phone].filter(Boolean).join(" · ")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div
              style={{
                marginTop: 32,
                paddingTop: 16,
                borderTop: "1px solid #e2e8f0",
                fontSize: 10,
                color: "#94a3b8",
                display: "flex",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <span>
                {pdfTotals.showTaxOnPdf !== false
                  ? `Amounts in GBP. Net line values; VAT applied at ${invoice.taxRate}% unless otherwise agreed in writing.`
                  : "Amounts in GBP. Net line values; this copy does not show a VAT breakdown."}
              </span>
              <span style={{ textAlign: "right" }}>
                {siteConfig.name} · {siteConfig.tagline}
              </span>
            </div>
          </div>
        </div>
      </div>
      <InvoicePrintAuto enabled={!isPreview} />
    </>
  );
}
