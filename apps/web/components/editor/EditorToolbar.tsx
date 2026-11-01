"use client";

import { type Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Undo,
  Redo,
  Table as TableIcon,
} from "lucide-react";

interface EditorToolbarProps {
  editor: Editor | null;
  readOnly?: boolean;
}

export default function EditorToolbar({ editor, readOnly }: EditorToolbarProps) {
  if (!editor || readOnly) return null;

  return (
    <div className="sticky top-0 z-20 flex flex-wrap items-center gap-1 border-b border-slate-800 bg-[#0d121f]/90 px-4 py-2 backdrop-blur-md">
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`rounded p-1.5 transition ${
          editor.isActive("heading", { level: 1 })
            ? "bg-blue-600 text-white"
            : "text-slate-400 hover:bg-slate-800 hover:text-white"
        }`}
        title="Heading 1"
      >
        <Heading1 className="h-4 w-4" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`rounded p-1.5 transition ${
          editor.isActive("heading", { level: 2 })
            ? "bg-blue-600 text-white"
            : "text-slate-400 hover:bg-slate-800 hover:text-white"
        }`}
        title="Heading 2"
      >
        <Heading2 className="h-4 w-4" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`rounded p-1.5 transition ${
          editor.isActive("heading", { level: 3 })
            ? "bg-blue-600 text-white"
            : "text-slate-400 hover:bg-slate-800 hover:text-white"
        }`}
        title="Heading 3"
      >
        <Heading3 className="h-4 w-4" />
      </button>

      <div className="h-4 w-[1px] bg-slate-800 mx-1" />

      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`rounded p-1.5 transition ${
          editor.isActive("bold")
            ? "bg-blue-600 text-white"
            : "text-slate-400 hover:bg-slate-800 hover:text-white"
        }`}
        title="Bold"
      >
        <Bold className="h-4 w-4" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`rounded p-1.5 transition ${
          editor.isActive("italic")
            ? "bg-blue-600 text-white"
            : "text-slate-400 hover:bg-slate-800 hover:text-white"
        }`}
        title="Italic"
      >
        <Italic className="h-4 w-4" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`rounded p-1.5 transition ${
          editor.isActive("strike")
            ? "bg-blue-600 text-white"
            : "text-slate-400 hover:bg-slate-800 hover:text-white"
        }`}
        title="Strikethrough"
      >
        <Strikethrough className="h-4 w-4" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={`rounded p-1.5 transition ${
          editor.isActive("code")
            ? "bg-blue-600 text-white"
            : "text-slate-400 hover:bg-slate-800 hover:text-white"
        }`}
        title="Inline Code"
      >
        <Code className="h-4 w-4" />
      </button>

      <div className="h-4 w-[1px] bg-slate-800 mx-1" />

      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`rounded p-1.5 transition ${
          editor.isActive("bulletList")
            ? "bg-blue-600 text-white"
            : "text-slate-400 hover:bg-slate-800 hover:text-white"
        }`}
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`rounded p-1.5 transition ${
          editor.isActive("orderedList")
            ? "bg-blue-600 text-white"
            : "text-slate-400 hover:bg-slate-800 hover:text-white"
        }`}
        title="Numbered List"
      >
        <ListOrdered className="h-4 w-4" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        className={`rounded p-1.5 transition ${
          editor.isActive("taskList")
            ? "bg-blue-600 text-white"
            : "text-slate-400 hover:bg-slate-800 hover:text-white"
        }`}
        title="Task Checkbox List"
      >
        <CheckSquare className="h-4 w-4" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`rounded p-1.5 transition ${
          editor.isActive("blockquote")
            ? "bg-blue-600 text-white"
            : "text-slate-400 hover:bg-slate-800 hover:text-white"
        }`}
        title="Blockquote"
      >
        <Quote className="h-4 w-4" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`rounded p-1.5 transition ${
          editor.isActive("codeBlock")
            ? "bg-blue-600 text-white"
            : "text-slate-400 hover:bg-slate-800 hover:text-white"
        }`}
        title="Code Block"
      >
        <Code className="h-4 w-4 text-emerald-400" />
      </button>

      <div className="h-4 w-[1px] bg-slate-800 mx-1" />

      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-30 transition"
        title="Undo (Ctrl+Z)"
      >
        <Undo className="h-4 w-4" />
      </button>

      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-30 transition"
        title="Redo (Ctrl+Y)"
      >
        <Redo className="h-4 w-4" />
      </button>
    </div>
  );
}
