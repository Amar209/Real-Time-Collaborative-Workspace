"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  MessageSquare,
  History,
  Share2,
  Sparkles,
  Wifi,
  WifiOff,
  RefreshCw,
  Trash2,
} from "lucide-react";
import CollaborativeEditor from "@/components/editor/Editor";
import LiveAvatars, { PresenceUser } from "@/components/presence/LiveAvatars";
import CommentsDrawer, { CommentItem } from "@/components/comments/CommentsDrawer";
import HistoryDrawer, { SnapshotItem } from "@/components/history/HistoryDrawer";
import ShareModal from "@/components/permissions/ShareModal";

interface DocData {
  id: string;
  title: string;
  icon: string | null;
  workspaceId: string;
}

interface CurrentUser {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
}

export default function DocumentPage() {
  const params = useParams();
  const router = useRouter();
  const docId = params.docId as string;
  const workspaceSlug = params.workspaceSlug as string;

  const [document, setDocument] = useState<DocData | null>(null);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [userRole, setUserRole] = useState<string>("EDITOR");
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("📄");

  // Real-time Presence & Sync Status
  const [presenceUsers, setPresenceUsers] = useState<PresenceUser[]>([]);
  const [syncStatus, setSyncStatus] = useState<"connected" | "connecting" | "disconnected">("connecting");

  // Drawers & Modals
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Comments & Snapshots
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [snapshots, setSnapshots] = useState<SnapshotItem[]>([]);

  const fetchDocument = useCallback(async () => {
    try {
      const res = await fetch(`/api/documents/${docId}`);
      if (!res.ok) {
        router.push(`/${workspaceSlug}`);
        return;
      }
      const data = await res.json();
      setDocument(data.document);
      setTitle(data.document.title || "Untitled");
      setIcon(data.document.icon || "📄");
      setUser(data.user);
      setUserRole(data.userRole || "EDITOR");
      setComments(data.document.comments || []);
    } catch (err) {
      console.error("Fetch document error:", err);
    } finally {
      setLoading(false);
    }
  }, [docId, workspaceSlug, router]);

  useEffect(() => {
    fetchDocument();
  }, [fetchDocument]);

  async function handleTitleChange(newTitle: string) {
    setTitle(newTitle);
    try {
      await fetch(`/api/documents/${docId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });
    } catch (err) {
      console.error("Failed to update title:", err);
    }
  }

  async function handleIconChange(newIcon: string) {
    setIcon(newIcon);
    try {
      await fetch(`/api/documents/${docId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ icon: newIcon }),
      });
    } catch (err) {
      console.error("Failed to update icon:", err);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this document?")) return;
    try {
      await fetch(`/api/documents/${docId}`, { method: "DELETE" });
      router.push(`/${workspaceSlug}`);
    } catch (err) {
      console.error("Failed to delete document:", err);
    }
  }

  if (loading || !document || !user) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
          Loading collaborative document...
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-[#0b0f19]">
      {/* Document Top Bar */}
      <header className="flex h-14 items-center justify-between border-b border-slate-800/80 bg-[#090d16] px-6">
        <div className="flex items-center gap-3 min-w-0">
          {/* Icon Selector */}
          <button
            onClick={() => {
              const emojis = ["📄", "⚡", "🎯", "🚀", "💡", "🛠️", "📊", "🧠"];
              const next = emojis[(emojis.indexOf(icon) + 1) % emojis.length];
              handleIconChange(next);
            }}
            title="Click to change icon"
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-800 text-lg transition"
          >
            {icon}
          </button>

          {/* Editable Document Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            disabled={userRole === "VIEWER"}
            placeholder="Untitled Document"
            className="bg-transparent text-base font-semibold text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 rounded px-1.5 py-0.5 max-w-sm truncate"
          />

          {/* Sync Status Badge */}
          <div
            className={`hidden sm:flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${
              syncStatus === "connected"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : syncStatus === "connecting"
                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                : "bg-red-500/10 text-red-400 border border-red-500/20"
            }`}
          >
            {syncStatus === "connected" ? (
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            ) : syncStatus === "connecting" ? (
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            ) : (
              <WifiOff className="h-3 w-3" />
            )}
            <span className="capitalize">{syncStatus === "connected" ? "Live Sync" : syncStatus}</span>
          </div>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-3">
          {/* Live Online Collaborators */}
          <LiveAvatars users={presenceUsers} currentUserId={user.id} />

          <div className="h-4 w-[1px] bg-slate-800" />

          {/* Comments Button */}
          <button
            onClick={() => setIsCommentsOpen(!isCommentsOpen)}
            className="relative flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/60 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
          >
            <MessageSquare className="h-3.5 w-3.5 text-blue-400" />
            <span>Comments</span>
            {comments.length > 0 && (
              <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">
                {comments.length}
              </span>
            )}
          </button>

          {/* Version History Button */}
          <button
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/60 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
          >
            <History className="h-3.5 w-3.5 text-emerald-400" />
            <span>History</span>
          </button>

          {/* Share Button */}
          <button
            onClick={() => setIsShareOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-500 transition"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Share</span>
          </button>

          {/* Delete Document Button */}
          {userRole === "OWNER" && (
            <button
              onClick={handleDelete}
              title="Delete document"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </header>

      {/* Main Canvas & Collaborative TipTap Editor */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl py-6">
          <CollaborativeEditor
            docId={docId}
            user={user}
            userRole={userRole}
            onPresenceChange={setPresenceUsers}
            onSyncStatusChange={setSyncStatus}
          />
        </div>
      </div>

      {/* Drawers & Modals */}
      <CommentsDrawer
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
        docId={docId}
        comments={comments}
        onCommentAdded={(newComment) => setComments((prev) => [newComment, ...prev])}
        onCommentUpdated={(commentId, resolved) =>
          setComments((prev) =>
            prev.map((c) => (c.id === commentId ? { ...c, resolved } : c))
          )
        }
        currentUserId={user.id}
      />

      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        docId={docId}
        snapshots={snapshots}
        onSnapshotCreated={(newSnap) => setSnapshots((prev) => [newSnap, ...prev])}
      />

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        docTitle={title}
      />
    </div>
  );
}
