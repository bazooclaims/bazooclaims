import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/admin/auth";
import { bootstrapAdminIfNeeded } from "@/lib/admin/store";

/** Print/export routes: auth only — no dashboard sidebar or panel chrome. */
export default async function AdminPrintLayout({ children }: { children: ReactNode }) {
  await bootstrapAdminIfNeeded();
  const session = await getSession();
  if (!session) redirect("/admin/login");

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .admin-print-shell { min-height: 100dvh; box-sizing: border-box; }
            @media print {
              @page { margin: 12mm; size: A4; }
              html, body {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
                background: #fff !important;
              }
              .admin-print-shell {
                padding: 0 !important;
                margin: 0 !important;
                min-height: auto !important;
                background: #fff !important;
              }
            }
          `,
        }}
      />
      <div className="admin-print-shell min-h-[100dvh] bg-slate-100 p-4 print:bg-white print:p-0">{children}</div>
    </>
  );
}
