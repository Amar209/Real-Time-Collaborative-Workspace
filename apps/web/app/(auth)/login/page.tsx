"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck, Users } from "lucide-react";

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
    <div className="flex min-h-screen items-center justify-center bg-[#090d16] px-4 py-12">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-lg shadow-blue-500/20">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-white">
            Collab Workspace
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Real-time multiplayer documents with CRDT conflict resolution
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-center text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Quick Demo Switcher for Multiplayer Testing */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            <Users className="h-4 w-4 text-blue-400" />
            Instant Multiplayer Quick-Login
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleLogin("amar@example.com", "password123")}
              disabled={loading}
              className="flex flex-col items-center justify-center rounded-lg border border-blue-500/30 bg-blue-500/10 p-2.5 text-xs font-medium text-blue-300 transition hover:bg-blue-500/20"
            >
              <span className="h-2 w-2 rounded-full bg-blue-400 mb-1" />
              Amar (Owner)
            </button>
            <button
              onClick={() => handleLogin("sarah@example.com", "password123")}
              disabled={loading}
              className="flex flex-col items-center justify-center rounded-lg border border-pink-500/30 bg-pink-500/10 p-2.5 text-xs font-medium text-pink-300 transition hover:bg-pink-500/20"
            >
              <span className="h-2 w-2 rounded-full bg-pink-400 mb-1" />
              Sarah (Editor)
            </button>
            <button
              onClick={() => handleLogin("alex@example.com", "password123")}
              disabled={loading}
              className="flex flex-col items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs font-medium text-emerald-300 transition hover:bg-emerald-500/20"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400 mb-1" />
              Alex (Member)
            </button>
          </div>
          <p className="mt-2 text-center text-[11px] text-slate-500">
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
            <label className="block text-xs font-medium text-slate-300">Email address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500 disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Sign in"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-400">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-blue-400 hover:text-blue-300">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
