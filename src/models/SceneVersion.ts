import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";
import type { SceneNode, Viewport } from "@/types/scene";

export interface ISceneVersion extends Document {
  projectId: Types.ObjectId;
  nodes: Record<string, SceneNode>;
  rootIds: string[];
  viewport: Viewport;
  version: number;
  createdAt: Date;
}

const ViewportSchema = new Schema<Viewport>(
  {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    scale: { type: Number, default: 1 },
  },
  { _id: false },
);

const SceneVersionSchema = new Schema<ISceneVersion>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    nodes: { type: Schema.Types.Mixed, default: {} },
    rootIds: [{ type: String, default: [] }],
    viewport: { type: ViewportSchema, default: () => ({ x: 0, y: 0, scale: 1 }) },
    version: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  // See Scene.ts — disables Mongoose's default empty-object stripping.
  { minimize: false },
);

// History lookups fetch the most recent versions for a project.
SceneVersionSchema.index({ projectId: 1, version: -1 });

const SceneVersion: Model<ISceneVersion> =
  mongoose.models.SceneVersion ||
  mongoose.model<ISceneVersion>("SceneVersion", SceneVersionSchema);

export default SceneVersion;
