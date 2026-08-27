import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getAuthorizedProject, projectAccessErrorMessage } from "@/lib/project-access";
import Project from "@/models/Project";
import Scene from "@/models/Scene";
import SceneVersion from "@/models/SceneVersion";

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
    return NextResponse.json(
      { error: projectAccessErrorMessage(result.status) },
      { status: result.status },
    );
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
    return NextResponse.json(
      { error: projectAccessErrorMessage(result.status) },
      { status: result.status },
    );
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
