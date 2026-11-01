"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, ArrowRight, Users, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(targetEmail?: string, targetPassword?: string) {
    setError("");
    setLoading(true);

    const emailToSend = targetEmail || email;
    const passwordToSend = targetPassword || password;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToSend, password: passwordToSend }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to sign in");
      }

      router.push(`/${data.workspaceSlug}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An error occurred");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fbfbfd] px-4 py-12">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-slate-200/80 bg-white p-8 shadow-apple-lg">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-500 shadow-mint">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <span className="mt-4 inline-block text-[11px] font-bold tracking-widest uppercase text-emerald-600">
            Real-Time Collaboration
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Welcome Back
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Sign in to access your multiplayer workspace
          </p>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-3.5 text-center text-xs font-medium text-red-600">
            {error}
          </div>
        )}

        {/* Instant Demo Quick-Login Switcher */}
        <div className="rounded-2xl border border-slate-200/80 bg-[#f9f9fb] p-4">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
            <Users className="h-3.5 w-3.5 text-emerald-600" />
            Instant Multiplayer Quick-Login
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleLogin("amar@example.com", "password123")}
              disabled={loading}
              className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-800 shadow-apple transition hover:border-emerald-500 hover:shadow-mint"
            >
              <span className="h-2 w-2 rounded-full bg-blue-500 mb-1" />
              Amar (Owner)
            </button>
            <button
              onClick={() => handleLogin("sarah@example.com", "password123")}
              disabled={loading}
              className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-800 shadow-apple transition hover:border-emerald-500 hover:shadow-mint"
            >
              <span className="h-2 w-2 rounded-full bg-pink-500 mb-1" />
              Sarah (Editor)
            </button>
            <button
              onClick={() => handleLogin("alex@example.com", "password123")}
              disabled={loading}
              className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-800 shadow-apple transition hover:border-emerald-500 hover:shadow-mint"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500 mb-1" />
              Alex (Member)
            </button>
          </div>
          <p className="mt-2 text-center text-[11px] text-slate-400">
            Tip: Open an Incognito window with a 2nd user to test live cursors side-by-side!
          </p>
        </div>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
        >
          <div>
            <label className="block text-xs font-semibold text-slate-700">Email address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="mt-1.5 block w-full rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1.5 block w-full rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Sign In"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-emerald-600 hover:text-emerald-700">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
