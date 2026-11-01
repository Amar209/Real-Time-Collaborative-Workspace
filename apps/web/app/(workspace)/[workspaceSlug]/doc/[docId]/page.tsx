"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  MessageSquare,
  History,
  Share2,
  RefreshCw,
  Trash2,
  Check,
} from "lucide-react";
import CollaborativeEditor from "@/components/editor/Editor";
import LiveAvatars, { PresenceUser } from "@/components/presence/LiveAvatars";
import CommentsDrawer, { CommentItem } from "@/components/comments/CommentsDrawer";
import HistoryDrawer, { SnapshotItem } from "@/components/history/HistoryDrawer";
import ShareModal from "@/components/permissions/ShareModal";

interface DocData {
  id: string;
  title: string;
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
      setUser(data.user);
      setUserRole(data.userRole || "EDITOR");
      setComments(data.document.comments || []);
      setSnapshots(data.snapshots || data.document.snapshots || []);
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
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <RefreshCw className="h-4 w-4 animate-spin text-slate-400" />
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Clean, professional Top Navigation Bar */}
      <header className="flex h-12 items-center justify-between border-b border-slate-200/80 bg-white px-6">
        <div className="flex items-center min-w-0 flex-1">
          {/* Clean, Prominent Document Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            disabled={userRole === "VIEWER"}
            placeholder="Untitled"
            className="bg-transparent text-sm font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-300 rounded px-1.5 py-0.5 w-full max-w-md truncate"
          />
        </div>

        {/* Right Action Controls - Understated & Professional */}
        <div className="flex items-center gap-3">
          {/* Subtle Saved / Sync Status indicator */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-normal">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                syncStatus === "connected"
                  ? "bg-emerald-500"
                  : syncStatus === "connecting"
                  ? "bg-amber-400 animate-pulse"
                  : "bg-slate-300"
              }`}
            />
            <span>{syncStatus === "connected" ? "Saved" : syncStatus}</span>
          </div>

          <div className="h-3.5 w-[1px] bg-slate-200 mx-0.5" />

          {/* Active Collaborators */}
          <LiveAvatars users={presenceUsers} currentUserId={user.id} />

          <div className="h-3.5 w-[1px] bg-slate-200 mx-0.5" />

          {/* Comments Button */}
          <button
            onClick={() => {
              setIsCommentsOpen((prev) => !prev);
              setIsHistoryOpen(false);
              setIsShareOpen(false);
            }}
            className="relative flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
          >
            <MessageSquare className="h-3.5 w-3.5 text-slate-400" />
            <span>Comments</span>
            {comments.length > 0 && (
              <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-slate-100 px-1 text-[10px] font-semibold text-slate-600 border border-slate-200">
                {comments.length}
              </span>
            )}
          </button>

          {/* History Button */}
          <button
            onClick={() => {
              setIsHistoryOpen((prev) => !prev);
              setIsCommentsOpen(false);
              setIsShareOpen(false);
            }}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
          >
            <History className="h-3.5 w-3.5 text-slate-400" />
            <span>History</span>
          </button>

          {/* Share Button - Professional Dark Button */}
          <button
            onClick={() => {
              setIsShareOpen(true);
              setIsCommentsOpen(false);
              setIsHistoryOpen(false);
            }}
            className="flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 transition"
          >
            <Share2 className="h-3 w-3" />
            <span>Share</span>
          </button>

          {/* Delete Document */}
          {userRole === "OWNER" && (
            <button
              onClick={handleDelete}
              title="Delete page"
              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-600 transition"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </header>

      {/* Main Document Canvas - Full natural workspace */}
      <div className="flex-1 overflow-y-auto bg-white">
        <div className="mx-auto max-w-3xl py-10 px-8">
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
        docId={docId}
        docTitle={title}
      />
    </div>
  );
}
