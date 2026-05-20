"use client";

import { useEffect, useState } from "react";

import { AdminSidebar } from "@/components/admin/AdminSidebar";

const STORAGE_KEY = "bazoo_admin_sidebar_collapsed";

export function AdminPanelShell({
  staffName,
  role,
  children,
}: {
  staffName: string;
  role: string;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      /* ignore */
    }
  }, []);

  function toggleCollapsed() {
    setCollapsed((c) => {
      const next = !c;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  return (
    <div
      className={`flex min-h-[100dvh] flex-col bg-[var(--color-page)] md:h-[100dvh] md:min-h-0 md:max-h-[100dvh] md:overflow-hidden md:transition-[grid-template-columns] md:duration-200 md:grid ${
        collapsed ? "md:grid-cols-[4.5rem_minmax(0,1fr)]" : "md:grid-cols-[15rem_minmax(0,1fr)] lg:grid-cols-[16rem_minmax(0,1fr)]"
      }`}
    >
      <AdminSidebar
        staffName={staffName}
        role={role}
        collapsed={collapsed}
        onToggleCollapse={toggleCollapsed}
      />
      <main className="min-h-0 min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 md:overflow-y-auto md:overscroll-y-contain">
        {children}
      </main>
    </div>
  );
}
