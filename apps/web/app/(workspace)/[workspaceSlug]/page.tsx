import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { FileText, Plus, ArrowUpRight } from "lucide-react";

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
    <div className="mx-auto max-w-4xl px-8 py-10">
      {/* Clean Workspace Header */}
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {workspace.name}
        </h1>
        <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
          <span>{workspace.documents.length} {workspace.documents.length === 1 ? "page" : "pages"}</span>
          <span>•</span>
          <span>{workspace.members.length} {workspace.members.length === 1 ? "collaborator" : "collaborators"}</span>
        </div>
      </div>

      {/* Pages List */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            All Documents
          </h2>
        </div>

        {workspace.documents.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center bg-slate-50/50">
            <p className="text-sm text-slate-500">No pages in this workspace yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 rounded-lg border border-slate-200/80 bg-white">
            {workspace.documents.map((doc) => (
              <Link
                key={doc.id}
                href={`/${workspace.slug}/doc/${doc.id}`}
                className="group flex items-center justify-between p-4 transition-colors hover:bg-slate-50"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="h-4 w-4 text-slate-400 group-hover:text-slate-800 transition-colors flex-shrink-0" />
                  <span className="text-sm font-medium text-slate-900 truncate">
                    {doc.title || "Untitled"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>{new Date(doc.updatedAt).toLocaleDateString()}</span>
                  <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 text-slate-600 transition-opacity" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
