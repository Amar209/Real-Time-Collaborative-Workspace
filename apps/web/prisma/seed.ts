import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean existing records if any
  await prisma.comment.deleteMany();
  await prisma.documentSnapshot.deleteMany();
  await prisma.documentPermission.deleteMany();
  await prisma.document.deleteMany();
  await prisma.workspaceMember.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  // Create Users
  const user1 = await prisma.user.create({
    data: {
      email: "amar@example.com",
      name: "Amar Kumar",
      passwordHash,
      avatarColor: "#3b82f6", // Blue
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: "sarah@example.com",
      name: "Sarah Chen",
      passwordHash,
      avatarColor: "#ec4899", // Pink
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: "alex@example.com",
      name: "Alex Rivera",
      passwordHash,
      avatarColor: "#10b981", // Emerald
    },
  });

  // Create Default Workspace
  const workspace = await prisma.workspace.create({
    data: {
      name: "Acme Engineering",
      slug: "acme-engineering",
      ownerId: user1.id,
      members: {
        create: [
          { userId: user1.id, role: "OWNER" },
          { userId: user2.id, role: "EDITOR" },
          { userId: user3.id, role: "COMMENTER" },
        ],
      },
    },
  });

  // Create Root Document: Product Spec
  const doc1 = await prisma.document.create({
    data: {
      workspaceId: workspace.id,
      title: "Real-Time Collaborative Engine Architecture",
      icon: "⚡",
      contentJson: JSON.stringify({
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [{ type: "text", text: "Real-Time Collaborative Engine Architecture" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Welcome to the real-time collaborative workspace. Multiple people can edit this document at once, see each other's live colored cursors, and never lose changes.",
              },
            ],
          },
          {
            type: "heading",
            attrs: { level: 2 },
            content: [{ type: "text", text: "Core Architectural Guarantees" }],
          },
          {
            type: "taskList",
            content: [
              {
                type: "taskItem",
                attrs: { checked: true },
                content: [{ type: "paragraph", content: [{ type: "text", text: "Yjs CRDT deterministic state convergence without central locking" }] }],
              },
              {
                type: "taskItem",
                attrs: { checked: true },
                content: [{ type: "paragraph", content: [{ type: "text", text: "Multi-client presence tracking with colored carets and selection highlight" }] }],
              },
              {
                type: "taskItem",
                attrs: { checked: false },
                content: [{ type: "paragraph", content: [{ type: "text", text: "Redis Pub/Sub multi-instance cluster scaling" }] }],
              },
            ],
          },
        ],
      }),
    },
  });

  // Create Sub-Document
  const doc2 = await prisma.document.create({
    data: {
      workspaceId: workspace.id,
      parentDocId: doc1.id,
      title: "Sprint 42 Goals & Milestones",
      icon: "🎯",
      contentJson: JSON.stringify({
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [{ type: "text", text: "Sprint 42 Goals & Milestones" }],
          },
          {
            type: "paragraph",
            content: [{ type: "text", text: "Weekly sprint planning and team deliverables overview." }],
          },
        ],
      }),
    },
  });

  // Seed sample comment
  await prisma.comment.create({
    data: {
      documentId: doc1.id,
      authorId: user2.id,
      content: "Let's benchmark the sub-50ms latency target under 50 concurrent headless clients!",
      resolved: false,
    },
  });

  console.log("Seeding completed successfully!");
  console.log(`Created default user: ${user1.email} (password: password123)`);
  console.log(`Workspace: ${workspace.name} (${workspace.slug})`);
  console.log(`Document ID: ${doc1.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
