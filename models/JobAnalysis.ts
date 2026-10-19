import mongoose, { Schema, Document, Model } from "mongoose";

export interface IJobAnalysisDocument extends Document {
  userId: mongoose.Types.ObjectId;
  jobTitle: string;
  company: string;
  location: string;
  jobUrl?: string;
  rawDescription: string;
  analysis: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const JobAnalysisSchema = new Schema<IJobAnalysisDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    jobTitle: {
      type: String,
      default: "Untitled Position",
      trim: true,
    },
    company: {
      type: String,
      default: "Unknown Company",
      trim: true,
    },
    location: {
      type: String,
      default: "Unknown Location",
      trim: true,
    },
    jobUrl: {
      type: String,
      trim: true,
    },
    rawDescription: {
      type: String,
      required: [true, "Raw job description is required"],
    },
    analysis: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

JobAnalysisSchema.index({ userId: 1, createdAt: -1 });

const JobAnalysis: Model<IJobAnalysisDocument> =
  mongoose.models.JobAnalysis ||
  mongoose.model<IJobAnalysisDocument>("JobAnalysis", JobAnalysisSchema);

export default JobAnalysis;
