import mongoose, { Schema, Document, Model } from "mongoose";

export type ApplicationStatus =
  | "SAVED"
  | "APPLIED"
  | "SCREENING"
  | "INTERVIEW"
  | "OFFER"
  | "REJECTED";

export type JobType =
  | "FULL_TIME"
  | "PART_TIME"
  | "CONTRACT"
  | "INTERNSHIP"
  | "OTHER";

export interface IApplication extends Document {
  userId: mongoose.Types.ObjectId;
  company: string;
  jobTitle: string;
  location?: string;
  jobType: JobType;
  jobUrl?: string;
  salary?: string;
  appliedDate?: Date | null;
  status: ApplicationStatus;
  notes?: string;
  interviewDate?: Date | null;
  source?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      maxlength: [120, "Company name cannot exceed 120 characters"],
    },
    jobTitle: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
      maxlength: [120, "Job title cannot exceed 120 characters"],
    },
    location: {
      type: String,
      trim: true,
      maxlength: [120, "Location cannot exceed 120 characters"],
    },
    jobType: {
      type: String,
      enum: ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "OTHER"],
      default: "FULL_TIME",
    },
    jobUrl: {
      type: String,
      trim: true,
      maxlength: [1000, "URL cannot exceed 1000 characters"],
    },
    salary: {
      type: String,
      trim: true,
      maxlength: [100, "Salary cannot exceed 100 characters"],
    },
    appliedDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["SAVED", "APPLIED", "SCREENING", "INTERVIEW", "OFFER", "REJECTED"],
      default: "APPLIED",
      index: true,
    },
    notes: {
      type: String,
      maxlength: [3000, "Notes cannot exceed 3000 characters"],
    },
    interviewDate: {
      type: Date,
    },
    source: {
      type: String,
      trim: true,
      maxlength: [100, "Source cannot exceed 100 characters"],
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for user-scoped queries and analytics
ApplicationSchema.index({ userId: 1, status: 1 });
ApplicationSchema.index({ userId: 1, appliedDate: -1 });
ApplicationSchema.index({ userId: 1, company: 1 });

const Application: Model<IApplication> =
  mongoose.models.Application ||
  mongoose.model<IApplication>("Application", ApplicationSchema);

export default Application;
