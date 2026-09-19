import "server-only";
import mongoose, { Document, Schema } from "mongoose";

export interface IJob extends Document {
  externalId: string;
  source: string;
  title: string;
  company: {
    name: string;
    logo?: string;
    website?: string;
    linkedinUrl?: string;
  };
  location?: string;
  workplaceType?: "remote" | "hybrid" | "onsite";
  employmentType?: "full-time" | "part-time" | "contract" | "internship" | "freelance";
  experienceLevel?: "entry" | "junior" | "mid-level" | "senior" | "lead";
  description: string;
  responsibilities?: string[];
  requirements?: string[];
  skills: string[];
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  publishedAt: Date;
  fetchedAt: Date;
  url: string;
  hasRemoteApplications?: boolean;
  linkedinJobId?: string;
  linkedinCompanyId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<IJob>(
  {
    externalId: { type: String, required: true, index: true },
    source: { type: String, required: true, index: true },
    title: { type: String, required: true, index: "text" },
    company: {
      name: { type: String, required: true, index: "text" },
      logo: String,
      website: String,
      linkedinUrl: String,
    },
    location: { type: String, index: true },
    workplaceType: {
      type: String,
      enum: ["remote", "hybrid", "onsite"],
      index: true,
    },
    employmentType: {
      type: String,
      enum: ["full-time", "part-time", "contract", "internship", "freelance"],
      index: true,
    },
    experienceLevel: {
      type: String,
      enum: ["entry", "junior", "mid-level", "senior", "lead"],
      index: true,
    },
    description: { type: String, required: true, index: "text" },
    responsibilities: [String],
    requirements: [String],
    skills: [{ type: String, index: true }],
    salary: {
      min: Number,
      max: Number,
      currency: { type: String, default: "USD" },
    },
    publishedAt: { type: Date, required: true, index: true },
    fetchedAt: { type: Date, default: Date.now },
    url: { type: String, required: true },
    hasRemoteApplications: { type: Boolean, default: false },
    linkedinJobId: { type: String, index: true, sparse: true },
    linkedinCompanyId: { type: String, index: true, sparse: true },
  },
  {
    timestamps: true,
  }
);

jobSchema.index({ source: 1, externalId: 1 }, { unique: true });
jobSchema.index({ publishedAt: -1 });
jobSchema.index({ "company.name": 1, title: 1 });

export const Job = mongoose.models.Job || mongoose.model<IJob>("Job", jobSchema);