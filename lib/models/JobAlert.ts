import "server-only";
import mongoose, { Document, Schema } from "mongoose";

export type JobAlertFrequency = "daily" | "weekly";

export interface IJobAlert extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  keywords: string[];
  location?: string;
  workplaceTypes?: string[];
  employmentTypes?: string[];
  experienceLevels?: string[];
  minMatchPercent: number;
  frequency: JobAlertFrequency;
  enabled: boolean;
  lastSentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const jobAlertSchema = new Schema<IJobAlert>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, maxlength: 120 },
    keywords: [{ type: String, maxlength: 50 }],
    location: String,
    workplaceTypes: [String],
    employmentTypes: [String],
    experienceLevels: [String],
    minMatchPercent: { type: Number, min: 0, max: 100, default: 75 },
    frequency: { type: String, enum: ["daily", "weekly"], default: "daily" },
    enabled: { type: Boolean, default: true },
    lastSentAt: Date,
  },
  {
    timestamps: true,
  }
);

export const JobAlert = mongoose.models.JobAlert || mongoose.model<IJobAlert>("JobAlert", jobAlertSchema);