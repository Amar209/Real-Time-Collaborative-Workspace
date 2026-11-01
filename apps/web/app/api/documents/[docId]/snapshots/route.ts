import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

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

    let snapshotBinary: Buffer;
    if (snapshotBase64) {
      snapshotBinary = Buffer.from(snapshotBase64, "base64");
    } else {
      // Check if disk storage has current yjs state
      const diskPath = path.resolve(process.cwd(), "..", "ws-server", "data", "yjs-storage", `doc-${params.docId}.bin`);
      if (fs.existsSync(diskPath)) {
        snapshotBinary = fs.readFileSync(diskPath);
      } else {
        snapshotBinary = Buffer.from(new Uint8Array([]));
      }
    }

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

export async function PUT(
  req: Request,
  { params }: { params: { docId: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { snapshotId } = await req.json();
    const snapshot = await prisma.documentSnapshot.findUnique({
      where: { id: snapshotId },
    });

    if (!snapshot) {
      return NextResponse.json({ error: "Snapshot not found" }, { status: 404 });
    }

    // Persist restored state to document record
    await prisma.document.update({
      where: { id: params.docId },
      data: {
        contentBinary: snapshot.snapshotBinary,
      },
    });

    // Also update server disk cache if it exists
    const diskPath = path.resolve(process.cwd(), "..", "ws-server", "data", "yjs-storage", `doc-${params.docId}.bin`);
    if (fs.existsSync(diskPath) && snapshot.snapshotBinary.length > 0) {
      fs.writeFileSync(diskPath, snapshot.snapshotBinary);
    }

    return NextResponse.json({ success: true, restoredTitle: snapshot.title });
  } catch (err) {
    console.error("Restore snapshot error:", err);
    return NextResponse.json({ error: "Failed to restore snapshot" }, { status: 500 });
  }
}
