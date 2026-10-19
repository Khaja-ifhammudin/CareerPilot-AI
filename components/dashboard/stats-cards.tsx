import React from "react";
import Link from "next/link";
import {
  FileText,
  Briefcase,
  Bot,
  Award,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface StatsCardsProps {
  resumeScore?: number | null;
  resumeStatus?: "NOT_UPLOADED" | "NOT_ANALYZED" | "PROCESSING" | "COMPLETED" | "FAILED";
  applicationCount: number;
  interviewCount: number;
  offerCount: number;
}

export function StatsCards({
  resumeScore,
  resumeStatus = "NOT_UPLOADED",
  applicationCount,
  interviewCount,
  offerCount,
}: StatsCardsProps) {
  let resumeValue = "Not analyzed yet";
  let resumeSubtitle = "Upload PDF to score";
  let resumePending = true;

  if (resumeStatus === "COMPLETED" && resumeScore !== null && resumeScore !== undefined) {
    resumeValue = `${resumeScore} / 100`;
    resumeSubtitle = "ATS Evaluation Active";
    resumePending = false;
  } else if (resumeStatus === "PROCESSING") {
    resumeValue = "Analyzing...";
    resumeSubtitle = "Gemini processing resume";
    resumePending = false;
  } else if (resumeStatus === "NOT_ANALYZED") {
    resumeValue = "Resume uploaded";
    resumeSubtitle = "Ready for AI analysis";
    resumePending = false;
  }

  const stats = [
    {
      title: "Resume Score",
      value: resumeValue,
      subtitle: resumeSubtitle,
      icon: FileText,
      href: "/resume",
      isPending: resumePending,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10 border-blue-500/20",
    },
    {
      title: "Applications Tracked",
      value: `${applicationCount}`,
      subtitle: applicationCount === 0 ? "0 active applications" : `${applicationCount} total submitted`,
      icon: Briefcase,
      href: "/applications",
      isPending: applicationCount === 0,
      color: "text-indigo-400",
      bgColor: "bg-indigo-500/10 border-indigo-500/20",
    },
    {
      title: "Upcoming Interviews",
      value: `${interviewCount}`,
      subtitle: interviewCount === 0 ? "0 scheduled interviews" : `${interviewCount} interview rounds`,
      icon: Bot,
      href: "/interview-prep",
      isPending: interviewCount === 0,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10 border-purple-500/20",
    },
    {
      title: "Job Offers",
      value: `${offerCount}`,
      subtitle: offerCount === 0 ? "0 offers recorded" : `${offerCount} offers received`,
      icon: Award,
      href: "/applications",
      isPending: offerCount === 0,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10 border-emerald-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((item) => {
        const Icon = item.icon;
        return (
          <Link key={item.title} href={item.href} className="group block">
            <Card className="glass-card border-slate-800 transition-all hover:border-slate-700 h-full flex flex-col justify-between">
              <CardContent className="p-5 flex flex-col justify-between h-full">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">
                    {item.title}
                  </span>
                  <div
                    className={`h-9 w-9 rounded-xl border flex items-center justify-center ${item.bgColor}`}
                  >
                    <Icon className={`h-4 w-4 ${item.color}`} />
                  </div>
                </div>

                <div className="mt-3">
                  <div className="text-2xl font-bold tracking-tight text-white flex items-baseline gap-2">
                    <span>{item.value}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
                    <span>{item.subtitle}</span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-white transition-colors" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
