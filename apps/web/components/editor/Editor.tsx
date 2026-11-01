"use client";

import { useEffect, useState, useMemo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import EditorToolbar from "./EditorToolbar";
import { PresenceUser } from "../presence/LiveAvatars";

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
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
