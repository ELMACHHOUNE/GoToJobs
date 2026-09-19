import "server-only";
import mongoose, { Document, Schema } from "mongoose";
import { IJob } from "./Job";

export interface ISavedJob extends Document {
  userId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  job?: IJob;
  notes?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const savedJobSchema = new Schema<ISavedJob>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true, index: true },
    notes: { type: String, maxlength: 2000 },
    tags: [String],
  },
  {
    timestamps: true,
  }
);

savedJobSchema.index({ userId: 1, jobId: 1 }, { unique: true });

export const SavedJob = mongoose.models.SavedJob || mongoose.model<ISavedJob>("SavedJob", savedJobSchema);