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
    <div className="fixed inset-y-0 right-0 z-30 flex w-80 flex-col border-l border-slate-800 bg-[#090d16] shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-800 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <History className="h-4 w-4 text-emerald-400" />
          Version History
        </div>
        <button
          onClick={onClose}
          className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="border-b border-slate-800 p-3">
        <form onSubmit={handleCreateSnapshot} className="flex gap-2">
          <input
            type="text"
            value={snapshotName}
            onChange={(e) => setSnapshotName(e.target.value)}
            placeholder="Checkpoint name..."
            className="flex-1 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={creating}
            className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" />
            Save
          </button>
        </form>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {snapshots.length === 0 ? (
          <p className="text-center text-xs text-slate-500 py-8 italic">
            No snapshots recorded yet. Click &quot;Save&quot; above to create a version checkpoint!
          </p>
        ) : (
          snapshots.map((snap) => (
            <div
              key={snap.id}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 shadow"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white truncate">
                  {snap.title}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-slate-400">
                  <Clock className="h-3 w-3" />
                  {new Date(snap.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: snap.createdBy.avatarColor }}
                  />
                  <span>{snap.createdBy.name}</span>
                </div>
                <button
                  onClick={() => alert(`Restoring version: ${snap.title}`)}
                  className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition font-medium"
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
