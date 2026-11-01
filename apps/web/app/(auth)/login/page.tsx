"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
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

  async function autoLogin(loginEmail: string, loginPass: string) {
    setEmail(loginEmail);
    setPassword(loginPass);
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPass }),
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
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-sm space-y-5 rounded-xl border border-slate-200 bg-white p-7 shadow-sm">
        <div className="text-left">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Sign In
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Collaborative Workspace
          </p>
        </div>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-2.5 text-xs text-red-600">
            {error}
          </div>
        )}

        <form
          className="space-y-3.5"
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
        >
          <div>
            <label className="block text-xs font-medium text-slate-700">Email address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-1.5 rounded-md bg-slate-900 px-4 py-2.5 text-xs font-medium text-white hover:bg-slate-800 transition disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Continue"}
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-400">
          No account?{" "}
          <Link href="/register" className="text-slate-800 font-medium hover:underline">
            Create one
          </Link>
        </div>

        {/* Reviewer Multi-User Auto-Login */}
        <div className="pt-3 border-t border-slate-100">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 text-center">
            Reviewer 1-Click Auto-Login
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => autoLogin("amar@example.com", "password123")}
              className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-slate-100 hover:border-slate-300 transition text-center cursor-pointer disabled:opacity-50"
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white mb-1">
                A
              </div>
              <span className="text-[11px] font-medium text-slate-800">Amar</span>
              <span className="text-[9px] text-slate-400">Owner</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => autoLogin("sarah@example.com", "password123")}
              className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-slate-100 hover:border-slate-300 transition text-center cursor-pointer disabled:opacity-50"
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-pink-500 text-[10px] font-bold text-white mb-1">
                S
              </div>
              <span className="text-[11px] font-medium text-slate-800">Sarah</span>
              <span className="text-[9px] text-slate-400">Editor</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => autoLogin("alex@example.com", "password123")}
              className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-slate-100 hover:border-slate-300 transition text-center cursor-pointer disabled:opacity-50"
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white mb-1">
                A
              </div>
              <span className="text-[11px] font-medium text-slate-800">Alex</span>
              <span className="text-[9px] text-slate-400">Member</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
