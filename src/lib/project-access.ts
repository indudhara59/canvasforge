import mongoose from "mongoose";

import connectToDatabase from "@/lib/mongodb";
import Project, { type IProject } from "@/models/Project";

export type ProjectAccessResult =
  | { status: 400 | 404 | 403 }
  | { status: 200; project: IProject; isOwner: boolean };

export async function getAuthorizedProject(
  id: string,
  userId: string,
): Promise<ProjectAccessResult> {
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

export function projectAccessErrorMessage(status: number) {
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
