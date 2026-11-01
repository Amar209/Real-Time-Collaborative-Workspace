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
} from "lucide-react";

interface EditorToolbarProps {
  editor: Editor | null;
  readOnly?: boolean;
}

export default function EditorToolbar({ editor, readOnly }: EditorToolbarProps) {
  if (!editor || readOnly) return null;

  return (
    <div className="sticky top-0 z-20 flex flex-wrap items-center gap-1 border-b border-slate-200/80 bg-white/90 px-6 py-2.5 backdrop-blur-md">
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`rounded-lg p-1.5 transition ${
          editor.isActive("heading", { level: 1 })
            ? "bg-slate-900 text-white shadow-sm"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        }`}
        title="Heading 1"
      >
        <Heading1 className="h-4 w-4" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`rounded-lg p-1.5 transition ${
          editor.isActive("heading", { level: 2 })
            ? "bg-slate-900 text-white shadow-sm"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        }`}
        title="Heading 2"
      >
        <Heading2 className="h-4 w-4" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`rounded-lg p-1.5 transition ${
          editor.isActive("heading", { level: 3 })
            ? "bg-slate-900 text-white shadow-sm"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        }`}
        title="Heading 3"
      >
        <Heading3 className="h-4 w-4" />
      </button>

      <div className="h-4 w-[1px] bg-slate-200 mx-1.5" />

      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`rounded-lg p-1.5 transition ${
          editor.isActive("bold")
            ? "bg-slate-900 text-white shadow-sm"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        }`}
        title="Bold"
      >
        <Bold className="h-4 w-4" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`rounded-lg p-1.5 transition ${
          editor.isActive("italic")
            ? "bg-slate-900 text-white shadow-sm"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        }`}
        title="Italic"
      >
        <Italic className="h-4 w-4" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`rounded-lg p-1.5 transition ${
          editor.isActive("strike")
            ? "bg-slate-900 text-white shadow-sm"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        }`}
        title="Strikethrough"
      >
        <Strikethrough className="h-4 w-4" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={`rounded-lg p-1.5 transition ${
          editor.isActive("code")
            ? "bg-slate-900 text-white shadow-sm"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        }`}
        title="Inline Code"
      >
        <Code className="h-4 w-4" />
      </button>

      <div className="h-4 w-[1px] bg-slate-200 mx-1.5" />

      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`rounded-lg p-1.5 transition ${
          editor.isActive("bulletList")
            ? "bg-slate-900 text-white shadow-sm"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        }`}
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`rounded-lg p-1.5 transition ${
          editor.isActive("orderedList")
            ? "bg-slate-900 text-white shadow-sm"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        }`}
        title="Numbered List"
      >
        <ListOrdered className="h-4 w-4" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        className={`rounded-lg p-1.5 transition ${
          editor.isActive("taskList")
            ? "bg-emerald-600 text-white shadow-mint"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        }`}
        title="Task Checkbox List"
      >
        <CheckSquare className="h-4 w-4" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`rounded-lg p-1.5 transition ${
          editor.isActive("blockquote")
            ? "bg-slate-900 text-white shadow-sm"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        }`}
        title="Blockquote"
      >
        <Quote className="h-4 w-4" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`rounded-lg p-1.5 transition ${
          editor.isActive("codeBlock")
            ? "bg-slate-900 text-white shadow-sm"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        }`}
        title="Code Block"
      >
        <Code className="h-4 w-4 text-emerald-600" />
      </button>

      <div className="h-4 w-[1px] bg-slate-200 mx-1.5" />

      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 transition"
        title="Undo (Ctrl+Z)"
      >
        <Undo className="h-4 w-4" />
      </button>

      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 transition"
        title="Redo (Ctrl+Y)"
      >
        <Redo className="h-4 w-4" />
      </button>
    </div>
  );
}
