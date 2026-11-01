"use client";

import { useState } from "react";
import { History, X, Plus, RotateCcw, Clock } from "lucide-react";

export interface SnapshotItem {
  id: string;
  title: string;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
    avatarColor: string;
  };
}

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  docId: string;
  snapshots: SnapshotItem[];
  onSnapshotCreated: (snapshot: SnapshotItem) => void;
}

export default function HistoryDrawer({
  isOpen,
  onClose,
  docId,
  snapshots,
  onSnapshotCreated,
}: HistoryDrawerProps) {
  const [creating, setCreating] = useState(false);
  const [snapshotName, setSnapshotName] = useState("");

  if (!isOpen) return null;

  async function handleCreateSnapshot(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch(`/api/documents/${docId}/snapshots`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: snapshotName || `Checkpoint - ${new Date().toLocaleTimeString()}`,
        }),
      });
      const data = await res.json();
      if (data.snapshot) {
        onSnapshotCreated(data.snapshot);
        setSnapshotName("");
      }
    } catch (err) {
      console.error("Failed to create snapshot:", err);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="fixed inset-y-0 right-0 z-30 flex w-84 flex-col border-l border-slate-200/80 bg-white/95 backdrop-blur-xl shadow-apple-lg">
      <div className="flex items-center justify-between border-b border-slate-200/80 p-4">
        <div className="flex items-center gap-2 text-sm font-bold tracking-tight text-slate-900">
          <History className="h-4 w-4 text-emerald-600" />
          Version History
        </div>
        <button
          onClick={onClose}
          className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="border-b border-slate-200/80 p-3.5 bg-slate-50/50">
        <form onSubmit={handleCreateSnapshot} className="flex gap-2">
          <input
            type="text"
            value={snapshotName}
            onChange={(e) => setSnapshotName(e.target.value)}
            placeholder="Checkpoint title..."
            className="flex-1 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs text-slate-900 placeholder-slate-400 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <button
            type="submit"
            disabled={creating}
            className="flex items-center gap-1 rounded-full bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition shadow-sm disabled:opacity-50"
          >
            <Plus className="h-3 w-3" />
            Save
          </button>
        </form>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {snapshots.length === 0 ? (
          <p className="text-center text-xs text-slate-400 py-12 italic">
            No snapshots recorded yet. Click &quot;Save&quot; above to create a version checkpoint!
          </p>
        ) : (
          snapshots.map((snap) => (
            <div
              key={snap.id}
              className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-apple"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 tracking-tight truncate">
                  {snap.title}
                </span>
                <span className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
                  <Clock className="h-3 w-3" />
                  {new Date(snap.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: snap.createdBy.avatarColor }}
                  />
                  <span>{snap.createdBy.name}</span>
                </div>
                <button
                  onClick={() => alert(`Restoring version: ${snap.title}`)}
                  className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 transition font-semibold"
                >
                  <RotateCcw className="h-3 w-3" />
                  Restore
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
