"use client";

import { useEffect, useState, useMemo } from "react";
import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import CharacterCount from "@tiptap/extension-character-count";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import EditorToolbar from "./EditorToolbar";
import { PresenceUser } from "../presence/LiveAvatars";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading2,
  Quote,
  Sparkles,
} from "lucide-react";

interface CollaborativeEditorProps {
  docId: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatarColor: string;
  };
  userRole: string; // OWNER, EDITOR, COMMENTER, VIEWER
  onPresenceChange?: (users: PresenceUser[]) => void;
  onSyncStatusChange?: (status: "connected" | "connecting" | "disconnected") => void;
}

export default function CollaborativeEditor({
  docId,
  user,
  userRole,
  onPresenceChange,
  onSyncStatusChange,
}: CollaborativeEditorProps) {
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);
  const isReadOnly = userRole === "VIEWER";

  // Persistent Yjs Document
  const ydoc = useMemo(() => new Y.Doc(), [docId]);

  useEffect(() => {
    let wsUrl = process.env.NEXT_PUBLIC_WS_URL;
    if (!wsUrl) {
      if (typeof window !== "undefined") {
        const isSecure = window.location.protocol === "https:";
        const wsProtocol = isSecure ? "wss:" : "ws:";
        if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
          wsUrl = "ws://localhost:1234";
        } else {
          wsUrl = `${wsProtocol}//${window.location.hostname}:1234`;
        }
      } else {
        wsUrl = "ws://localhost:1234";
      }
    }
    const wsProvider = new WebsocketProvider(wsUrl, `doc-${docId}`, ydoc);

    // Set user awareness state for cursors & active user presence
    wsProvider.awareness.setLocalStateField("user", {
      name: user.name,
      color: user.avatarColor,
      email: user.email,
    });

    const updatePresence = () => {
      const states = wsProvider.awareness.getStates();
      const activeList: PresenceUser[] = [];
      states.forEach((state, clientId) => {
        if (state.user) {
          activeList.push({
            clientId,
            name: state.user.name,
            color: state.user.color,
            email: state.user.email,
          });
        }
      });
      if (onPresenceChange) onPresenceChange(activeList);
    };

    wsProvider.awareness.on("change", updatePresence);
    updatePresence();

    wsProvider.on("status", (event: { status: "connected" | "connecting" | "disconnected" }) => {
      if (onSyncStatusChange) onSyncStatusChange(event.status);
    });

    setProvider(wsProvider);

    return () => {
      wsProvider.awareness.off("change", updatePresence);
      wsProvider.destroy();
      ydoc.destroy();
    };
  }, [docId, user, ydoc, onPresenceChange, onSyncStatusChange]);

  const editor = useEditor(
    {
      editable: !isReadOnly,
      extensions: [
        StarterKit.configure({
          history: false, // CRDT Yjs handles undo/redo natively
        }),
        Placeholder.configure({
          placeholder: isReadOnly
            ? "You have view-only access to this document."
            : "Write something, press '/' for commands, or collaborate in real-time...",
        }),
        TaskList,
        TaskItem.configure({
          nested: true,
        }),
        Table.configure({
          resizable: true,
        }),
        TableRow,
        TableHeader,
        TableCell,
        CharacterCount,
        Collaboration.configure({
          document: ydoc,
        }),
        ...(provider
          ? [
              CollaborationCursor.configure({
                provider,
                user: {
                  name: user.name,
                  color: user.avatarColor,
                },
              }),
            ]
          : []),
      ],
      editorProps: {
        attributes: {
          class:
            "prose max-w-none focus:outline-none min-h-[500px] text-slate-800 text-base leading-relaxed py-4",
        },
      },
    },
    [provider, isReadOnly]
  );

  return (
    <div className="flex flex-col flex-1 relative">
      <EditorToolbar editor={editor} readOnly={isReadOnly} />

      {editor && !isReadOnly && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 100 }}
          className="flex items-center gap-0.5 rounded-lg border border-slate-200/80 bg-white/95 px-1 py-1 shadow-lg backdrop-blur-md"
        >
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`rounded p-1 text-xs transition ${
              editor.isActive("bold") ? "bg-slate-100 text-slate-900 font-semibold" : "text-slate-600 hover:bg-slate-50"
            }`}
            title="Bold"
          >
            <Bold className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`rounded p-1 text-xs transition ${
              editor.isActive("italic") ? "bg-slate-100 text-slate-900 font-semibold" : "text-slate-600 hover:bg-slate-50"
            }`}
            title="Italic"
          >
            <Italic className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`rounded p-1 text-xs transition ${
              editor.isActive("strike") ? "bg-slate-100 text-slate-900 font-semibold" : "text-slate-600 hover:bg-slate-50"
            }`}
            title="Strikethrough"
          >
            <Strikethrough className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`rounded p-1 text-xs transition ${
              editor.isActive("code") ? "bg-slate-100 text-slate-900 font-semibold" : "text-slate-600 hover:bg-slate-50"
            }`}
            title="Inline Code"
          >
            <Code className="h-3.5 w-3.5" />
          </button>
          <div className="h-3 w-[1px] bg-slate-200 mx-0.5" />
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`rounded p-1 text-xs transition ${
              editor.isActive("heading", { level: 2 }) ? "bg-slate-100 text-slate-900 font-semibold" : "text-slate-600 hover:bg-slate-50"
            }`}
            title="Heading 2"
          >
            <Heading2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`rounded p-1 text-xs transition ${
              editor.isActive("blockquote") ? "bg-slate-100 text-slate-900 font-semibold" : "text-slate-600 hover:bg-slate-50"
            }`}
            title="Quote"
          >
            <Quote className="h-3.5 w-3.5" />
          </button>
        </BubbleMenu>
      )}

      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>

      {/* Document Stats & Metadata Footer */}
      {editor && (
        <div className="flex items-center justify-between border-t border-slate-100 px-8 py-2 text-[11px] text-slate-400 select-none">
          <div className="flex items-center gap-3">
            <span>
              {editor.storage.characterCount.words()} {editor.storage.characterCount.words() === 1 ? "word" : "words"}
            </span>
            <span>•</span>
            <span>
              {editor.storage.characterCount.characters()} characters
            </span>
            <span>•</span>
            <span>
              ~{Math.max(1, Math.ceil(editor.storage.characterCount.words() / 200))} min read
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Sparkles className="h-3 w-3 text-emerald-500" />
            <span>CRDT Multi-Instance Synchronized</span>
          </div>
        </div>
      )}
    </div>
  );
}
