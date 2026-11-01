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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#090d16] p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-blue-400" />
            <h3 className="text-base font-semibold text-white">Share Document</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-300">Invite by Email</label>
            <div className="mt-1 flex gap-2">
              <input
                type="email"
                placeholder="colleague@example.com"
                className="flex-1 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-800 px-2 py-2 text-xs text-slate-200 focus:outline-none"
              >
                <option value="EDITOR">Can Edit</option>
                <option value="COMMENTER">Can Comment</option>
                <option value="VIEWER">Can View</option>
              </select>
              <button
                onClick={() => alert(`Invited with role: ${role}`)}
                className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition"
              >
                Invite
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="flex items-center gap-1.5 font-medium text-slate-300">
                <Shield className="h-3.5 w-3.5 text-emerald-400" />
                Public Link Access
              </span>
              <span className="text-[11px] text-emerald-400">Anyone with link</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 truncate rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-400 select-all"
              />
              <button
                onClick={copyLink}
                className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700 transition"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
