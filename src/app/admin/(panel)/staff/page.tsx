import { StaffManageForm, StaffTable } from "@/components/admin/StaffManageForm";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { getSession } from "@/lib/admin/auth";
import { isAdminRole, roleSuggestionsFromStaff } from "@/lib/admin/staff-role";
import { bootstrapAdminIfNeeded, readDb } from "@/lib/admin/store";

export const metadata = { title: "Staff" };

export default async function AdminStaffPage() {
  await bootstrapAdminIfNeeded();
  const session = await getSession();
  const db = await readDb();
  const staff = db.staff.map(({ passwordHash: _, ...s }) => s);

  return (
    <>
      <AdminPageHeader
        title="Staff"
        description="Add team members with any role label (e.g. Claims handler, Office manager). Use “admin” for full access."
      />
      <StaffManageForm
        canCreateAdmin={session ? isAdminRole(session.role) : false}
        roleSuggestions={roleSuggestionsFromStaff(db.staff.map((s) => s.role))}
      />
      <StaffTable staff={staff} />
    </>
  );
}
