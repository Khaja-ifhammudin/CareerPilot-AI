import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Resume from "@/models/Resume";
import { analyzeResumeWithAI } from "@/lib/ai/resume-analyzer";

export async function POST() {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const resume = await Resume.findOne({ userId: sessionUser.id });

    if (!resume) {
      return NextResponse.json(
        { error: "No resume found. Please upload a PDF resume first." },
        { status: 404 }
      );
    }

    if (!resume.extractedText || resume.extractedText.trim().length < 25) {
      return NextResponse.json(
        {
          error:
            "Resume contains insufficient extractable text for AI evaluation. Please re-upload your resume as a clean PDF.",
        },
        { status: 400 }
      );
    }

    // Mark as PROCESSING
    resume.analysisStatus = "PROCESSING";
    await resume.save();

    try {
      // Execute structured Gemini AI analysis
      const analysisResult = await analyzeResumeWithAI(resume.extractedText);

      resume.analysisResult = analysisResult;
      resume.analysisStatus = "COMPLETED";
      await resume.save();

      return NextResponse.json({
        success: true,
        message: "Resume analysis completed successfully.",
        analysis: analysisResult,
        status: "COMPLETED",
      });
    } catch (aiErr: unknown) {
      console.error("Gemini AI evaluation failed:", aiErr);
      resume.analysisStatus = "FAILED";
      await resume.save();

      return NextResponse.json(
        {
          error:
            "Resume analysis could not be completed. Please verify your connection or try again later.",
          status: "FAILED",
        },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error("Resume analyze endpoint error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while analyzing the resume." },
      { status: 500 }
    );
  }
}
