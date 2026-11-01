import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { FileText, Sparkles, Clock, Users, ArrowUpRight, FolderPlus } from "lucide-react";

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

  const owner = workspace.members.find((m) => m.role === "OWNER")?.user;

  return (
    <div className="mx-auto max-w-5xl px-10 py-14">
      {/* Editorial Header inspired by Phlox Agency Design */}
      <div className="relative rounded-3xl border border-slate-200/80 bg-white p-10 shadow-apple-lg overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block text-xs font-bold tracking-widest uppercase text-emerald-600 mb-2">
            Active Workspace • Created {new Date(workspace.createdAt).toLocaleDateString()}
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
            {workspace.name}
          </h1>
          <p className="mt-3 text-base text-slate-600 leading-relaxed font-normal">
            Workspace managed by <span className="font-semibold text-slate-800">{owner?.name || "Workspace Team"}</span>. Multiple team members can co-author simultaneously with live presence and zero merge conflicts.
          </p>

          {/* Metric Counter Pills (100% Dynamic from Database) */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-[#f9f9fb] px-4 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
                {workspace.documents.length}
              </span>
              <span>{workspace.documents.length === 1 ? "Document" : "Documents"}</span>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-[#f9f9fb] px-4 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">
                {workspace.members.length}
              </span>
              <span>{workspace.members.length === 1 ? "Member" : "Members"}</span>
            </div>

            {/* Live Collaborators Avatars */}
            <div className="flex items-center -space-x-2 pl-2">
              {workspace.members.slice(0, 5).map((m) => (
                <div
                  key={m.id}
                  title={`${m.user.name} (${m.role})`}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white ring-2 ring-white shadow-sm"
                  style={{ backgroundColor: m.user.avatarColor || "#10b981" }}
                >
                  {m.user.name.charAt(0)}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Decorative soft geometric curve inspired by Phlox design */}
        <div className="absolute -right-20 -bottom-20 h-96 w-96 rounded-full border-[32px] border-slate-100/80 pointer-events-none" />
      </div>

      {/* Documents Section */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Workspace Documents</h2>
            <p className="text-xs text-slate-500">Pick any document to begin live co-authoring</p>
          </div>
        </div>

        {workspace.documents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center bg-white shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-3">
              <FolderPlus className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">No documents yet</h3>
            <p className="text-xs text-slate-500 mt-1">Click &quot;New Document&quot; in the sidebar to create your first page.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-5">
            {workspace.documents.map((doc) => (
              <Link
                key={doc.id}
                href={`/${workspace.slug}/doc/${doc.id}`}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-apple transition-all duration-200 hover:border-emerald-500/60 hover:shadow-apple-lg hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl p-2 rounded-2xl bg-[#f9f9fb] border border-slate-100 inline-block">
                      {doc.icon || "📄"}
                    </span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition">
                      <ArrowUpRight className="h-4 w-4" />
                    </div>
                  </div>
                  <h3 className="mt-4 text-base font-bold text-slate-900 group-hover:text-emerald-600 transition tracking-tight">
                    {doc.title || "Untitled Document"}
                  </h3>
                </div>
                <div className="mt-6 flex items-center justify-between text-xs text-slate-400 font-medium border-t border-slate-100 pt-3">
                  <span>Updated {new Date(doc.updatedAt).toLocaleDateString()}</span>
                  <span className="text-emerald-600 font-semibold opacity-0 group-hover:opacity-100 transition">
                    Open Document →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
