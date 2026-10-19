import { z } from "zod";

export const RegisterSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").max(50),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const ProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  phone: z.string().optional(),
  location: z.string().optional(),
  university: z.string().optional(),
  degree: z.string().optional(),
  graduationYear: z.coerce.number().min(1980).max(2035).optional(),
  experienceLevel: z.enum(["Entry", "Mid", "Senior"]).optional(),
  preferredRole: z.string().optional(),
  preferredLocations: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  bio: z.string().max(500, "Bio must be under 500 characters").optional(),
});

export const ApplicationInputSchema = z.object({
  company: z.string().min(1, "Company name is required").max(120),
  jobTitle: z.string().min(1, "Job title is required").max(120),
  location: z.string().max(120).optional().or(z.literal("")),
  jobType: z
    .enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "OTHER"])
    .default("FULL_TIME"),
  jobUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  salary: z.string().max(100).optional().or(z.literal("")),
  appliedDate: z.coerce.date().optional(),
  status: z
    .enum(["SAVED", "APPLIED", "SCREENING", "INTERVIEW", "OFFER", "REJECTED"])
    .default("APPLIED"),
  notes: z.string().max(3000).optional().or(z.literal("")),
  interviewDate: z.coerce.date().optional().nullable(),
  source: z.string().max(100).optional().or(z.literal("")),
});

export const ApplicationUpdateSchema = ApplicationInputSchema.partial();

export const InterviewQuestionsRequestSchema = z.object({
  sessionType: z
    .enum(["GENERAL", "TECHNICAL", "BEHAVIORAL", "JOB_SPECIFIC"])
    .default("GENERAL"),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).default("MEDIUM"),
  applicationId: z.string().optional(),
  jobTitle: z.string().optional(),
  company: z.string().optional(),
  jobDescription: z.string().optional(),
});

export const InterviewEvaluateAnswerSchema = z.object({
  question: z.string().min(3, "Question is required"),
  userAnswer: z.string().min(5, "Please enter an answer with at least 5 characters"),
  category: z.string().default("General"),
  expectedFocus: z.string().optional(),
});

export const InterviewSaveSessionSchema = z.object({
  applicationId: z.string().optional().nullable(),
  jobTitle: z.string().optional(),
  company: z.string().optional(),
  sessionType: z.enum(["GENERAL", "TECHNICAL", "BEHAVIORAL", "JOB_SPECIFIC"]),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).default("MEDIUM"),
  questions: z.array(
    z.object({
      questionId: z.string(),
      question: z.string(),
      category: z.string(),
      expectedFocus: z.string().optional(),
      userAnswer: z.string().optional(),
      evaluation: z
        .object({
          score: z.number().min(0).max(100),
          strengths: z.array(z.string()).default([]),
          weaknesses: z.array(z.string()).default([]),
          feedback: z.string(),
          improvedAnswer: z.string().optional(),
        })
        .optional(),
    })
  ),
  overallScore: z.number().min(0).max(100).optional(),
  overallFeedback: z.string().optional(),
  strengths: z.array(z.string()).default([]),
  weaknesses: z.array(z.string()).default([]),
  recommendations: z.array(z.string()).default([]),
});

