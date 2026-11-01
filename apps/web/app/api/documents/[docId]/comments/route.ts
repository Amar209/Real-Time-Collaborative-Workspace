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

  const comments = await prisma.comment.findMany({
    where: { documentId: params.docId },
    include: {
      author: {
        select: { id: true, name: true, avatarColor: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ comments });
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
    const { content, blockId } = await req.json();

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Comment content cannot be empty" }, { status: 400 });
    }

    const comment = await prisma.comment.create({
      data: {
        documentId: params.docId,
        authorId: user.id,
        content: content.trim(),
        blockId: blockId || null,
      },
      include: {
        author: {
          select: { id: true, name: true, avatarColor: true },
        },
      },
    });

    return NextResponse.json({ comment });
  } catch (err) {
    console.error("Create comment error:", err);
    return NextResponse.json({ error: "Failed to post comment" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { commentId, resolved } = await req.json();
    const updated = await prisma.comment.update({
      where: { id: commentId },
      data: { resolved },
    });
    return NextResponse.json({ comment: updated });
  } catch (err) {
    console.error("Update comment error:", err);
    return NextResponse.json({ error: "Failed to update comment" }, { status: 500 });
  }
}
