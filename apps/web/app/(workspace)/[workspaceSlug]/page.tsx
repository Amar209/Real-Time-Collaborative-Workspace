import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { FileText, Plus, Sparkles, Clock, Users, ArrowUpRight } from "lucide-react";

export default async function WorkspaceDashboardPage({
  params,
}: {
  params: { workspaceSlug: string };
}) {
  const user = await getCurrentUser();
  const workspace = await prisma.workspace.findUnique({
    where: { slug: params.workspaceSlug },
    include: {
      documents: {
        where: { isArchived: false },
        orderBy: { updatedAt: "desc" },
      },
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true, avatarColor: true },
          },
        },
      },
    },
  });

  if (!workspace) return null;

  return (
    <div className="mx-auto max-w-4xl px-8 py-12">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-8 shadow-xl">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {workspace.name}
            </h1>
            <p className="text-sm text-slate-400">
              Real-time multiplayer workspace • CRDT-powered conflict-free editing
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4 border-t border-slate-800/80 pt-6">
          <div className="rounded-xl bg-slate-900/60 p-4 border border-slate-800/60">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <FileText className="h-4 w-4 text-blue-400" />
              Total Documents
            </div>
            <p className="mt-2 text-2xl font-bold text-white">{workspace.documents.length}</p>
          </div>
          <div className="rounded-xl bg-slate-900/60 p-4 border border-slate-800/60">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <Users className="h-4 w-4 text-pink-400" />
              Team Members
            </div>
            <p className="mt-2 text-2xl font-bold text-white">{workspace.members.length}</p>
          </div>
          <div className="rounded-xl bg-slate-900/60 p-4 border border-slate-800/60">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <Clock className="h-4 w-4 text-emerald-400" />
              Sync Engine
            </div>
            <p className="mt-2 text-2xl font-bold text-emerald-400">Yjs + Redis</p>
          </div>
        </div>
      </div>

      {/* Recent Documents */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Documents</h2>
          <span className="text-xs text-slate-400">Select a document to collaborate live</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {workspace.documents.map((doc) => (
            <Link
              key={doc.id}
              href={`/${workspace.slug}/doc/${doc.id}`}
              className="group flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/40 p-5 transition hover:border-blue-500/50 hover:bg-slate-900/80 shadow-md"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{doc.icon || "📄"}</span>
                  <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-blue-400 transition" />
                </div>
                <h3 className="mt-3 font-semibold text-white group-hover:text-blue-400 transition">
                  {doc.title || "Untitled Document"}
                </h3>
              </div>
              <p className="mt-4 text-xs text-slate-500">
                Updated {new Date(doc.updatedAt).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
