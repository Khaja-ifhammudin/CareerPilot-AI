import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import JobAnalysis from "@/models/JobAnalysis";
import { analyzeJobDescriptionWithAI } from "@/lib/ai/job-analyzer";
import { z } from "zod";

const RequestSchema = z.object({
  jobDescription: z.string().min(30, "Job description must be at least 30 characters long"),
  jobTitle: z.string().optional(),
  company: z.string().optional(),
  location: z.string().optional(),
  jobUrl: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { jobDescription, jobTitle, company, location, jobUrl } = parsed.data;

    // Run Gemini job analyzer
    const analysis = await analyzeJobDescriptionWithAI(jobDescription, {
      jobTitle,
      company,
      location,
    });

    await connectToDatabase();
    const savedRecord = await JobAnalysis.create({
      userId: sessionUser.id,
      jobTitle: analysis.jobTitle || jobTitle || "Untitled Position",
      company: analysis.company || company || "Unknown Company",
      location: analysis.location || location || "Unknown Location",
      jobUrl: jobUrl || "",
      rawDescription: jobDescription,
      analysis,
    });

    return NextResponse.json({
      success: true,
      id: savedRecord._id.toString(),
      analysis,
    });
  } catch (error) {
    console.error("Job analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze job description. Please try again." },
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
    const records = await JobAnalysis.find({ userId: sessionUser.id })
      .sort({ createdAt: -1 })
      .limit(10);

    return NextResponse.json({
      success: true,
      jobs: records.map((r) => ({
        id: r._id.toString(),
        jobTitle: r.jobTitle,
        company: r.company,
        location: r.location,
        jobUrl: r.jobUrl,
        analysis: r.analysis,
        createdAt: r.createdAt,
      })),
    });
  } catch (error) {
    console.error("GET Job analysis error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analyzed jobs." },
      { status: 500 }
    );
  }
}
