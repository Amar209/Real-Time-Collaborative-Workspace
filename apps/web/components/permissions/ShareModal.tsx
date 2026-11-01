"use client";

import { useState } from "react";
import { Share2, X, Copy, Check, Shield } from "lucide-react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  docTitle: string;
}

export default function ShareModal({ isOpen, onClose, docTitle }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [role, setRole] = useState("EDITOR");

  if (!isOpen) return null;

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  function copyLink() {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-6 shadow-apple-lg">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <Share2 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Share Document</h3>
              <p className="text-xs text-slate-500">{docTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700">Invite Collaborator</label>
            <div className="mt-1.5 flex gap-2">
              <input
                type="email"
                placeholder="colleague@example.com"
                className="flex-1 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none"
              >
                <option value="EDITOR">Can Edit</option>
                <option value="COMMENTER">Can Comment</option>
                <option value="VIEWER">Can View</option>
              </select>
              <button
                onClick={() => alert(`Invited with role: ${role}`)}
                className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition shadow-mint"
              >
                Invite
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/70 bg-[#f9f9fb] p-4">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2.5">
              <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                <Shield className="h-4 w-4 text-emerald-500" />
                Public Link Access
              </span>
              <span className="text-[11px] font-semibold text-emerald-600">Anyone with link</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 truncate rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 select-all"
              />
              <button
                onClick={copyLink}
                className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 shadow-sm transition"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
