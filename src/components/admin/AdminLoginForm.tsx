"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const registered = searchParams.get("registered") === "1";

  useEffect(() => {
    const prefill = searchParams.get("email");
    if (prefill) setEmail(prefill);
  }, [searchParams]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const next = searchParams.get("next") ?? "/admin/dashboard";

    const res = await fetch("/api/admin/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = (await res.json()) as { ok?: boolean; error?: string };
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Login failed");
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      {registered ? (
        <p className="rounded-lg bg-emerald-500/15 px-3 py-2 text-sm text-emerald-100" role="status">
          Account created. Sign in with your email and password.
        </p>
      ) : null}
      <label className="block">
        <span className="text-xs font-medium text-white/80">Email</span>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-lg border border-white/15 bg-[var(--color-surface)] px-3 py-2.5 text-sm text-white outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/30"
        />
      </label>
      <label className="block">
        <span className="text-xs font-medium text-white/80">Password</span>
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-lg border border-white/15 bg-[var(--color-surface)] px-3 py-2.5 text-sm text-white outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/30"
        />
      </label>
      {error ? (
        <p className="rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-200" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-[var(--color-accent)] py-3 text-sm font-bold text-[#002a35] transition hover:brightness-110 disabled:opacity-60"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
      <p className="text-center text-sm text-white/60">
        No account yet?{" "}
        <Link href="/admin/register" className="font-medium text-[var(--color-accent)] hover:underline">
          Create one
        </Link>
      </p>
    </form>
  );
}
