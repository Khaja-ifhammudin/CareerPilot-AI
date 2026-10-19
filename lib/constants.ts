export const APP_CONFIG = {
  name: "CareerPilot AI",
  tagline: "Your AI-powered career companion.",
  description:
    "Analyze your resume, discover skill gaps, match your profile with opportunities, track applications, and prepare for interviews — all in one place.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  version: "1.0.0",
};

export const NAV_LINKS = [
  { label: "Features", href: "/#features" },
  { label: "How It Works", href: "/#workflow" },
  { label: "AI Capabilities", href: "/#ai-capabilities" },
  { label: "Preview", href: "/#preview" },
];

export const APPLICATION_STATUSES = [
  { value: "Saved", label: "Saved", color: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
  { value: "Applied", label: "Applied", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  { value: "Screening", label: "Screening", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  { value: "Interview", label: "Interview", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  { value: "Offer", label: "Offer", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  { value: "Rejected", label: "Rejected", color: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
] as const;

export const INTERVIEW_TYPES = [
  { value: "Technical", label: "Technical Interview" },
  { value: "HR", label: "HR / Culture Fit" },
  { value: "Behavioral", label: "Behavioral (STAR Method)" },
  { value: "Mixed", label: "Comprehensive (Mixed)" },
] as const;

export const EXPERIENCE_LEVELS = [
  { value: "Entry", label: "Entry Level / New Grad (0-2 yrs)" },
  { value: "Mid", label: "Mid Level (2-5 yrs)" },
  { value: "Senior", label: "Senior Level (5+ yrs)" },
] as const;
