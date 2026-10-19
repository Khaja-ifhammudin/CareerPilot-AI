export type UserRole = "USER" | "ADMIN";

export interface UserProfile {
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
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  profile?: UserProfile;
  createdAt: Date;
  updatedAt: Date;
}

export type ApplicationStatus =
  | "Saved"
  | "Applied"
  | "Screening"
  | "Interview"
  | "Offer"
  | "Rejected";

export interface IApplication {
  _id: string;
  userId: string;
  company: string;
  jobTitle: string;
  location?: string;
  jobType?: "Full-Time" | "Part-Time" | "Contract" | "Internship" | "Remote";
  jobUrl?: string;
  salaryRange?: string;
  appliedDate: Date;
  status: ApplicationStatus;
  notes?: string;
  interviewDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IResumeAnalysis {
  overallScore: number;
  atsReadinessScore: number;
  technicalSkills: string[];
  softSkills: string[];
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
  experienceQuality: string;
  educationEvaluation: string;
  recommendations: string[];
}

export interface IResume {
  _id: string;
  userId: string;
  fileName: string;
  fileSize: number;
  fileUrl?: string;
  extractedText: string;
  score?: number;
  analysis?: IResumeAnalysis;
  createdAt: Date;
  updatedAt: Date;
}

export interface IJobAnalysis {
  _id: string;
  userId: string;
  jobTitle: string;
  company?: string;
  location?: string;
  rawDescription: string;
  requiredSkills: string[];
  preferredSkills: string[];
  experienceYears?: string;
  education?: string;
  responsibilities: string[];
  keywords: string[];
  createdAt: Date;
}

export interface IJobMatch {
  overallMatch: number;
  skillsMatch: number;
  experienceMatch: number;
  educationMatch: number;
  keywordsMatch: number;
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export type InterviewType = "Technical" | "HR" | "Behavioral" | "Mixed";

export interface IInterviewQuestion {
  id: string;
  question: string;
  category: string;
  difficulty: "Entry" | "Mid" | "Senior";
  evaluatingCriteria: string;
  hint?: string;
}

export interface IInterviewAnswerEvaluation {
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  improvedAnswerGuidance: string;
}

export interface IInterviewSession {
  _id: string;
  userId: string;
  targetRole: string;
  experienceLevel: string;
  type: InterviewType;
  questions: IInterviewQuestion[];
  answers: Record<string, string>;
  evaluations: Record<string, IInterviewAnswerEvaluation>;
  overallScore?: number;
  createdAt: Date;
}

export interface ISkillProfile {
  _id: string;
  userId: string;
  targetRole: string;
  currentSkills: string[];
  matchedSkills: string[];
  skillGaps: {
    skill: string;
    priority: "High" | "Medium" | "Low";
    reason: string;
    learningDirection: string;
  }[];
  recommendations: string[];
  updatedAt: Date;
}
