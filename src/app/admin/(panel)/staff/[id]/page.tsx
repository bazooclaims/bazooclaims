import { notFound } from "next/navigation";

import { StaffDetailForm } from "@/components/admin/StaffDetailForm";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { getSession } from "@/lib/admin/auth";
import { isAdminRole, roleSuggestionsFromStaff } from "@/lib/admin/staff-role";
import { bootstrapAdminIfNeeded, readDb } from "@/lib/admin/store";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const db = await readDb();
  const s = db.staff.find((x) => x.id === id);
  return { title: s ? s.name : "Staff" };
}

export default async function StaffDetailPage({ params }: Props) {
  await bootstrapAdminIfNeeded();
  const { id } = await params;
  const session = await getSession();
  const db = await readDb();
  const row = db.staff.find((s) => s.id === id);
  if (!row) notFound();

  const isAdmin = session ? isAdminRole(session.role) : false;
  const isSelf = session?.staffId === id;
  if (!isAdmin && !isSelf) {
    notFound();
  }

  const { passwordHash: _, ...safe } = row;

  return (
    <>
      <AdminPageHeader title={safe.name} description={safe.active ? `${safe.email} · ${safe.role}` : "Inactive account"} />
      <StaffDetailForm
        staff={safe}
        sessionStaffId={session!.staffId}
        isAdmin={isAdmin}
        roleSuggestions={roleSuggestionsFromStaff(db.staff.map((s) => s.role))}
      />
    </>
  );
}
