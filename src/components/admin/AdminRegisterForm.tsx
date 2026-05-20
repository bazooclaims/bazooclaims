"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function AdminRegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [canRegister, setCanRegister] = useState(false);
  const [blockedReason, setBlockedReason] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/admin/auth/register");
      const data = (await res.json()) as { canRegister?: boolean; reason?: string };
      setCanRegister(Boolean(data.canRegister));
      setBlockedReason(data.reason ?? null);
      setChecking(false);
    })();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/admin/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = (await res.json()) as {
      ok?: boolean;
      error?: string;
      needsSignIn?: boolean;
      message?: string;
    };
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Registration failed");
      return;
    }
    if (data.needsSignIn) {
      router.push(`/admin/login?registered=1&email=${encodeURIComponent(email)}`);
      return;
    }
    router.push("/admin/dashboard");
    router.refresh();
  }

  if (checking) {
    return <p className="mt-8 text-sm text-white/60">Checking registration…</p>;
  }

  if (!canRegister) {
    return (
      <div className="mt-8 space-y-4">
        <p className="rounded-lg bg-amber-500/15 px-3 py-2 text-sm text-amber-100" role="status">
          {blockedReason ?? "Registration is not available."}
        </p>
        <Link
          href="/admin/login"
          className="block text-center text-sm font-medium text-[var(--color-accent)] hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      <label className="block">
        <span className="text-xs font-medium text-white/80">Full name</span>
        <input
          type="text"
          required
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-white/15 bg-[var(--color-surface)] px-3 py-2.5 text-sm text-white outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/30"
        />
      </label>
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
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-lg border border-white/15 bg-[var(--color-surface)] px-3 py-2.5 text-sm text-white outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/30"
        />
      </label>
      <label className="block">
        <span className="text-xs font-medium text-white/80">Confirm password</span>
        <input
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
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
        {loading ? "Creating account…" : "Create admin account"}
      </button>
      <p className="text-center text-sm text-white/60">
        Already have an account?{" "}
        <Link href="/admin/login" className="font-medium text-[var(--color-accent)] hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
