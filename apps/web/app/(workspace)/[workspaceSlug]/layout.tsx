import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/sidebar/Sidebar";

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { workspaceSlug: string };
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const workspace = await prisma.workspace.findUnique({
    where: { slug: params.workspaceSlug },
    include: {
      documents: {
        where: { isArchived: false },
        orderBy: { updatedAt: "desc" },
      },
    },
  });

  if (!workspace) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0b0f19]">
      <Sidebar user={user} workspace={workspace} documents={workspace.documents} />
      <main className="flex-1 overflow-y-auto bg-[#0d121f] text-slate-100">
        {children}
      </main>
    </div>
  );
}
