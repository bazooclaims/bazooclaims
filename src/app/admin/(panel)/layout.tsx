import { redirect } from "next/navigation";

import { AdminPanelShell } from "@/components/admin/AdminPanelShell";
import { getSession } from "@/lib/admin/auth";
import { bootstrapAdminIfNeeded } from "@/lib/admin/store";

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  await bootstrapAdminIfNeeded();
  const session = await getSession();
  if (!session) redirect("/admin/login");

  return (
    <AdminPanelShell staffName={session.name} role={session.role}>
      {children}
    </AdminPanelShell>
  );
}
