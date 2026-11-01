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

  const snapshots = await prisma.documentSnapshot.findMany({
    where: { documentId: params.docId },
    include: {
      createdBy: {
        select: { id: true, name: true, avatarColor: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ snapshots });
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
    const { title, snapshotBase64 } = await req.json();

    const snapshotBinary = snapshotBase64
      ? Buffer.from(snapshotBase64, "base64")
      : Buffer.from(new Uint8Array([]));

    const snapshot = await prisma.documentSnapshot.create({
      data: {
        documentId: params.docId,
        createdById: user.id,
        title: title || `Version ${new Date().toLocaleTimeString()}`,
        snapshotBinary,
      },
      include: {
        createdBy: {
          select: { id: true, name: true, avatarColor: true },
        },
      },
    });

    return NextResponse.json({ snapshot });
  } catch (err) {
    console.error("Create snapshot error:", err);
    return NextResponse.json({ error: "Failed to create snapshot" }, { status: 500 });
  }
}
