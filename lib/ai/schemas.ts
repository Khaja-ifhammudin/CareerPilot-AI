import { z } from "zod";

/**
 * 1. Resume Analysis Output Schema
 */
export const ResumeAnalysisSchema = z.object({
  overallScore: z.number().min(0).max(100),
  atsReadinessScore: z.number().min(0).max(100),
  professionalSummary: z.string().default(""),
  detectedName: z.string().nullable().default(null),
  detectedEmail: z.string().nullable().default(null),
  detectedPhone: z.string().nullable().default(null),
  technicalSkills: z.array(z.string()).default([]),
  softSkills: z.array(z.string()).default([]),
  strengths: z.array(z.string()).default([]),
  weaknesses: z.array(z.string()).default([]),
  missingSkills: z.array(z.string()).default([]),
  experienceSummary: z.string().default(""),
  educationSummary: z.string().default(""),
  projects: z
    .array(
      z.object({
        name: z.string(),
        description: z.string(),
        technologies: z.array(z.string()).optional().default([]),
      })
    )
    .default([]),
  certifications: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
  recommendations: z.array(z.string()).default([]),
  isFallback: z.boolean().optional(),
  fallbackReason: z.string().optional(),
});

export type ResumeAnalysisOutput = z.infer<typeof ResumeAnalysisSchema>;

/**
 * 2. Job Description Analysis Output Schema
 */
export const JobAnalysisSchema = z.object({
  jobTitle: z.string().default("Unknown Role"),
  company: z.string().nullable().default(null),
  location: z.string().nullable().default(null),
  seniority: z.string().default("Entry / Mid Level"),
  summary: z.string().default(""),
  experienceRequirements: z.string().default(""),
  educationRequirements: z.string().default(""),
  requiredTechnicalSkills: z.array(z.string()).default([]),
  preferredSkills: z.array(z.string()).default([]),
  softSkills: z.array(z.string()).default([]),
  responsibilities: z.array(z.string()).default([]),
  importantKeywords: z.array(z.string()).default([]),
  technologies: z.array(z.string()).default([]),
  isFallback: z.boolean().optional(),
  fallbackReason: z.string().optional(),
});

export type JobAnalysisOutput = z.infer<typeof JobAnalysisSchema>;

/**
 * 3. AI Job Match Output Schema
 */
export const JobMatchSchema = z.object({
  overallCompatibilityScore: z.number().min(0).max(100),
  skillsMatchScore: z.number().min(0).max(100),
  experienceMatchScore: z.number().min(0).max(100),
  educationMatchScore: z.number().min(0).max(100),
  keywordMatchScore: z.number().min(0).max(100),
  matchedSkills: z.array(z.string()).default([]),
  missingSkills: z.array(z.string()).default([]),
  strengths: z.array(z.string()).default([]),
  potentialConcerns: z.array(z.string()).default([]),
  recommendations: z.array(z.string()).default([]),
  isResumeBased: z.boolean().default(false),
  matchSummary: z.string().default(""),
  isFallback: z.boolean().optional(),
  fallbackReason: z.string().optional(),
});

export type JobMatchOutput = z.infer<typeof JobMatchSchema>;

/**
 * 4. Skill Gap Analysis Output Schema
 */
export const SkillGapSchema = z.object({
  targetRole: z.string(),
  currentSkills: z.array(z.string()).default([]),
  requiredSkills: z.array(z.string()).default([]),
  matchedSkills: z.array(z.string()).default([]),
  skillGaps: z
    .array(
      z.object({
        skill: z.string(),
        priority: z.enum(["HIGH", "MEDIUM", "LOW"]),
        reason: z.string(),
        learningDirection: z.string(),
      })
    )
    .default([]),
  actionableRecommendations: z.array(z.string()).default([]),
  isFallback: z.boolean().optional(),
  fallbackReason: z.string().optional(),
});

export type SkillGapOutput = z.infer<typeof SkillGapSchema>;

/**
 * 5. AI Interview Question Generation Schemas
 */
export const InterviewQuestionItemSchema = z.object({
  questionId: z.string(),
  question: z.string(),
  category: z.string(),
  expectedFocus: z.string().default(""),
});

export const InterviewQuestionsOutputSchema = z.object({
  questions: z.array(InterviewQuestionItemSchema).min(1),
  isFallback: z.boolean().optional(),
  fallbackReason: z.string().optional(),
});

export type InterviewQuestionItem = z.infer<typeof InterviewQuestionItemSchema>;
export type InterviewQuestionsOutput = z.infer<typeof InterviewQuestionsOutputSchema>;

/**
 * 6. AI Interview Answer Evaluation Schema
 */
export const InterviewAnswerEvaluationSchema = z.object({
  score: z.number().min(0).max(100),
  strengths: z.array(z.string()).default([]),
  weaknesses: z.array(z.string()).default([]),
  feedback: z.string(),
  improvedAnswer: z.string().default(""),
  isFallback: z.boolean().optional(),
  fallbackReason: z.string().optional(),
});

export type InterviewAnswerEvaluationOutput = z.infer<
  typeof InterviewAnswerEvaluationSchema
>;

/**
 * 7. AI Interview Session Final Evaluation Schema
 */
export const InterviewSessionEvaluationSchema = z.object({
  overallScore: z.number().min(0).max(100),
  overallFeedback: z.string(),
  strengths: z.array(z.string()).default([]),
  weaknesses: z.array(z.string()).default([]),
  recommendations: z.array(z.string()).default([]),
  isFallback: z.boolean().optional(),
  fallbackReason: z.string().optional(),
});

export type InterviewSessionEvaluationOutput = z.infer<
  typeof InterviewSessionEvaluationSchema
>;

