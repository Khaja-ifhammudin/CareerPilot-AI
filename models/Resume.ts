import mongoose, { Schema, Document, Model } from "mongoose";

export type AnalysisStatus =
  | "NOT_ANALYZED"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED";

export interface IResumeDocument extends Document {
  userId: mongoose.Types.ObjectId;
  originalFileName: string;
  storedFileName: string;
  fileSize: number;
  mimeType: string;
  storagePath: string;
  extractedText: string;
  analysisStatus: AnalysisStatus;
  analysisResult?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const ResumeSchema = new Schema<IResumeDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    originalFileName: {
      type: String,
      required: [true, "Original filename is required"],
      trim: true,
    },
    storedFileName: {
      type: String,
      required: [true, "Stored filename is required"],
      trim: true,
    },
    fileSize: {
      type: Number,
      required: [true, "File size is required"],
    },
    mimeType: {
      type: String,
      default: "application/pdf",
    },
    storagePath: {
      type: String,
      required: [true, "Storage path is required"],
    },
    extractedText: {
      type: String,
      default: "",
    },
    analysisStatus: {
      type: String,
      enum: {
        values: ["NOT_ANALYZED", "PROCESSING", "COMPLETED", "FAILED"],
        message: "{VALUE} is not a valid analysis status",
      },
      default: "NOT_ANALYZED",
      index: true,
    },
    analysisResult: {
      type: Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent multiple duplicate resumes per user if single active resume is preferred, or index for fast queries
ResumeSchema.index({ userId: 1, createdAt: -1 });

const Resume: Model<IResumeDocument> =
  mongoose.models.Resume || mongoose.model<IResumeDocument>("Resume", ResumeSchema);

export default Resume;
