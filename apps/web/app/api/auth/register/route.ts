import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken, COOKIE_NAME } from "@/lib/auth";
import { getRandomColor } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    const avatarColor = getRandomColor(email);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        avatarColor,
      },
    });

    // Create default personal workspace for the user
    const slug = `${name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-workspace-${Math.random().toString(36).substring(2, 6)}`;
    const workspace = await prisma.workspace.create({
      data: {
        name: `${name}'s Workspace`,
        slug,
        ownerId: user.id,
        members: {
          create: {
            userId: user.id,
            role: "OWNER",
          },
        },
      },
    });

    // Create a welcoming first document
    await prisma.document.create({
      data: {
        workspaceId: workspace.id,
        title: "Welcome to your Collaborative Workspace",
        icon: "🚀",
      },
    });

    const token = signToken({
      id: user.id,
      email: user.email,
      name: user.name,
      avatarColor: user.avatarColor,
    });

    const res = NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, avatarColor: user.avatarColor },
      workspaceSlug: workspace.slug,
    });

    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
