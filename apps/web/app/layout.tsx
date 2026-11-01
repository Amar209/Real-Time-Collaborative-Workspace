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
    <html lang="en">
      <body className="min-h-screen bg-apple-canvas text-apple-text font-sans antialiased selection:bg-emerald-500/20 selection:text-emerald-900">
        {children}
      </body>
    </html>
  );
}
