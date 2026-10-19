import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import InterviewSession from "@/models/InterviewSession";
import { InterviewSaveSessionSchema } from "@/lib/validations";
import { evaluateInterviewSession } from "@/lib/ai/interview-prep";

export async function POST(req: Request) {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = InterviewSaveSessionSchema.safeParse(body);

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

    const data = parsed.data;

    // Run AI overall session evaluation if overall score is not already provided
    let overallScore = data.overallScore;
    let overallFeedback = data.overallFeedback;
    let strengths = data.strengths;
    let weaknesses = data.weaknesses;
    let recommendations = data.recommendations;

    if (overallScore === undefined || !overallFeedback) {
      const overallEval = await evaluateInterviewSession({
        jobTitle: data.jobTitle,
        company: data.company,
        sessionType: data.sessionType,
        questions: data.questions.map((q) => ({
          question: q.question,
          category: q.category,
          userAnswer: q.userAnswer,
          evaluation: q.evaluation
            ? { score: q.evaluation.score, feedback: q.evaluation.feedback }
            : undefined,
        })),
      });

      overallScore = overallEval.overallScore;
      overallFeedback = overallEval.overallFeedback;
      strengths = overallEval.strengths;
      weaknesses = overallEval.weaknesses;
      recommendations = overallEval.recommendations;
    }

    // Persist to MongoDB
    const session = await InterviewSession.create({
      userId: new mongoose.Types.ObjectId(sessionUser.id),
      applicationId: data.applicationId
        ? new mongoose.Types.ObjectId(data.applicationId)
        : undefined,
      jobTitle: data.jobTitle || "Software Engineer",
      company: data.company || "Tech Company",
      sessionType: data.sessionType,
      difficulty: data.difficulty,
      questions: data.questions,
      overallScore,
      overallFeedback,
      strengths,
      weaknesses,
      recommendations,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Interview session completed and saved successfully.",
        session,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/ai/interview/session error:", error);
    return NextResponse.json(
      { error: "Failed to save interview session." },
      { status: 500 }
    );
  }
}
