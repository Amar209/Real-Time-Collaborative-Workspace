"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Plus,
  ChevronDown,
  ChevronRight,
  LogOut,
  FileText,
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
          title: "Untitled",
          icon: null,
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
            style={{ paddingLeft: `${level * 12 + 10}px` }}
            className={`flex items-center justify-between rounded-md py-1.5 pr-2 text-sm transition-colors ${
              isActive
                ? "bg-slate-200/70 text-slate-900 font-medium"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
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
                <span className="w-3.5" />
              )}
              <FileText className={`h-4 w-4 flex-shrink-0 ${isActive ? "text-slate-800" : "text-slate-400"}`} />
              <span className="truncate">{doc.title || "Untitled"}</span>
            </div>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleCreateDoc(doc.id);
              }}
              title="Add subpage"
              className="opacity-0 group-hover:opacity-100 rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
            >
              <Plus className="h-3 w-3" />
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
    <aside className="flex h-screen w-60 flex-col border-r border-slate-200 bg-[#f9fafb] text-slate-800 select-none">
      {/* Workspace Header - Clean, professional, no flashy gradient logos */}
      <div className="flex items-center justify-between border-b border-slate-200/80 px-4 py-3.5">
        <div className="min-w-0">
          <p className="text-sm font-semibold tracking-tight text-slate-900 truncate">
            {workspace.name}
          </p>
          <p className="text-[11px] text-slate-500 font-normal">Workspace</p>
        </div>
      </div>

      {/* Action Navigation - Subtle & clean */}
      <div className="px-2 pt-2 pb-1">
        <button
          onClick={() => handleCreateDoc()}
          disabled={creating}
          className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
        >
          <Plus className="h-3.5 w-3.5 text-slate-500" />
          <span>{creating ? "Creating..." : "New page"}</span>
        </button>
      </div>

      {/* Document Tree */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
        <div className="px-2.5 py-1 text-[11px] font-medium tracking-wider uppercase text-slate-400">
          Pages
        </div>
        {documents.length === 0 ? (
          <p className="px-2.5 py-3 text-xs text-slate-400 italic">No pages yet</p>
        ) : (
          renderTree(rootDocs)
        )}
      </div>

      {/* User Footer Profile & Logout */}
      <div className="border-t border-slate-200 px-3 py-2.5 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-white flex-shrink-0"
              style={{ backgroundColor: user.avatarColor }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="truncate">
              <p className="text-xs font-medium text-slate-900 truncate">{user.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
