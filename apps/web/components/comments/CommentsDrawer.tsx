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
    <div className="fixed inset-y-0 right-0 z-30 flex w-80 flex-col border-l border-slate-800 bg-[#090d16] shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-800 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <MessageSquare className="h-4 w-4 text-blue-400" />
          Comments & Threads
        </div>
        <button
          onClick={onClose}
          className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {comments.length === 0 ? (
          <p className="text-center text-xs text-slate-500 py-8 italic">
            No comments yet. Start a discussion!
          </p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className={`rounded-xl border p-3.5 transition ${
                comment.resolved
                  ? "border-slate-800/40 bg-slate-900/20 opacity-60"
                  : "border-slate-800 bg-slate-900/60 shadow"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white"
                    style={{ backgroundColor: comment.author.avatarColor || "#3b82f6" }}
                  >
                    {comment.author.name.charAt(0)}
                  </div>
                  <span className="text-xs font-semibold text-white">
                    {comment.author.name}
                  </span>
                </div>
                <button
                  onClick={() => toggleResolve(comment.id, comment.resolved)}
                  title={comment.resolved ? "Reopen comment" : "Mark as resolved"}
                  className="rounded p-1 text-slate-400 hover:text-emerald-400 transition"
                >
                  <CheckCircle2
                    className={`h-4 w-4 ${comment.resolved ? "text-emerald-400" : ""}`}
                  />
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-200 leading-relaxed">
                {comment.content}
              </p>
              <span className="mt-2 block text-[10px] text-slate-500">
                {new Date(comment.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleAddComment} className="border-t border-slate-800 p-3">
        <div className="relative">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full rounded-lg border border-slate-700 bg-slate-800/80 py-2 pl-3 pr-10 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="absolute right-1.5 top-1.5 rounded-md bg-blue-600 p-1 text-white transition hover:bg-blue-500 disabled:opacity-40"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}
