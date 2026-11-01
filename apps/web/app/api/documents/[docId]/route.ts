import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { docId: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { docId } = params;
  const document = await prisma.document.findUnique({
    where: { id: docId },
    include: {
      workspace: {
        include: {
          members: {
            where: { userId: user.id },
          },
        },
      },
      permissions: {
        where: { userId: user.id },
      },
      comments: {
        include: {
          author: {
            select: { id: true, name: true, avatarColor: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  // Determine user role
  const isOwner = document.workspace.ownerId === user.id;
  const workspaceMember = document.workspace.members[0];
  const customPerm = document.permissions[0];

  let role = "VIEWER";
  if (isOwner || workspaceMember?.role === "OWNER") {
    role = "OWNER";
  } else if (customPerm) {
    role = customPerm.role;
  } else if (workspaceMember) {
    role = workspaceMember.role; // EDITOR or MEMBER
  }

  return NextResponse.json({
    document,
    userRole: role,
    user,
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: { docId: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { docId } = params;
  try {
    const body = await req.json();
    const { title, icon, isArchived } = body;

    const updated = await prisma.document.update({
      where: { id: docId },
      data: {
        ...(title !== undefined && { title }),
        ...(icon !== undefined && { icon }),
        ...(isArchived !== undefined && { isArchived }),
      },
    });

    return NextResponse.json({ document: updated });
  } catch (err) {
    console.error("Update document error:", err);
    return NextResponse.json({ error: "Failed to update document" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { docId: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { docId } = params;
  try {
    await prisma.document.delete({ where: { id: docId } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete document error:", err);
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
  }
}
