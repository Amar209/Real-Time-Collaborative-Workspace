"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, FileText, ArrowRight, X } from "lucide-react";

interface DocItem {
  id: string;
  title: string;
  updatedAt: string;
}

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceSlug: string;
}

export default function QuickSearchModal({
  isOpen,
  onClose,
  workspaceSlug,
}: QuickSearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [documents, setDocuments] = useState<DocItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      return;
    }

    async function fetchDocs() {
      setLoading(true);
      try {
        const res = await fetch(`/api/documents?workspaceSlug=${workspaceSlug}`);
        if (res.ok) {
          const data = await res.json();
          setDocuments(data.documents || []);
        }
      } catch (err) {
        console.error("Failed to fetch documents for search:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDocs();
  }, [isOpen, workspaceSlug]);

  const filtered = documents.filter((doc) =>
    (doc.title || "Untitled").toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation inside search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isOpen) return;

      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : prev));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === "Enter" && filtered[selectedIndex]) {
        e.preventDefault();
        router.push(`/${workspaceSlug}/doc/${filtered[selectedIndex].id}`);
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filtered, selectedIndex, router, workspaceSlug, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/25 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        {/* Search Input Bar */}
        <div className="flex items-center border-b border-slate-100 px-4 py-3">
          <Search className="h-4 w-4 text-slate-400 mr-3 flex-shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documents or jump to page..."
            className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="rounded p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <span className="ml-2 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-mono text-slate-400">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-72 overflow-y-auto p-2">
          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading documents...</div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No matching pages found for &quot;{query}&quot;
            </div>
          ) : (
            filtered.map((doc, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={doc.id}
                  onClick={() => {
                    router.push(`/${workspaceSlug}/doc/${doc.id}`);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs transition-colors cursor-pointer ${
                    isSelected ? "bg-slate-100 text-slate-900" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    <span className="font-medium truncate">{doc.title || "Untitled Document"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span>{new Date(doc.updatedAt).toLocaleDateString()}</span>
                    {isSelected && <ArrowRight className="h-3 w-3 text-slate-600" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-4 py-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Open</span>
            <span>ESC Close</span>
          </div>
          <span>{filtered.length} {filtered.length === 1 ? "page" : "pages"}</span>
        </div>
      </div>
    </div>
  );
}
