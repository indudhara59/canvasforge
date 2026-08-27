import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getAuthorizedProject, projectAccessErrorMessage } from "@/lib/project-access";
import Scene from "@/models/Scene";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const access = await getAuthorizedProject(params.id, session.user.id);
  if (access.status !== 200) {
    return NextResponse.json(
      { error: projectAccessErrorMessage(access.status) },
      { status: access.status },
    );
  }

  const scene = await Scene.findOne({ projectId: access.project._id }).lean();
  if (!scene) {
    return NextResponse.json({ error: "Scene not found for this project." }, { status: 404 });
  }

  return NextResponse.json({
    nodes: scene.nodes ?? {},
    rootIds: scene.rootIds ?? [],
    viewport: scene.viewport ?? { x: 0, y: 0, scale: 1 },
    version: scene.version ?? 0,
  });
}
