"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Plus,
  ChevronDown,
  ChevronRight,
  LogOut,
  Sparkles,
  Layers,
} from "lucide-react";

interface DocItem {
  id: string;
  title: string;
  icon?: string | null;
  parentDocId?: string | null;
}

interface SidebarProps {
  user: {
    id: string;
    name: string;
    email: string;
    avatarColor: string;
  };
  workspace: {
    id: string;
    name: string;
    slug: string;
  };
  documents: DocItem[];
  onDocumentCreated?: (doc: DocItem) => void;
}

export default function Sidebar({ user, workspace, documents, onDocumentCreated }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});
  const [creating, setCreating] = useState(false);

  async function handleCreateDoc(parentId?: string) {
    setCreating(true);
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: workspace.id,
          parentDocId: parentId || null,
          title: "Untitled Document",
          icon: "📄",
        }),
      });
      const data = await res.json();
      if (data.document) {
        if (onDocumentCreated) onDocumentCreated(data.document);
        router.push(`/${workspace.slug}/doc/${data.document.id}`);
      }
    } catch (err) {
      console.error("Create doc failed:", err);
    } finally {
      setCreating(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/me", { method: "POST" });
    router.push("/login");
  }

  function toggleCollapse(id: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setCollapsedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const rootDocs = documents.filter((d) => !d.parentDocId);
  const childMap = documents.reduce<Record<string, DocItem[]>>((acc, doc) => {
    if (doc.parentDocId) {
      if (!acc[doc.parentDocId]) acc[doc.parentDocId] = [];
      acc[doc.parentDocId].push(doc);
    }
    return acc;
  }, {});

  function renderTree(docs: DocItem[], level = 0) {
    return docs.map((doc) => {
      const children = childMap[doc.id] || [];
      const hasChildren = children.length > 0;
      const isCollapsed = collapsedNodes[doc.id];
      const isActive = pathname.includes(doc.id);

      return (
        <div key={doc.id} className="group">
          <Link
            href={`/${workspace.slug}/doc/${doc.id}`}
            style={{ paddingLeft: `${level * 14 + 10}px` }}
            className={`flex items-center justify-between rounded-xl py-2 pr-2.5 text-sm transition-all duration-150 ${
              isActive
                ? "bg-white text-slate-900 font-semibold shadow-apple border border-slate-200/60"
                : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900"
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              {hasChildren ? (
                <button
                  onClick={(e) => toggleCollapse(doc.id, e)}
                  className="rounded p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                >
                  {isCollapsed ? (
                    <ChevronRight className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                </button>
              ) : (
                <span className={`w-3.5 text-xs ${isActive ? "text-emerald-500 font-bold" : "text-slate-300"}`}>
                  •
                </span>
              )}
              <span className="text-base leading-none">{doc.icon || "📄"}</span>
              <span className="truncate tracking-tight">{doc.title || "Untitled"}</span>
            </div>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleCreateDoc(doc.id);
              }}
              title="Add subpage"
              className="opacity-0 group-hover:opacity-100 rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </Link>

          {hasChildren && !isCollapsed && (
            <div className="mt-0.5">{renderTree(children, level + 1)}</div>
          )}
        </div>
      );
    });
  }

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-[#e5e5ea] bg-[#f5f5f7] text-slate-800 select-none">
      {/* Workspace Header */}
      <div className="flex items-center justify-between border-b border-[#e5e5ea] p-4 bg-white/50 backdrop-blur-sm">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-400 to-teal-500 font-bold text-white shadow-mint">
            <Layers className="h-4 w-4" />
          </div>
          <div className="truncate">
            <p className="text-sm font-bold tracking-tight text-slate-900 truncate">{workspace.name}</p>
            <p className="text-[11px] font-medium text-emerald-600">Active Workspace</p>
          </div>
        </div>
      </div>

      {/* Action Navigation */}
      <div className="p-3">
        <button
          onClick={() => handleCreateDoc()}
          disabled={creating}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-300/80 bg-white px-4 py-2 text-xs font-semibold text-slate-800 shadow-apple transition hover:border-emerald-500 hover:text-emerald-600 hover:shadow-mint"
        >
          <Plus className="h-3.5 w-3.5 text-emerald-500" />
          {creating ? "Creating..." : "New Document"}
        </button>
      </div>

      {/* Document Tree */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        <div className="px-3 py-1.5 text-[11px] font-semibold tracking-wider uppercase text-slate-400">
          Pages
        </div>
        {documents.length === 0 ? (
          <p className="px-3 py-4 text-xs text-slate-400 italic">No documents yet.</p>
        ) : (
          renderTree(rootDocs)
        )}
      </div>

      {/* User Footer Profile & Logout */}
      <div className="border-t border-[#e5e5ea] p-3.5 bg-white/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm"
              style={{ backgroundColor: user.avatarColor }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-900 truncate tracking-tight">{user.name}</p>
              <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="rounded-full p-2 text-slate-400 hover:bg-slate-200/80 hover:text-red-500 transition"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
