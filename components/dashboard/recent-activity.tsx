import React from "react";
import Link from "next/link";
import {
  Activity,
  FileText,
  Briefcase,
  Bot,
  Award,
  ArrowRight,
  Clock,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface ActivityItem {
  id: string;
  type: "RESUME" | "APPLICATION" | "INTERVIEW";
  title: string;
  subtitle: string;
  date: string;
  href: string;
}

interface RecentActivityProps {
  activities?: ActivityItem[];
}

export function RecentActivity({ activities = [] }: RecentActivityProps) {
  const getIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "RESUME":
        return <FileText className="h-4 w-4 text-blue-400" />;
      case "APPLICATION":
        return <Briefcase className="h-4 w-4 text-emerald-400" />;
      case "INTERVIEW":
        return <Bot className="h-4 w-4 text-purple-400" />;
    }
  };

  return (
    <Card className="glass-card border-slate-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-400" />
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Real-time audit log of your applications, resume audits, and mock interviews
            </CardDescription>
          </div>
          {activities.length > 0 && (
            <Badge variant="outline" className="text-[10px]">
              {activities.length} Recorded
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {activities.length === 0 ? (
          /* Honest empty state */
          <div className="py-10 px-4 text-center rounded-xl bg-slate-900/40 border border-slate-800/80 flex flex-col items-center justify-center space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Clock className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-white">
                No career activity yet
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                You haven&apos;t added any job applications or scanned a resume yet. Begin by uploading your resume or completing your profile.
              </p>
            </div>
            <div className="pt-2 flex flex-wrap gap-2 justify-center">
              <Link href="/resume">
                <Button size="sm" variant="gradient" className="gap-1.5 text-xs">
                  <FileText className="h-3.5 w-3.5" />
                  <span>Upload your resume to get started</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
              <Link href="/profile">
                <Button size="sm" variant="outline" className="text-xs">
                  Complete Profile
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {activities.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40 transition-all flex items-center justify-between text-xs group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-center shrink-0">
                    {getIcon(item.type)}
                  </div>
                  <div>
                    <div className="font-semibold text-white group-hover:text-blue-300 transition-colors">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-slate-400">{item.subtitle}</div>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 font-mono shrink-0 pl-2">
                  {item.date}
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
