import "server-only";
import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  linkedinId: string;
  email: string;
  name: string;
  image?: string;
  headline?: string;
  location?: string;
  accessToken: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  profileData?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    linkedinId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    image: String,
    headline: String,
    location: String,
    accessToken: { type: String, required: true },
    refreshToken: String,
    tokenExpiresAt: Date,
    profileData: Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema);