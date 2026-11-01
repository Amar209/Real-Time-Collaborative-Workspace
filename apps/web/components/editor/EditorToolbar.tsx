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
  Minus,
  Rows,
  Columns,
  Trash,
} from "lucide-react";

interface EditorToolbarProps {
  editor: Editor | null;
  readOnly?: boolean;
}

export default function EditorToolbar({ editor, readOnly }: EditorToolbarProps) {
  if (!editor || readOnly) return null;

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b border-slate-100 bg-white/95 px-8 py-1.5 backdrop-blur-sm">
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`rounded p-1 text-xs transition ${
          editor.isActive("heading", { level: 1 })
            ? "bg-slate-100 text-slate-900 font-semibold"
            : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
        }`}
        title="Heading 1"
      >
        <Heading1 className="h-3.5 w-3.5" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`rounded p-1 text-xs transition ${
          editor.isActive("heading", { level: 2 })
            ? "bg-slate-100 text-slate-900 font-semibold"
            : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
        }`}
        title="Heading 2"
      >
        <Heading2 className="h-3.5 w-3.5" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`rounded p-1 text-xs transition ${
          editor.isActive("heading", { level: 3 })
            ? "bg-slate-100 text-slate-900 font-semibold"
            : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
        }`}
        title="Heading 3"
      >
        <Heading3 className="h-3.5 w-3.5" />
      </button>

      <div className="h-3.5 w-[1px] bg-slate-200 mx-1" />

      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`rounded p-1 transition ${
          editor.isActive("bold")
            ? "bg-slate-100 text-slate-900"
            : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
        }`}
        title="Bold"
      >
        <Bold className="h-3.5 w-3.5" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`rounded p-1 transition ${
          editor.isActive("italic")
            ? "bg-slate-100 text-slate-900"
            : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
        }`}
        title="Italic"
      >
        <Italic className="h-3.5 w-3.5" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`rounded p-1 transition ${
          editor.isActive("strike")
            ? "bg-slate-100 text-slate-900"
            : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
        }`}
        title="Strikethrough"
      >
        <Strikethrough className="h-3.5 w-3.5" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={`rounded p-1 transition ${
          editor.isActive("code")
            ? "bg-slate-100 text-slate-900"
            : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
        }`}
        title="Inline Code"
      >
        <Code className="h-3.5 w-3.5" />
      </button>

      <div className="h-3.5 w-[1px] bg-slate-200 mx-1" />

      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`rounded p-1 transition ${
          editor.isActive("bulletList")
            ? "bg-slate-100 text-slate-900"
            : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
        }`}
        title="Bullet List"
      >
        <List className="h-3.5 w-3.5" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`rounded p-1 transition ${
          editor.isActive("orderedList")
            ? "bg-slate-100 text-slate-900"
            : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
        }`}
        title="Numbered List"
      >
        <ListOrdered className="h-3.5 w-3.5" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        className={`rounded p-1 transition ${
          editor.isActive("taskList")
            ? "bg-slate-100 text-slate-900"
            : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
        }`}
        title="Task Checkbox List"
      >
        <CheckSquare className="h-3.5 w-3.5" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`rounded p-1 transition ${
          editor.isActive("blockquote")
            ? "bg-slate-100 text-slate-900"
            : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
        }`}
        title="Blockquote"
      >
        <Quote className="h-3.5 w-3.5" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`rounded p-1 transition ${
          editor.isActive("codeBlock")
            ? "bg-slate-100 text-slate-900"
            : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
        }`}
        title="Code Block"
      >
        <Code className="h-3.5 w-3.5" />
      </button>

      <button
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className="rounded p-1 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition"
        title="Horizontal Divider"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>

      <div className="h-3.5 w-[1px] bg-slate-200 mx-1" />

      {/* Table Controls */}
      <button
        onClick={() =>
          editor
            .chain()
            .focus()
            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
            .run()
        }
        className={`rounded p-1 transition ${
          editor.isActive("table")
            ? "bg-slate-100 text-slate-900"
            : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
        }`}
        title="Insert 3x3 Table"
      >
        <TableIcon className="h-3.5 w-3.5" />
      </button>

      {editor.isActive("table") && (
        <>
          <button
            onClick={() => editor.chain().focus().addRowAfter().run()}
            className="rounded p-1 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition text-[10px] flex items-center gap-0.5"
            title="Add Row Below"
          >
            <Rows className="h-3 w-3" />
            <span>+Row</span>
          </button>
          <button
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            className="rounded p-1 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition text-[10px] flex items-center gap-0.5"
            title="Add Column Right"
          >
            <Columns className="h-3 w-3" />
            <span>+Col</span>
          </button>
          <button
            onClick={() => editor.chain().focus().deleteTable().run()}
            className="rounded p-1 text-red-500 hover:bg-red-50 transition text-[10px] flex items-center gap-0.5"
            title="Delete Table"
          >
            <Trash className="h-3 w-3" />
          </button>
        </>
      )}

      <div className="h-3.5 w-[1px] bg-slate-200 mx-1" />

      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className="rounded p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-20 transition"
        title="Undo (Ctrl+Z)"
      >
        <Undo className="h-3.5 w-3.5" />
      </button>

      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className="rounded p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-20 transition"
        title="Redo (Ctrl+Y)"
      >
        <Redo className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
