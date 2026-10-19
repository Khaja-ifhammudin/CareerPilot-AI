import React from "react";
import Link from "next/link";
import {
  User,
  FileText,
  BrainCircuit,
  Target,
  Briefcase,
  Bot,
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CareerWorkflowProps {
  profileCompleted: boolean;
  profilePercentage: number;
  resumeUploaded?: boolean;
  resumeAnalyzed?: boolean;
  applicationCount?: number;
  interviewCount?: number;
}

export function CareerWorkflow({
  profileCompleted,
  profilePercentage,
  resumeUploaded = false,
  resumeAnalyzed = false,
  applicationCount = 0,
  interviewCount = 0,
}: CareerWorkflowProps) {
  const steps = [
    {
      step: 1,
      title: "Career Profile",
      status: profileCompleted ? "Completed" : "In Progress",
      badgeVariant: profileCompleted ? "success" : "default",
      description: `${profilePercentage}% complete`,
      icon: User,
      href: "/profile",
      isLive: true,
    },
    {
      step: 2,
      title: "Upload Resume",
      status: resumeUploaded ? "Uploaded" : "Next Step",
      badgeVariant: resumeUploaded ? "success" : "purple",
      description: "PDF Parser (Stage 4)",
      icon: FileText,
      href: "/resume",
      isLive: true,
    },
    {
      step: 3,
      title: "AI Analysis",
      status: resumeAnalyzed ? "Completed" : resumeUploaded ? "Ready" : "Pending",
      badgeVariant: resumeAnalyzed ? "success" : resumeUploaded ? "purple" : "secondary",
      description: "Gemini ATS Audit (Stage 4)",
      icon: BrainCircuit,
      href: "/resume",
      isLive: true,
    },
    {
      step: 4,
      title: "Job Matching",
      status: "Active",
      badgeVariant: "purple",
      description: "Match Engine (Stage 4)",
      icon: Target,
      href: "/job-matcher",
      isLive: true,
    },
    {
      step: 5,
      title: "Applications",
      status: applicationCount > 0 ? `${applicationCount} Tracked` : "Active",
      badgeVariant: applicationCount > 0 ? "success" : "purple",
      description: "Pipeline Tracking (Stage 5)",
      icon: Briefcase,
      href: "/applications",
      isLive: true,
    },
    {
      step: 6,
      title: "Interview Prep",
      status: interviewCount > 0 ? `${interviewCount} Sessions` : "Ready",
      badgeVariant: interviewCount > 0 ? "success" : "purple",
      description: "STAR Simulator (Stage 5)",
      icon: Bot,
      href: "/interview-prep",
      isLive: true,
    },
    {
      step: 7,
      title: "Job Offer",
      status: "Final Goal",
      badgeVariant: "secondary",
      description: "Career Launch",
      icon: Award,
      href: "/dashboard",
      isLive: false,
    },
  ];

  return (
    <Card className="glass-card border-slate-800">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Career Progression Roadmap</span>
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Track your journey from profile setup to landing your dream tech offer
            </CardDescription>
          </div>
          <Badge variant="default" className="text-xs w-fit">
            Stages 1-5 Active
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-2">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                href={item.href}
                className="group p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-slate-500 font-bold">
                      0{item.step}
                    </span>
                    <Icon className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-400 transition-colors" />
                  </div>
                  <div className="text-xs font-semibold text-white group-hover:text-blue-300 transition-colors">
                    {item.title}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 leading-tight">
                    {item.description}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/60">
                  <span
                    className={`inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      item.status === "Completed"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : item.status === "Next Step" || item.status === "In Progress"
                        ? "bg-blue-500/20 text-blue-300 border border-blue-500/30 animate-pulse"
                        : "bg-slate-800/60 text-slate-500"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
