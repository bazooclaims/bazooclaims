"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { StaffRoleInput } from "@/components/admin/StaffRoleInput";
import { inputClass, labelClass } from "@/components/admin/admin-ui";
import type { StaffMember } from "@/types/admin";

type SafeStaff = Omit<StaffMember, "passwordHash">;

export function StaffDetailForm({
  staff: initial,
  sessionStaffId,
  isAdmin,
  roleSuggestions,
}: {
  staff: SafeStaff;
  sessionStaffId: string;
  isAdmin: boolean;
  roleSuggestions: string[];
}) {
  const router = useRouter();
  const [staff, setStaff] = useState(initial);
  const [password, setPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    const body: Record<string, unknown> = {
      name: staff.name,
      email: staff.email,
    };
    if (password) {
      body.password = password;
      if (!isAdmin) body.currentPassword = currentPassword;
    }
    if (isAdmin) {
      body.role = staff.role;
      body.active = staff.active;
    }
    const res = await fetch(`/api/admin/staff/${staff.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "Save failed");
      return;
    }
    setPassword("");
    setCurrentPassword("");
    if (data.staff) setStaff(data.staff);
    setMessage("Saved.");
    router.refresh();
  }

  async function remove() {
    if (!isAdmin) return;
    if (!confirm(`Remove ${staff.name} from the team? They will no longer be able to sign in.`)) return;
    const res = await fetch(`/api/admin/staff/${staff.id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Remove failed");
      return;
    }
    router.push("/admin/staff");
    router.refresh();
  }

  return (
    <form onSubmit={save} className="space-y-6">
      <p className="text-sm">
        <Link href="/admin/staff" className="font-medium text-[var(--color-surface)] hover:underline">
          ← Back to staff
        </Link>
      </p>
      {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p> : null}
      {message ? <p className="text-sm text-[var(--color-ink-muted)]">{message}</p> : null}

      <section className="rounded-xl border border-[var(--color-surface)]/10 bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-[var(--color-ink)]">Profile</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Full name
            <input
              className={inputClass}
              value={staff.name}
              onChange={(e) => setStaff((s) => ({ ...s, name: e.target.value }))}
              required
            />
          </label>
          <label className={labelClass}>
            Email (sign-in)
            <input
              type="email"
              className={inputClass}
              value={staff.email}
              onChange={(e) => setStaff((s) => ({ ...s, email: e.target.value }))}
              required
            />
          </label>
          {isAdmin ? (
            <>
              <StaffRoleInput
                value={staff.role}
                onChange={(role) => setStaff((s) => ({ ...s, role }))}
                suggestions={roleSuggestions}
              />
              <label className={`${labelClass} flex flex-col gap-2`}>
                <span>Active</span>
                <label className="flex cursor-pointer items-center gap-2 text-sm font-normal">
                  <input
                    type="checkbox"
                    checked={staff.active}
                    onChange={(e) => setStaff((s) => ({ ...s, active: e.target.checked }))}
                  />
                  Can sign in
                </label>
              </label>
            </>
          ) : (
            <p className="sm:col-span-2 text-sm text-[var(--color-ink-muted)]">
              Role and active status can only be changed by an admin.
            </p>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-[var(--color-surface)]/10 bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-[var(--color-ink)]">Password</h2>
        <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
          Leave blank to keep the current password. {isAdmin ? "Admins can set a new password without the old one." : "Enter your current password to set a new one."}
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {!isAdmin && sessionStaffId === staff.id ? (
            <label className={labelClass}>
              Current password
              <input
                type="password"
                className={inputClass}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
              />
            </label>
          ) : null}
          <label className={`${labelClass} ${!isAdmin && sessionStaffId === staff.id ? "" : "sm:col-span-2"}`}>
            New password (min 8 characters)
            <input
              type="password"
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              autoComplete="new-password"
            />
          </label>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-[var(--color-surface)] px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
        {isAdmin && sessionStaffId !== staff.id ? (
          <button
            type="button"
            onClick={remove}
            className="rounded-lg border border-red-200 px-4 py-2.5 text-sm text-red-700"
          >
            Remove staff
          </button>
        ) : null}
      </div>
    </form>
  );
}
