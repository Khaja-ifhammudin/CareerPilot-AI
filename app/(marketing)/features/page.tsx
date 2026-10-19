import React from "react";
import Link from "next/link";
import {
  FileText,
  Target,
  Briefcase,
  Bot,
  BrainCircuit,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle,
  BarChart,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";

export const metadata = {
  title: "Features — Career Intelligence Platform",
  description:
    "Explore CareerPilot AI's comprehensive suite of tools for resume analysis, ATS optimization, application tracking, and interview preparation.",
};

export default function FeaturesPage() {
  const features = [
    {
      title: "AI Resume & ATS Parser",
      badge: "Gemini 1.5",
      icon: FileText,
      description:
        "Deep multi-point audit comparing candidate bullet points against high-scoring ATS formatting, action verbs, and quantifiable metrics.",
      benefits: [
        "Instant overall ATS score out of 100",
        "Technical vs soft skills segmentation",
        "Missing keyword detection with context",
        "Bullet-by-bullet enhancement suggestions",
      ],
    },
    {
      title: "Job Description Analyzer",
      badge: "Keyword Engine",
      icon: Search,
      description:
        "Paste any raw job posting from LinkedIn, Indeed, or company career boards to extract critical requirements in seconds.",
      benefits: [
        "Separation of required vs preferred qualifications",
        "Years of experience & education constraints",
        "Key tech stack libraries and frameworks",
        "One-click sync with your skill profile",
      ],
    },
    {
      title: "AI Job Matcher",
      badge: "Compatibility",
      icon: Target,
      description:
        "Calculates multi-dimensional compatibility percentages between your resume and specific open roles.",
      benefits: [
        "Skills match percentage breakdown",
        "Experience & education alignment ratings",
        "Tailored suggestions to close remaining gaps",
        "Honest, transparent AI-driven estimates",
      ],
    },
    {
      title: "Application Pipeline Tracker",
      badge: "Full CRUD",
      icon: Briefcase,
      description:
        "Manage every job application across 6 lifecycle stages with interview reminders, notes, and salary logs.",
      benefits: [
        "Saved, Applied, Screening, Interview, Offer, Rejected stages",
        "Real-time search and filter controls",
        "Upcoming interview date alerts",
        "Salary range tracking and negotiation notes",
      ],
    },
    {
      title: "AI Mock Interview Prep",
      badge: "STAR Method",
      icon: Bot,
      description:
        "Interactive interview simulator creating role-specific behavioral, technical, and HR questions with instant evaluation.",
      benefits: [
        "Difficulty adjustment from Entry to Senior",
        "Rubrics based on real technical hiring bars",
        "Instant scoring on strengths and weaknesses",
        "Sample model answers to guide improvement",
      ],
    },
    {
      title: "Skill Gap Matrix",
      badge: "Career Radar",
      icon: TrendingUp,
      description:
        "Target your ideal job title and receive an actionable learning roadmap showing missing high-impact technical skills.",
      benefits: [
        "Current skills vs industry benchmarks",
        "Priority tagging (High, Medium, Low)",
        "Direct rationale for why the skill matters",
        "Curated learning resource directions",
      ],
    },
  ];

  return (
    <div className="py-20 bg-[#090d16]">
      <Container>
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <Badge variant="default">Comprehensive Feature Suite</Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Engineered to Land Your Dream Role
          </h1>
          <p className="text-slate-400 text-base leading-relaxed">
            Every feature in CareerPilot AI is connected. Insights from your resume inform your job matching, which drives your interview preparation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                      <Icon className="h-5 w-5" />
                    </div>
                    <Badge variant="purple">{f.badge}</Badge>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {f.description}
                  </p>
                  <div className="space-y-2 border-t border-slate-800/80 pt-4">
                    {f.benefits.map((b) => (
                      <div key={b} className="flex items-start gap-2 text-xs text-slate-300">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <Link href="/register">
            <Button size="lg" variant="gradient" className="gap-2 px-8">
              <span>Start Exploring Features</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </Container>
    </div>
  );
}
