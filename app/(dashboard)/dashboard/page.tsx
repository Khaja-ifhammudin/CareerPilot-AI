import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import Resume from "@/models/Resume";
import Application from "@/models/Application";
import InterviewSession from "@/models/InterviewSession";
import { calculateProfileCompletion } from "@/lib/profile-utils";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { CareerWorkflow } from "@/components/dashboard/career-workflow";
import { RecentActivity, ActivityItem } from "@/components/dashboard/recent-activity";
import { ProfileCompletionCard } from "@/components/dashboard/profile-completion-card";
import { Sparkles, Calendar, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Dashboard — CareerPilot AI",
  description: "Monitor your career progression, application status, and AI insights.",
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ view?: string }>;
}) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const resolvedParams = searchParams ? await searchParams : {};

  // If the user is an ADMIN and didn't explicitly request candidate preview, redirect directly to /admin
  if (sessionUser.role === "ADMIN" && resolvedParams.view !== "candidate") {
    redirect("/admin");
  }

  await connectToDatabase();
  const dbUser = await User.findById(sessionUser.id).select("-passwordHash");

  if (!dbUser) {
    redirect("/login");
  }

  // Fetch candidate resume
  const dbResume = await Resume.findOne({ userId: sessionUser.id });

  let resumeStatus: "NOT_UPLOADED" | "NOT_ANALYZED" | "PROCESSING" | "COMPLETED" | "FAILED" = "NOT_UPLOADED";
  let resumeScore: number | null = null;

  if (dbResume) {
    resumeStatus = dbResume.analysisStatus;
    const analysis = dbResume.analysisResult as Record<string, unknown> | undefined;
    if (dbResume.analysisStatus === "COMPLETED" && typeof analysis?.overallScore === "number") {
      resumeScore = analysis.overallScore;
    }
  }

  // Fetch real MongoDB counts for applications and interviews
  const [applicationCount, interviewCount, offerCount, recentApplications, recentInterviews] = await Promise.all([
    Application.countDocuments({ userId: sessionUser.id }),
    InterviewSession.countDocuments({ userId: sessionUser.id }),
    Application.countDocuments({ userId: sessionUser.id, status: "OFFER" }),
    Application.find({ userId: sessionUser.id }).sort({ updatedAt: -1 }).limit(3).lean(),
    InterviewSession.find({ userId: sessionUser.id }).sort({ createdAt: -1 }).limit(2).lean(),
  ]);

  // Aggregate real recent activities
  const activities: ActivityItem[] = [];

  if (dbResume && dbResume.analysisStatus === "COMPLETED") {
    activities.push({
      id: `resume-${dbResume._id}`,
      type: "RESUME",
      title: "Resume ATS Audit Completed",
      subtitle: dbResume.originalFileName ? `Audited "${dbResume.originalFileName}"` : "Resume scored and analyzed",
      date: new Date(dbResume.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      href: "/resume",
    });
  }

  for (const app of recentApplications as any[]) {
    activities.push({
      id: `app-${app._id}`,
      type: "APPLICATION",
      title: `${app.company} — ${app.jobTitle}`,
      subtitle: `Status: ${app.status.replace("_", " ")}${app.location ? ` • ${app.location}` : ""}`,
      date: new Date(app.updatedAt || app.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      href: "/applications",
    });
  }

  for (const session of recentInterviews as any[]) {
    activities.push({
      id: `interview-${session._id}`,
      type: "INTERVIEW",
      title: `${session.sessionType.replace("_", " ")} Interview Prep`,
      subtitle: session.overallScore
        ? `Completed with ${session.overallScore}/100 rating`
        : `${session.questions?.length || 0} questions generated`,
      date: new Date(session.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      href: "/interview-prep",
    });
  }

  const completion = calculateProfileCompletion({
    name: dbUser.name,
    profile: dbUser.profile,
  });

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Admin Mode Switcher Banner */}
      {dbUser.role === "ADMIN" && (
        <div className="p-3.5 rounded-xl bg-purple-950/60 border border-purple-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-purple-200 shadow-lg">
          <div className="flex items-center gap-2.5">
            <span className="font-extrabold uppercase tracking-wider text-purple-300 bg-purple-500/25 px-2 py-0.5 rounded border border-purple-500/40 text-[10px]">
              ADMIN MODE
            </span>
            <span className="font-medium text-slate-200">
              You are viewing the candidate workspace in preview mode.
            </span>
          </div>
          <Link href="/admin">
            <button className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-1.5 transition-colors shadow-sm self-start sm:self-auto">
              <span>Return to Admin Dashboard</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </Link>
        </div>
      )}

      {/* Welcome Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {dbUser.name}
            </h1>
            <Badge
              variant={dbUser.role === "ADMIN" ? "purple" : "default"}
              className="text-[10px] font-bold uppercase tracking-wider"
            >
              {dbUser.role}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            {dbUser.profile?.preferredRole
              ? `Targeting: ${dbUser.profile.preferredRole} • Track your progress toward dream offers.`
              : "Set up your target role and skills to unlock AI matching."}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800 self-start sm:self-auto">
          <Calendar className="h-3.5 w-3.5 text-blue-400" />
          <span>{currentDate}</span>
        </div>
      </div>

      {/* Profile completion banner */}
      <ProfileCompletionCard completion={completion} />

      {/* Statistics Cards (Real dynamic metrics from MongoDB) */}
      <StatsCards
        resumeScore={resumeScore}
        resumeStatus={resumeStatus}
        applicationCount={applicationCount}
        interviewCount={interviewCount}
        offerCount={offerCount}
      />

      {/* Quick Action Hub */}
      <QuickActions />

      {/* Career Workflow Progression Map */}
      <CareerWorkflow
        profileCompleted={completion.percentage >= 80}
        profilePercentage={completion.percentage}
        resumeUploaded={!!dbResume}
        resumeAnalyzed={dbResume?.analysisStatus === "COMPLETED"}
        applicationCount={applicationCount}
        interviewCount={interviewCount}
      />

      {/* Recent Activity Section */}
      <RecentActivity activities={activities} />
    </div>
  );
}
