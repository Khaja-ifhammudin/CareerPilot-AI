import mongoose, { Schema, Document, Model } from "mongoose";

export type UserRole = "USER" | "ADMIN";

export interface IUserDocument extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  profile?: {
    phone?: string;
    location?: string;
    university?: string;
    degree?: string;
    graduationYear?: number;
    experienceLevel?: "Entry" | "Mid" | "Senior";
    preferredRole?: string;
    preferredLocations?: string[];
    skills?: string[];
    bio?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, "Password hash is required"],
    },
    role: {
      type: String,
      enum: {
        values: ["USER", "ADMIN"],
        message: "{VALUE} is not a valid role",
      },
      default: "USER",
      index: true,
    },
    profile: {
      phone: { type: String, trim: true },
      location: { type: String, trim: true },
      university: { type: String, trim: true },
      degree: { type: String, trim: true },
      graduationYear: { type: Number },
      experienceLevel: {
        type: String,
        enum: ["Entry", "Mid", "Senior"],
        default: "Entry",
      },
      preferredRole: { type: String, trim: true },
      preferredLocations: [{ type: String, trim: true }],
      skills: [{ type: String, trim: true }],
      bio: { type: String, maxlength: [1000, "Bio cannot exceed 1000 characters"] },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete (ret as Record<string, unknown>).passwordHash;
        delete (ret as Record<string, unknown>).__v;
        return ret;
      },
    },
  }
);

// Prevent model overwrite in development hot reloading
const User: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>("User", UserSchema);

export default User;
