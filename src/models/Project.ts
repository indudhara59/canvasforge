import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export interface IProject extends Document {
  name: string;
  ownerId: Types.ObjectId;
  collaboratorIds: Types.ObjectId[];
  thumbnailUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>({
  name: { type: String, required: true, trim: true },
  ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  collaboratorIds: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
  thumbnailUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

ProjectSchema.pre("save", function bumpUpdatedAt(next) {
  this.updatedAt = new Date();
  next();
});

const Project: Model<IProject> =
  mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);

export default Project;
