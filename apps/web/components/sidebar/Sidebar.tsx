"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Plus,
  FileText,
  ChevronDown,
  ChevronRight,
  LogOut,
  Sparkles,
  Layers,
  Settings,
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

  // Group top-level and nested documents
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
            style={{ paddingLeft: `${level * 16 + 12}px` }}
            className={`flex items-center justify-between rounded-lg py-1.5 pr-2 text-sm transition ${
              isActive
                ? "bg-slate-800/90 font-medium text-white shadow-sm"
                : "text-slate-300 hover:bg-slate-800/40 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              {hasChildren ? (
                <button
                  onClick={(e) => toggleCollapse(doc.id, e)}
                  className="rounded p-0.5 text-slate-400 hover:bg-slate-700 hover:text-white"
                >
                  {isCollapsed ? (
                    <ChevronRight className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                </button>
              ) : (
                <span className="w-3.5 text-xs text-slate-500">•</span>
              )}
              <span className="text-base leading-none">{doc.icon || "📄"}</span>
              <span className="truncate">{doc.title || "Untitled"}</span>
            </div>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleCreateDoc(doc.id);
              }}
              title="Add subpage"
              className="opacity-0 group-hover:opacity-100 rounded p-1 text-slate-400 hover:bg-slate-700 hover:text-white transition"
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
    <aside className="flex h-screen w-64 flex-col border-r border-slate-800/80 bg-[#090d16] text-slate-200 select-none">
      {/* Workspace Switcher Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 p-3.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 font-bold text-white shadow-md shadow-blue-500/20">
            <Layers className="h-4 w-4" />
          </div>
          <div className="truncate">
            <p className="text-sm font-semibold truncate text-white">{workspace.name}</p>
            <p className="text-[11px] text-slate-400">Collaborative Workspace</p>
          </div>
        </div>
      </div>

      {/* Action Navigation */}
      <div className="p-3">
        <button
          onClick={() => handleCreateDoc()}
          disabled={creating}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-700/80 bg-slate-900/40 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-blue-500 hover:bg-slate-800/50 hover:text-white"
        >
          <Plus className="h-4 w-4 text-blue-400" />
          {creating ? "Creating..." : "New Document"}
        </button>
      </div>

      {/* Document Tree */}
      <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
        <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Documents
        </div>
        {documents.length === 0 ? (
          <p className="px-3 py-4 text-xs text-slate-400 italic">No documents yet. Create one!</p>
        ) : (
          renderTree(rootDocs)
        )}
      </div>

      {/* User Footer Profile & Logout */}
      <div className="border-t border-slate-800/80 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white shadow"
              style={{ backgroundColor: user.avatarColor }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="truncate">
              <p className="text-xs font-medium text-white truncate">{user.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-red-400 transition"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
