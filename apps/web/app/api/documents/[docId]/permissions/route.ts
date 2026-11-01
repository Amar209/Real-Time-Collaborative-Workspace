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

  const permissions = await prisma.documentPermission.findMany({
    where: { documentId: params.docId },
    include: {
      user: {
        select: { id: true, name: true, email: true, avatarColor: true },
      },
    },
  });

  return NextResponse.json({ permissions });
}

export async function POST(
  req: Request,
  { params }: { params: { docId: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { email, role } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "User with this email not found. Please ask them to register first." },
        { status: 404 }
      );
    }

    const permission = await prisma.documentPermission.upsert({
      where: {
        documentId_userId: {
          documentId: params.docId,
          userId: targetUser.id,
        },
      },
      update: {
        role: role || "EDITOR",
      },
      create: {
        documentId: params.docId,
        userId: targetUser.id,
        role: role || "EDITOR",
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarColor: true },
        },
      },
    });

    return NextResponse.json({ permission });
  } catch (err) {
    console.error("Set permission error:", err);
    return NextResponse.json({ error: "Failed to update permission" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { permissionId } = await req.json();
    await prisma.documentPermission.delete({
      where: { id: permissionId },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete permission error:", err);
    return NextResponse.json({ error: "Failed to remove permission" }, { status: 500 });
  }
}
