"use client";

import { useState } from "react";
import { MessageSquare, X, Send, CheckCircle2 } from "lucide-react";

export interface CommentItem {
  id: string;
  content: string;
  resolved: boolean;
  createdAt: string;
  author: {
    id: string;
    name: string;
    avatarColor: string;
  };
}

interface CommentsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  docId: string;
  comments: CommentItem[];
  onCommentAdded: (comment: CommentItem) => void;
  onCommentUpdated: (commentId: string, resolved: boolean) => void;
  currentUserId: string;
}

export default function CommentsDrawer({
  isOpen,
  onClose,
  docId,
  comments,
  onCommentAdded,
  onCommentUpdated,
}: CommentsDrawerProps) {
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/documents/${docId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });
      const data = await res.json();
      if (data.comment) {
        onCommentAdded(data.comment);
        setNewComment("");
      }
    } catch (err) {
      console.error("Failed to add comment:", err);
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleResolve(commentId: string, currentStatus: boolean) {
    try {
      await fetch(`/api/documents/${docId}/comments`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId, resolved: !currentStatus }),
      });
      onCommentUpdated(commentId, !currentStatus);
    } catch (err) {
      console.error("Failed to update comment:", err);
    }
  }

  return (
    <div className="fixed inset-y-0 right-0 z-30 flex w-80 flex-col border-l border-slate-200 bg-white shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <MessageSquare className="h-4 w-4 text-slate-500" />
          Comments
        </div>
        <button
          onClick={onClose}
          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {comments.length === 0 ? (
          <p className="text-center text-xs text-slate-400 py-12 italic">
            No comments yet.
          </p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className={`rounded-lg border p-3 transition ${
                comment.resolved
                  ? "border-slate-100 bg-slate-50 opacity-60"
                  : "border-slate-200/80 bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                    style={{ backgroundColor: comment.author.avatarColor || "#0f172a" }}
                  >
                    {comment.author.name.charAt(0)}
                  </div>
                  <span className="text-xs font-semibold text-slate-900">
                    {comment.author.name}
                  </span>
                </div>
                <button
                  onClick={() => toggleResolve(comment.id, comment.resolved)}
                  title={comment.resolved ? "Reopen comment" : "Mark as resolved"}
                  className="rounded p-1 text-slate-400 hover:text-slate-800 transition"
                >
                  <CheckCircle2
                    className={`h-3.5 w-3.5 ${comment.resolved ? "text-emerald-500" : ""}`}
                  />
                </button>
              </div>
              <p className="mt-1.5 text-xs text-slate-700 leading-relaxed">
                {comment.content}
              </p>
              <span className="mt-1.5 block text-[10px] text-slate-400">
                {new Date(comment.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleAddComment} className="border-t border-slate-200 p-3 bg-slate-50/50">
        <div className="relative">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full rounded-md border border-slate-200 bg-white py-1.5 pl-3 pr-9 text-xs text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="absolute right-1.5 top-1.5 rounded p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 transition"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}
