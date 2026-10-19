import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISkillGapItem {
  skill: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  reason: string;
  learningDirection: string;
}

export interface ISkillProfileDocument extends Document {
  userId: mongoose.Types.ObjectId;
  targetRole: string;
  currentSkills: string[];
  requiredSkills: string[];
  matchedSkills: string[];
  skillGaps: ISkillGapItem[];
  recommendations: string[];
  createdAt: Date;
  updatedAt: Date;
}

const SkillGapItemSchema = new Schema<ISkillGapItem>(
  {
    skill: { type: String, required: true, trim: true },
    priority: {
      type: String,
      enum: ["HIGH", "MEDIUM", "LOW"],
      required: true,
      default: "MEDIUM",
    },
    reason: { type: String, required: true },
    learningDirection: { type: String, required: true },
  },
  { _id: false }
);

const SkillProfileSchema = new Schema<ISkillProfileDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    targetRole: {
      type: String,
      required: [true, "Target role is required"],
      trim: true,
    },
    currentSkills: [{ type: String, trim: true }],
    requiredSkills: [{ type: String, trim: true }],
    matchedSkills: [{ type: String, trim: true }],
    skillGaps: [SkillGapItemSchema],
    recommendations: [{ type: String, trim: true }],
  },
  {
    timestamps: true,
  }
);

SkillProfileSchema.index({ userId: 1, targetRole: 1 });

const SkillProfile: Model<ISkillProfileDocument> =
  mongoose.models.SkillProfile ||
  mongoose.model<ISkillProfileDocument>("SkillProfile", SkillProfileSchema);

export default SkillProfile;
