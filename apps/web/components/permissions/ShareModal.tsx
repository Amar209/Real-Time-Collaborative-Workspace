"use client";

import { useState, useEffect, useCallback } from "react";
import { Share2, X, Copy, Check, Shield, Trash2, UserPlus, Loader2 } from "lucide-react";

export interface PermissionRecord {
  id: string;
  role: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatarColor: string;
  };
}

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  docId: string;
  docTitle: string;
}

export default function ShareModal({ isOpen, onClose, docId, docTitle }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("EDITOR");
  const [permissions, setPermissions] = useState<PermissionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchPermissions = useCallback(async () => {
    if (!docId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/documents/${docId}/permissions`);
      if (res.ok) {
        const data = await res.json();
        setPermissions(data.permissions || []);
      }
    } catch (err) {
      console.error("Failed to fetch permissions:", err);
    } finally {
      setLoading(false);
    }
  }, [docId]);

  useEffect(() => {
    if (isOpen) {
      fetchPermissions();
      setError("");
      setSuccess("");
    }
  }, [isOpen, fetchPermissions]);

  if (!isOpen) return null;

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  function copyLink() {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const res = await fetch(`/api/documents/${docId}/permissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), role }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to invite collaborator");
      }

      setSuccess(`Invited ${data.permission.user.name} as ${role}!`);
      setEmail("");
      fetchPermissions();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An error occurred");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove(permissionId: string) {
    try {
      const res = await fetch(`/api/documents/${docId}/permissions`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissionId }),
      });
      if (res.ok) {
        setPermissions((prev) => prev.filter((p) => p.id !== permissionId));
      }
    } catch (err) {
      console.error("Failed to remove permission:", err);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-lg">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Share</h3>
            <p className="text-xs text-slate-500 truncate max-w-xs">{docTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Dynamic Alerts */}
        {error && (
          <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-600">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 p-2 text-xs text-emerald-700">
            {success}
          </div>
        )}

        <div className="mt-4 space-y-4">
          {/* Invite Form */}
          <form onSubmit={handleInvite}>
            <label className="text-xs font-medium text-slate-700">Invite by email</label>
            <div className="mt-1 flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@example.com"
                className="flex-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none"
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs text-slate-700 focus:outline-none"
              >
                <option value="EDITOR">Editor</option>
                <option value="COMMENTER">Commenter</option>
                <option value="VIEWER">Viewer</option>
              </select>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-1 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 transition disabled:opacity-50"
              >
                {submitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <UserPlus className="h-3 w-3" />}
                Invite
              </button>
            </div>
          </form>

          {/* Current Collaborators List */}
          <div>
            <div className="text-xs font-semibold text-slate-700 mb-2">People with Access</div>
            {loading ? (
              <div className="flex items-center justify-center py-4 text-xs text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin text-emerald-500 mr-2" />
                Loading collaborators...
              </div>
            ) : permissions.length === 0 ? (
              <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-2xl border border-slate-100">
                Only workspace members currently have default access. Invite specific users above!
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {permissions.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-2xl border border-slate-100 bg-[#f9f9fb] p-3 transition"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div
                        className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm"
                        style={{ backgroundColor: p.user.avatarColor || "#10b981" }}
                      >
                        {p.user.name.charAt(0)}
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-900 truncate tracking-tight">{p.user.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{p.user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-slate-700 border border-slate-200">
                        {p.role}
                      </span>
                      <button
                        onClick={() => handleRemove(p.id)}
                        title="Remove access"
                        className="rounded-full p-1 text-slate-400 hover:bg-red-50 hover:text-red-500 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Public Link Access */}
          <div className="rounded-2xl border border-slate-200/70 bg-[#f9f9fb] p-4">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                <Shield className="h-4 w-4 text-emerald-500" />
                Direct Link Access
              </span>
              <span className="text-[11px] font-semibold text-emerald-600">Active</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 truncate rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs text-slate-600 select-all"
              />
              <button
                onClick={copyLink}
                className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 shadow-sm transition"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy Link"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
