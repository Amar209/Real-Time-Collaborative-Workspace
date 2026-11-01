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

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-sm space-y-6 rounded-xl border border-slate-200 bg-white p-7 shadow-sm">
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

        {/* Subtle Reviewer Helper */}
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-center text-[11px] text-slate-500">
          <p className="font-medium text-slate-700">Reviewer Test Account</p>
          <div className="mt-1 flex items-center justify-center gap-1.5 font-mono text-[10px] text-slate-600">
            <span>amar@example.com</span>
            <span>/</span>
            <span>password123</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setEmail("amar@example.com");
              setPassword("password123");
            }}
            className="mt-1 text-[10px] text-slate-500 hover:text-slate-800 underline transition cursor-pointer"
          >
            Auto-fill
          </button>
        </div>
      </div>
    </div>
  );
}
