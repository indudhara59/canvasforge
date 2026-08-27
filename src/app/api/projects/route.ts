import { NextResponse } from "next/server";

import { auth } from "@/auth";
import connectToDatabase from "@/lib/mongodb";
import Project from "@/models/Project";
import Scene from "@/models/Scene";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  const projects = await Project.find({
    $or: [{ ownerId: session.user.id }, { collaboratorIds: session.user.id }],
  })
    .sort({ updatedAt: -1 })
    .lean();

  return NextResponse.json(
    projects.map((project) => ({
      id: project._id.toString(),
      name: project.name,
      thumbnailUrl: project.thumbnailUrl ?? null,
      updatedAt: project.updatedAt,
    })),
  );
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";

  if (!name) {
    return NextResponse.json({ error: "Project name is required." }, { status: 400 });
  }

  await connectToDatabase();

  const project = await Project.create({
    name,
    ownerId: session.user.id,
    collaboratorIds: [],
  });

  await Scene.create({ projectId: project._id });

  return NextResponse.json(
    {
      id: project._id.toString(),
      name: project.name,
      thumbnailUrl: project.thumbnailUrl ?? null,
      updatedAt: project.updatedAt,
    },
    { status: 201 },
  );
}
