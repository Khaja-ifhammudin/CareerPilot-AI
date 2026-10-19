import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import Resume from "@/models/Resume";
import SkillProfile from "@/models/SkillProfile";
import { analyzeSkillGapsWithAI } from "@/lib/ai/skill-gap-analyzer";
import { z } from "zod";

const SkillGapRequestSchema = z.object({
  targetRole: z.string().min(2, "Please specify a target role"),
});

export async function POST(req: Request) {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = SkillGapRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { targetRole } = parsed.data;

    await connectToDatabase();
    const dbUser = await User.findById(sessionUser.id);
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const dbResume = await Resume.findOne({ userId: sessionUser.id });
    const resumeAnalysis = dbResume?.analysisResult as Record<string, unknown> | undefined;
    const resumeSkills = (resumeAnalysis?.technicalSkills as string[]) || [];

    const currentSkills = Array.from(
      new Set([...(dbUser.profile?.skills || []), ...resumeSkills])
    );

    // Run AI Skill Gap Analyzer
    const analysis = await analyzeSkillGapsWithAI(targetRole, currentSkills);

    // Save or update SkillProfile in MongoDB
    await SkillProfile.findOneAndUpdate(
      { userId: sessionUser.id },
      {
        userId: sessionUser.id,
        targetRole: analysis.targetRole,
        currentSkills: analysis.currentSkills,
        requiredSkills: analysis.requiredSkills,
        matchedSkills: analysis.matchedSkills,
        skillGaps: analysis.skillGaps,
        recommendations: analysis.actionableRecommendations,
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error("Skill gap analysis error:", error);
    return NextResponse.json(
      { error: "Failed to generate skill gap matrix. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const profile = await SkillProfile.findOne({ userId: sessionUser.id }).sort({
      updatedAt: -1,
    });

    return NextResponse.json({
      success: true,
      profile: profile || null,
    });
  } catch (error) {
    console.error("GET Skill gap error:", error);
    return NextResponse.json(
      { error: "Failed to fetch skill gap profile." },
      { status: 500 }
    );
  }
}
