import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Resume from "@/models/Resume";
import { ResumeDashboard } from "@/components/resume/resume-dashboard";

export const metadata = {
  title: "Resume Intelligence — CareerPilot AI",
  description: "Upload your resume and audit your ATS readiness, strengths, and skills.",
};

export default async function ResumePage() {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) {
    redirect("/login?callbackUrl=/resume");
  }

  await connectToDatabase();
  const dbResume = await Resume.findOne({ userId: sessionUser.id });

  const initialResume = dbResume
    ? {
        id: dbResume._id.toString(),
        originalFileName: dbResume.originalFileName,
        fileSize: dbResume.fileSize,
        mimeType: dbResume.mimeType,
        analysisStatus: dbResume.analysisStatus,
        analysisResult: (dbResume.analysisResult as any) || null,
        createdAt: dbResume.createdAt.toISOString(),
        updatedAt: dbResume.updatedAt.toISOString(),
        textPreview: dbResume.extractedText.slice(0, 300),
      }
    : null;

  return <ResumeDashboard initialResume={initialResume} />;
}
