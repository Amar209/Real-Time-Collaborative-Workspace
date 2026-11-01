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
    <div className="fixed inset-y-0 right-0 z-30 flex w-84 flex-col border-l border-slate-200/80 bg-white/95 backdrop-blur-xl shadow-apple-lg">
      <div className="flex items-center justify-between border-b border-slate-200/80 p-4">
        <div className="flex items-center gap-2 text-sm font-bold tracking-tight text-slate-900">
          <MessageSquare className="h-4 w-4 text-emerald-600" />
          Comments & Threads
        </div>
        <button
          onClick={onClose}
          className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {comments.length === 0 ? (
          <p className="text-center text-xs text-slate-400 py-12 italic">
            No comments yet. Start a discussion!
          </p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className={`rounded-2xl border p-4 transition ${
                comment.resolved
                  ? "border-slate-100 bg-slate-50/60 opacity-60"
                  : "border-slate-200/70 bg-white shadow-apple"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-sm"
                    style={{ backgroundColor: comment.author.avatarColor || "#10b981" }}
                  >
                    {comment.author.name.charAt(0)}
                  </div>
                  <span className="text-xs font-bold text-slate-900 tracking-tight">
                    {comment.author.name}
                  </span>
                </div>
                <button
                  onClick={() => toggleResolve(comment.id, comment.resolved)}
                  title={comment.resolved ? "Reopen comment" : "Mark as resolved"}
                  className="rounded-full p-1 text-slate-400 hover:text-emerald-600 transition"
                >
                  <CheckCircle2
                    className={`h-4 w-4 ${comment.resolved ? "text-emerald-500" : ""}`}
                  />
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-700 leading-relaxed font-normal">
                {comment.content}
              </p>
              <span className="mt-2 block text-[10px] text-slate-400 font-medium">
                {new Date(comment.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleAddComment} className="border-t border-slate-200/80 p-3.5 bg-slate-50/50">
        <div className="relative">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full rounded-full border border-slate-200 bg-white py-2 pl-4 pr-10 text-xs text-slate-900 placeholder-slate-400 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="absolute right-1.5 top-1.5 rounded-full bg-emerald-600 p-1.5 text-white transition hover:bg-emerald-500 disabled:opacity-40 shadow-mint"
          >
            <Send className="h-3 w-3" />
          </button>
        </div>
      </form>
    </div>
  );
}
