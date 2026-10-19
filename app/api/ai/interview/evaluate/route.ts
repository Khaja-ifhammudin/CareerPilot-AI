import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { InterviewEvaluateAnswerSchema } from "@/lib/validations";
import { evaluateInterviewAnswer } from "@/lib/ai/interview-prep";

export async function POST(req: Request) {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = InterviewEvaluateAnswerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { question, userAnswer, category, expectedFocus } = parsed.data;

    const evaluation = await evaluateInterviewAnswer(
      question,
      userAnswer,
      category,
      expectedFocus
    );

    return NextResponse.json({
      success: true,
      evaluation,
    });
  } catch (error) {
    console.error("POST /api/ai/interview/evaluate error:", error);
    return NextResponse.json(
      { error: "Failed to evaluate interview answer. Please try again." },
      { status: 500 }
    );
  }
}
