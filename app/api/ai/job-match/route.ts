import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import Resume from "@/models/Resume";
import { matchJobWithCandidateAI, type CandidateContext } from "@/lib/ai/job-matcher";
import { z } from "zod";

const MatchRequestSchema = z.object({
  jobDescription: z.string().min(30, "Job description must be at least 30 characters long"),
});

export async function POST(req: Request) {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = MatchRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 1. Fetch User Profile
    const dbUser = await User.findById(sessionUser.id);
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2. Fetch User Resume (if available)
    const dbResume = await Resume.findOne({ userId: sessionUser.id });

    const hasResume =
      !!dbResume &&
      dbResume.analysisStatus === "COMPLETED" &&
      !!dbResume.analysisResult;

    const resumeAnalysis = dbResume?.analysisResult as Record<string, unknown> | undefined;

    const candidateContext: CandidateContext = {
      name: dbUser.name,
      skills: dbUser.profile?.skills || [],
      preferredRole: dbUser.profile?.preferredRole,
      experienceLevel: dbUser.profile?.experienceLevel,
      university: dbUser.profile?.university,
      degree: dbUser.profile?.degree,
      bio: dbUser.profile?.bio,
      resumeSummary: (resumeAnalysis?.professionalSummary as string) || undefined,
      resumeTechnicalSkills: (resumeAnalysis?.technicalSkills as string[]) || undefined,
    };

    // Run AI Matcher
    const matchResult = await matchJobWithCandidateAI(
      parsed.data.jobDescription,
      candidateContext,
      hasResume
    );

    return NextResponse.json({
      success: true,
      match: matchResult,
      dataSource: hasResume ? "Resume + Profile" : "Career Profile Only",
    });
  } catch (error) {
    console.error("Job match error:", error);
    return NextResponse.json(
      { error: "Failed to evaluate job compatibility. Please try again." },
      { status: 500 }
    );
  }
}
