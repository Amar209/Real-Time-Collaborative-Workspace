import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const workspaceSlug = searchParams.get("workspaceSlug");

  if (!workspaceSlug) {
    return NextResponse.json({ error: "workspaceSlug is required" }, { status: 400 });
  }

  const workspace = await prisma.workspace.findUnique({
    where: { slug: workspaceSlug },
    include: {
      members: true,
      documents: {
        where: { isArchived: false },
        orderBy: { updatedAt: "desc" },
      },
    },
  });

  if (!workspace) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  return NextResponse.json({ documents: workspace.documents, workspace });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { workspaceId, parentDocId, title, icon } = await req.json();

    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
    }

    const document = await prisma.document.create({
      data: {
        workspaceId,
        parentDocId: parentDocId || null,
        title: title || "Untitled Document",
        icon: icon || "📄",
      },
    });

    return NextResponse.json({ document });
  } catch (err) {
    console.error("Create document error:", err);
    return NextResponse.json({ error: "Failed to create document" }, { status: 500 });
  }
}
