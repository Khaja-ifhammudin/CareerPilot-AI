import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import InterviewSession from "@/models/InterviewSession";

export async function GET() {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const sessions = await InterviewSession.find({
      userId: new mongoose.Types.ObjectId(sessionUser.id),
    })
      .sort({ createdAt: -1 })
      .select("jobTitle company sessionType difficulty overallScore createdAt");

    return NextResponse.json({
      success: true,
      sessions,
    });
  } catch (error) {
    console.error("GET /api/ai/interview/history error:", error);
    return NextResponse.json(
      { error: "Failed to fetch interview history." },
      { status: 500 }
    );
  }
}
