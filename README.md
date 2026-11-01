# Real-Time Collaborative Workspace (Notion/Figma Style)
### Project Code: FS-02 • Full-Stack Development Capstone

A real-time, multiplayer collaborative document workspace inspired by **Notion** and **Figma**. Multiple users can simultaneously edit rich-text documents with zero conflict data loss, view live colored cursors and text selections, manage nested document hierarchies, participate in threaded discussions, revert to historical snapshots, and scale across multi-server instances using **Redis Pub/Sub**.

---

## 🌟 Key Features

* **⚡ Conflict-Free Real-Time Editing (CRDTs)**: Built on **Yjs** and **TipTap (ProseMirror)** to guarantee deterministic state convergence without centralized locks.
* **👥 Live Multiplayer Presence**: Colored remote cursor carets, user name badges, live text selections, and header avatars showing active online collaborators.
* **🔍 Spotlight Quick Search (`Cmd+K` / `Ctrl+K`)**: Instant keyboard-driven command palette to search and jump to any document in the workspace.
* **💬 Floating Selection Bubble Menu**: Sleek Apple-style floating toolbar appearing upon text selection for immediate formatting (Bold, Italic, Strike, Code, Heading, Quote).
* **📊 Live Reading & Word Count Statistics**: Real-time word counter, character counter, and estimated reading time indicator in the document status bar.
* **📑 Table & Grid Editing**: Full support for multi-column and multi-row tables with header rows, row/column addition, and deletion.
* **📂 Notion-Grade Document Tree & Breadcrumbs**: Hierarchical nested documents with expandable sidebar, breadcrumb navigation, and instant sub-page creation.
* **💾 One-Click Document Export**: Instant export to Clean Markdown (`.md`) or Print / Save as PDF.
* **💬 Threaded Inline Comments**: Anchor discussions to specific document blocks, reply to threads, and mark items as resolved.
* **🕒 Version History & Rollback**: Automatic milestone checkpoints and manual snapshots with one-click revision restore.
* **🛡️ Role-Based Permissions (RBAC)**: Granular access control (`Owner`, `Editor`, `Commenter`, `Viewer`) with shareable link generation.
* **🚀 Multi-Node Horizontal Scaling**: Decoupled WebSocket sync server with **Redis Pub/Sub** support for multi-instance cluster deployment.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | [Next.js](https://nextjs.org/) (App Router, React 18, TypeScript) |
| **Styling & Design System** | [TailwindCSS](https://tailwindcss.com/) + Apple SF Pro Typography |
| **Rich-Text Engine** | [TipTap v2](https://tiptap.dev/) (ProseMirror core) |
| **CRDT Synchronization** | [Yjs](https://yjs.dev/) + `y-protocols/awareness` |
| **Real-Time Network** | WebSockets via `y-websocket` + Node.js HTTP/WS Server |
| **Database & ORM** | [Prisma ORM](https://www.prisma.io/) + PostgreSQL / SQLite |
| **Horizontal Scaling** | [Redis](https://redis.io/) via `ioredis` (with in-memory fallback) |

---

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Amar209/Real-Time-Collaborative-Workspace.git
cd "Real-Time-Collaborative-Workspace"
npm install
```

### 2. Setup Database & Seed Initial Data
```bash
npm run prisma:generate --workspace=apps/web
npm run prisma:push --workspace=apps/web
npx tsx apps/web/prisma/seed.ts
```

### 3. Start Development Servers
You can run both the WebSocket server and the Next.js web application simultaneously:
```bash
npm run dev:all
```
* **Web Application**: [http://localhost:3000](http://localhost:3000)
* **WebSocket Sync Server**: `ws://localhost:1234` (Health check at [http://localhost:1234](http://localhost:1234))

---

## 👥 Instant Multiplayer Demo Accounts
The database comes pre-seeded with 3 test accounts so you can test live collaboration across two browser tabs or an Incognito window:

| User | Email | Password | Role | Cursor Color |
| :--- | :--- | :--- | :--- | :--- |
| **Amar Kumar** | `amar@example.com` | `password123` | Owner | 🔵 Blue (`#3b82f6`) |
| **Sarah Chen** | `sarah@example.com` | `password123` | Editor | 🌸 Pink (`#ec4899`) |
| **Alex Rivera** | `alex@example.com` | `password123` | Member | 🟢 Emerald (`#10b981`) |

*Tip*: You can also create any brand new account on the `/register` page to get a dynamic workspace automatically created for you!

---

## 📊 Concurrency & Stress Testing
Run the automated benchmark simulating 20+ concurrent headless Yjs clients writing extracts from **Project Gutenberg** (*Frankenstein*):
```bash
npx tsx benchmarks/load-test.ts
```
Detailed results will be output to the console and saved to `benchmarks/benchmark_report.md`.

---

## 📁 Repository Structure
```
├── apps/
│   ├── web/               # Next.js 14 App Router, TipTap editor, TailwindCSS UI
│   │   ├── app/           # App routes & API endpoints
│   │   ├── components/    # Editor, Sidebar, Presence, Comments, History, Share
│   │   └── prisma/        # Database schema and seed scripts
│   └── ws-server/         # Standalone WebSocket server with Redis adapter
├── benchmarks/            # Concurrency load-test script & Gutenberg sample text
├── docs/                  # Capstone documentation: Architecture, Slides, Reflection
└── package.json           # Monorepo workspaces config
```

---

## 📄 Capstone Deliverables
* **Architecture & CRDT Report**: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
* **10-Minute Presentation Slides**: [`docs/PRESENTATION_SLIDES.md`](docs/PRESENTATION_SLIDES.md)
* **Individual Reflection**: [`docs/REFLECTION.md`](docs/REFLECTION.md)
* **Stress Test Benchmarks**: [`benchmarks/benchmark_report.md`](benchmarks/benchmark_report.md)
