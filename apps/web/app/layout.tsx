import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Multiplayer Collaborative Workspace",
  description: "Real-time document workspace with Yjs CRDTs, live cursors, and Redis scaling",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-canvas-dark text-slate-100 antialiased selection:bg-blue-500/30">
        {children}
      </body>
    </html>
  );
}
