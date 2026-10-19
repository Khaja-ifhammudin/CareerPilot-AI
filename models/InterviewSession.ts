import mongoose, { Schema, Document, Model } from "mongoose";

export type SessionType =
  | "GENERAL"
  | "TECHNICAL"
  | "BEHAVIORAL"
  | "JOB_SPECIFIC";

export type DifficultyLevel = "EASY" | "MEDIUM" | "HARD";

export interface IQuestionEvaluation {
  score: number;
  strengths: string[];
  weaknesses: string[];
  feedback: string;
  improvedAnswer?: string;
}

export interface IInterviewQuestion {
  questionId: string;
  question: string;
  category: string;
  expectedFocus?: string;
  userAnswer?: string;
  evaluation?: IQuestionEvaluation;
}

export interface IInterviewSession extends Document {
  userId: mongoose.Types.ObjectId;
  applicationId?: mongoose.Types.ObjectId;
  jobTitle?: string;
  company?: string;
  sessionType: SessionType;
  difficulty: DifficultyLevel;
  questions: IInterviewQuestion[];
  overallScore?: number;
  overallFeedback?: string;
  strengths?: string[];
  weaknesses?: string[];
  recommendations?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const QuestionEvaluationSchema = new Schema<IQuestionEvaluation>(
  {
    score: { type: Number, required: true, min: 0, max: 100 },
    strengths: { type: [String], default: [] },
    weaknesses: { type: [String], default: [] },
    feedback: { type: String, required: true },
    improvedAnswer: { type: String },
  },
  { _id: false }
);

const InterviewQuestionSchema = new Schema<IInterviewQuestion>(
  {
    questionId: { type: String, required: true },
    question: { type: String, required: true },
    category: { type: String, required: true },
    expectedFocus: { type: String },
    userAnswer: { type: String },
    evaluation: { type: QuestionEvaluationSchema },
  },
  { _id: false }
);

const InterviewSessionSchema = new Schema<IInterviewSession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: "Application",
    },
    jobTitle: {
      type: String,
      trim: true,
      maxlength: 120,
    },
    company: {
      type: String,
      trim: true,
      maxlength: 120,
    },
    sessionType: {
      type: String,
      enum: ["GENERAL", "TECHNICAL", "BEHAVIORAL", "JOB_SPECIFIC"],
      default: "GENERAL",
      index: true,
    },
    difficulty: {
      type: String,
      enum: ["EASY", "MEDIUM", "HARD"],
      default: "MEDIUM",
    },
    questions: {
      type: [InterviewQuestionSchema],
      default: [],
    },
    overallScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    overallFeedback: {
      type: String,
    },
    strengths: {
      type: [String],
      default: [],
    },
    weaknesses: {
      type: [String],
      default: [],
    },
    recommendations: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

InterviewSessionSchema.index({ userId: 1, createdAt: -1 });
InterviewSessionSchema.index({ userId: 1, sessionType: 1 });

const InterviewSession: Model<IInterviewSession> =
  mongoose.models.InterviewSession ||
  mongoose.model<IInterviewSession>("InterviewSession", InterviewSessionSchema);

export default InterviewSession;
