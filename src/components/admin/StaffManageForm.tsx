"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AdminDataTable, type Column } from "@/components/admin/AdminDataTable";
import { StaffRoleInput } from "@/components/admin/StaffRoleInput";
import { inputClass, labelClass } from "@/components/admin/admin-ui";
import type { StaffMember } from "@/types/admin";

type SafeStaff = Omit<StaffMember, "passwordHash">;

const viewBtn =
  "inline-flex items-center justify-center rounded-lg bg-[var(--color-surface)] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:opacity-95";

export function StaffManageForm({
  canCreateAdmin,
  roleSuggestions,
}: {
  canCreateAdmin: boolean;
  roleSuggestions: string[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(canCreateAdmin ? "handler" : "handler");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role: canCreateAdmin ? role : "handler" }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Failed to create staff");
      return;
    }
    setName("");
    setEmail("");
    setPassword("");
    setRole("handler");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-[var(--color-surface)]/10 bg-white p-5 shadow-sm">
      <h2 className="font-semibold text-[var(--color-ink)]">Add staff member</h2>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          Full name
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label className={labelClass}>
          Email
          <input type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className={labelClass}>
          Password
          <input
            type="password"
            className={inputClass}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
        </label>
        {canCreateAdmin ? (
          <StaffRoleInput value={role} onChange={setRole} suggestions={roleSuggestions} />
        ) : (
          <p className="text-sm text-[var(--color-ink-muted)] sm:col-span-2">
            New members are created with the <strong className="text-[var(--color-ink)]">handler</strong> role. An admin
            can change the role label later.
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={loading}
        className="mt-4 rounded-lg bg-[var(--color-surface)] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {loading ? "Creating…" : "Create staff"}
      </button>
    </form>
  );
}

export function StaffTable({ staff }: { staff: SafeStaff[] }) {
  const columns: Column<SafeStaff>[] = [
    {
      key: "name",
      header: "Name",
      render: (s) => (
        <Link href={`/admin/staff/${s.id}`} className="font-semibold text-[var(--color-surface)] hover:underline">
          {s.name}
        </Link>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (s) => <span className="block max-w-[14rem] truncate text-sm">{s.email}</span>,
    },
    {
      key: "role",
      header: "Role",
      render: (s) => (
        <span className="inline-flex max-w-[12rem] truncate rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-800 ring-1 ring-slate-200/80">
          {s.role}
        </span>
      ),
    },
    {
      key: "active",
      header: "Active",
      render: (s) => (
        <span className={s.active ? "font-medium text-teal-800" : "text-[var(--color-ink-muted)]"}>
          {s.active ? "Yes" : "No"}
        </span>
      ),
    },
    {
      key: "view",
      header: "",
      render: (s) => (
        <Link href={`/admin/staff/${s.id}`} className={viewBtn}>
          View
        </Link>
      ),
    },
  ];
  const n = staff.length;
  return (
    <div className="mt-8">
      <AdminDataTable<SafeStaff>
        baseHref="/admin/staff"
        columns={columns}
        rows={staff}
        rowIdField="id"
        page={1}
        totalPages={1}
        total={n}
        pageSize={Math.max(n, 1)}
      />
    </div>
  );
}
