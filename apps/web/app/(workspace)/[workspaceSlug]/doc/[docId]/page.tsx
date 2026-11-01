"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  MessageSquare,
  History,
  Share2,
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
      <div className="flex h-full items-center justify-center bg-white">
        <div className="flex items-center gap-2.5 text-sm text-slate-500 font-medium">
          <RefreshCw className="h-4 w-4 animate-spin text-emerald-500" />
          Loading document...
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Document Top Bar */}
      <header className="flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/80 px-8 backdrop-blur-md">
        <div className="flex items-center gap-3.5 min-w-0">
          {/* Icon Selector */}
          <button
            onClick={() => {
              const emojis = ["📄", "⚡", "🎯", "🚀", "💡", "🛠️", "📊", "🧠"];
              const next = emojis[(emojis.indexOf(icon) + 1) % emojis.length];
              handleIconChange(next);
            }}
            title="Click to change icon"
            className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-slate-100 text-xl transition"
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
            className="bg-transparent text-lg font-bold tracking-tight text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 rounded-lg px-2 py-0.5 max-w-md truncate"
          />

          {/* Apple-style Sync Status Pill */}
          <div
            className={`hidden sm:flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-tight ${
              syncStatus === "connected"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80"
                : syncStatus === "connecting"
                ? "bg-amber-50 text-amber-700 border border-amber-200/80"
                : "bg-red-50 text-red-700 border border-red-200/80"
            }`}
          >
            {syncStatus === "connected" ? (
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            ) : syncStatus === "connecting" ? (
              <span className="h-2 w-2 rounded-full bg-amber-500" />
            ) : (
              <WifiOff className="h-3 w-3" />
            )}
            <span>{syncStatus === "connected" ? "Live Sync" : syncStatus}</span>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-3">
          {/* Live Online Collaborators */}
          <LiveAvatars users={presenceUsers} currentUserId={user.id} />

          <div className="h-4 w-[1px] bg-slate-200 mx-1" />

          {/* Comments Pill Button */}
          <button
            onClick={() => setIsCommentsOpen(!isCommentsOpen)}
            className="relative flex items-center gap-2 rounded-full border border-slate-200/80 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-apple transition"
          >
            <MessageSquare className="h-3.5 w-3.5 text-slate-500" />
            <span>Comments</span>
            {comments.length > 0 && (
              <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold text-white">
                {comments.length}
              </span>
            )}
          </button>

          {/* Version History Pill Button */}
          <button
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-apple transition"
          >
            <History className="h-3.5 w-3.5 text-slate-500" />
            <span>History</span>
          </button>

          {/* Share Button (Mint/Emerald Gradient Pill from Reference Image) */}
          <button
            onClick={() => setIsShareOpen(true)}
            className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-mint hover:opacity-95 transition"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Share</span>
          </button>

          {/* Delete Button */}
          {userRole === "OWNER" && (
            <button
              onClick={handleDelete}
              title="Delete document"
              className="rounded-full p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 transition"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </header>

      {/* Main Canvas & Collaborative TipTap Editor */}
      <div className="flex-1 overflow-y-auto bg-[#fbfbfd]">
        <div className="mx-auto max-w-4xl py-8 px-4">
          <div className="rounded-2xl border border-slate-200/70 bg-white shadow-apple-lg overflow-hidden">
            <CollaborativeEditor
              docId={docId}
              user={user}
              userRole={userRole}
              onPresenceChange={setPresenceUsers}
              onSyncStatusChange={setSyncStatus}
            />
          </div>
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
