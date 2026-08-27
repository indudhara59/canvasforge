import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";
import type { SceneNode, Viewport } from "@/types/scene";

export interface IScene extends Document {
  projectId: Types.ObjectId;
  nodes: Record<string, SceneNode>;
  rootIds: string[];
  viewport: Viewport;
  version: number;
  updatedAt: Date;
}

const ViewportSchema = new Schema<Viewport>(
  {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    scale: { type: Number, default: 1 },
  },
  { _id: false },
);

const SceneSchema = new Schema<IScene>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      unique: true,
    },
    nodes: { type: Schema.Types.Mixed, default: {} },
    rootIds: [{ type: String, default: [] }],
    viewport: { type: ViewportSchema, default: () => ({ x: 0, y: 0, scale: 1 }) },
    version: { type: Number, default: 0 },
    updatedAt: { type: Date, default: Date.now },
  },
  // Mongoose's default `minimize: true` strips empty objects (like an empty
  // `nodes` map on a brand-new scene) before saving — disable it so `nodes`
  // is always a real object, never absent.
  { minimize: false },
);

SceneSchema.pre("save", function bumpUpdatedAt(next) {
  this.updatedAt = new Date();
  next();
});

const Scene: Model<IScene> = mongoose.models.Scene || mongoose.model<IScene>("Scene", SceneSchema);

export default Scene;
