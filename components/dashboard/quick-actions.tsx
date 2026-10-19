import React from "react";
import Link from "next/link";
import {
  FileText,
  Search,
  Briefcase,
  Bot,
  TrendingUp,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export function QuickActions() {
  const actions = [
    {
      title: "Upload & Audit Resume",
      description: "Extract text, compute ATS readiness, and get bullet point improvements.",
      href: "/resume",
      icon: FileText,
      accentColor: "from-blue-600/20 to-blue-500/5 text-blue-400 border-blue-500/20",
    },
    {
      title: "Analyze Job Posting",
      description: "Paste a job description to extract required skills, keywords, and stack.",
      href: "/job-analysis",
      icon: Search,
      accentColor: "from-indigo-600/20 to-indigo-500/5 text-indigo-400 border-indigo-500/20",
    },
    {
      title: "Track Application",
      description: "Log application stages, recruiter interview dates, and salary notes.",
      href: "/applications",
      icon: Briefcase,
      accentColor: "from-emerald-600/20 to-emerald-500/5 text-emerald-400 border-emerald-500/20",
    },
    {
      title: "Practice AI Interview",
      description: "Simulate technical and behavioral questions with instant STAR evaluations.",
      href: "/interview-prep",
      icon: Bot,
      accentColor: "from-purple-600/20 to-purple-500/5 text-purple-400 border-purple-500/20",
    },
    {
      title: "Detect Skill Gaps",
      description: "Benchmark your profile against target roles to see what you need to learn.",
      href: "/skills",
      icon: TrendingUp,
      accentColor: "from-amber-600/20 to-amber-500/5 text-amber-400 border-amber-500/20",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-400" />
            <span>Quick Career Actions</span>
          </h2>
          <p className="text-xs text-slate-400">
            Select a career accelerator tool to take your next step
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <Link key={act.title} href={act.href} className="group block">
              <Card className="glass-card border-slate-800 transition-all hover:border-blue-500/30 hover:scale-[1.01] h-full flex flex-col justify-between">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`h-9 w-9 rounded-xl border bg-gradient-to-br flex items-center justify-center ${act.accentColor}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <CardTitle className="text-sm font-bold text-white">
                    {act.title}
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400 leading-relaxed mt-1">
                    {act.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
