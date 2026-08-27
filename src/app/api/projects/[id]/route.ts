import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { auth } from "@/auth";
import connectToDatabase from "@/lib/mongodb";
import Project, { type IProject } from "@/models/Project";
import Scene from "@/models/Scene";
import SceneVersion from "@/models/SceneVersion";

type AuthorizedResult =
  | { status: 400 | 404 | 403 }
  | { status: 200; project: IProject; isOwner: boolean };

async function getAuthorizedProject(id: string, userId: string): Promise<AuthorizedResult> {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { status: 400 };
  }

  await connectToDatabase();

  const project = await Project.findById(id);
  if (!project) {
    return { status: 404 };
  }

  const isOwner = project.ownerId.toString() === userId;
  const isCollaborator = project.collaboratorIds.some((c) => c.toString() === userId);

  if (!isOwner && !isCollaborator) {
    return { status: 403 };
  }

  return { status: 200, project, isOwner };
}

function errorMessageFor(status: number) {
  switch (status) {
    case 400:
      return "Invalid project id.";
    case 404:
      return "Project not found.";
    case 403:
      return "You do not have access to this project.";
    default:
      return "Something went wrong.";
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "Project name is required." }, { status: 400 });
  }

  const result = await getAuthorizedProject(params.id, session.user.id);
  if (result.status !== 200) {
    return NextResponse.json({ error: errorMessageFor(result.status) }, { status: result.status });
  }

  result.project.name = name;
  await result.project.save();

  return NextResponse.json({
    id: result.project._id.toString(),
    name: result.project.name,
    thumbnailUrl: result.project.thumbnailUrl ?? null,
    updatedAt: result.project.updatedAt,
  });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await getAuthorizedProject(params.id, session.user.id);
  if (result.status !== 200) {
    return NextResponse.json({ error: errorMessageFor(result.status) }, { status: result.status });
  }

  if (!result.isOwner) {
    return NextResponse.json(
      { error: "Only the project owner can delete this project." },
      { status: 403 },
    );
  }

  await Promise.all([
    Scene.deleteOne({ projectId: result.project._id }),
    SceneVersion.deleteMany({ projectId: result.project._id }),
    Project.deleteOne({ _id: result.project._id }),
  ]);

  return NextResponse.json({ success: true });
}
