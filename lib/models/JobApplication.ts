import "server-only";
import mongoose, { Document, Schema } from "mongoose";
import { IJob } from "./Job";

export type ApplicationStatus = "saved" | "applied" | "interview" | "offer" | "rejected" | "withdrawn";

export interface IJobApplication extends Document {
  userId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  job?: IJob;
  status: ApplicationStatus;
  notes?: string;
  appliedAt?: Date;
  interviewDates?: Date[];
  offerDetails?: {
    salary?: number;
    currency?: string;
    startDate?: Date;
    notes?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const applicationSchema = new Schema<IJobApplication>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true, index: true },
    status: {
      type: String,
      enum: ["saved", "applied", "interview", "offer", "rejected", "withdrawn"],
      default: "saved",
      index: true,
    },
    notes: { type: String, maxlength: 2000 },
    appliedAt: Date,
    interviewDates: [Date],
    offerDetails: {
      salary: Number,
      currency: String,
      startDate: Date,
      notes: String,
    },
  },
  {
    timestamps: true,
  }
);

applicationSchema.index({ userId: 1, jobId: 1 }, { unique: true });

export const JobApplication = mongoose.models.JobApplication || mongoose.model<IJobApplication>("JobApplication", applicationSchema);