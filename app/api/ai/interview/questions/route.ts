import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import Resume from "@/models/Resume";
import SkillProfile from "@/models/SkillProfile";
import Application from "@/models/Application";
import { InterviewQuestionsRequestSchema } from "@/lib/validations";
import { generateInterviewQuestions } from "@/lib/ai/interview-prep";

export async function POST(req: Request) {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = InterviewQuestionsRequestSchema.safeParse(body);

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

    const userObjectId = new mongoose.Types.ObjectId(sessionUser.id);

    // 1. Fetch Candidate Profile Context
    const dbUser = await User.findById(userObjectId);
    const candidateSkills = dbUser?.profile?.skills || [];
    const candidateExperienceLevel = dbUser?.profile?.experienceLevel || "Entry";

    // 2. Fetch Resume Analysis (if available)
    const dbResume = await Resume.findOne({ userId: userObjectId });
    const resumeAnalysis = dbResume?.analysisResult as Record<string, unknown> | undefined;
    const resumeSkills = (resumeAnalysis?.technicalSkills as string[]) || [];
    const candidateSummary = (resumeAnalysis?.professionalSummary as string) || dbUser?.profile?.bio;

    // Combined unique skills
    const combinedSkills = Array.from(new Set([...candidateSkills, ...resumeSkills]));

    // 3. Fetch Skill Gaps (if available)
    const dbSkillProfile = await SkillProfile.findOne({ userId: userObjectId });
    const skillGaps = (dbSkillProfile?.skillGaps || []).map((g: { skill: string }) => g.skill);

    // 4. Resolve Job Context (from application or manual input)
    let jobTitle = parsed.data.jobTitle || dbUser?.profile?.preferredRole || "Software Engineer";
    let company = parsed.data.company || "Tech Company";
    let jobDescription = parsed.data.jobDescription || "";

    if (parsed.data.applicationId && mongoose.Types.ObjectId.isValid(parsed.data.applicationId)) {
      const application = await Application.findOne({
        _id: parsed.data.applicationId,
        userId: userObjectId,
      });

      if (application) {
        jobTitle = application.jobTitle;
        company = application.company;
      }
    }

    // 5. Generate Questions via Gemini Service
    const questionsOutput = await generateInterviewQuestions({
      sessionType: parsed.data.sessionType,
      difficulty: parsed.data.difficulty,
      jobTitle,
      company,
      jobDescription,
      candidateSkills: combinedSkills,
      candidateSummary,
      candidateExperienceLevel,
      skillGaps,
    });

    return NextResponse.json({
      success: true,
      questions: questionsOutput.questions,
      context: {
        jobTitle,
        company,
        sessionType: parsed.data.sessionType,
        difficulty: parsed.data.difficulty,
      },
    });
  } catch (error) {
    console.error("POST /api/ai/interview/questions error:", error);
    return NextResponse.json(
      { error: "Failed to generate interview questions. Please try again." },
      { status: 500 }
    );
  }
}
