import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import InterviewSession from "@/models/InterviewSession";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, context: RouteContext) {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid interview session ID format" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const session = await InterviewSession.findOne({
      _id: id,
      userId: new mongoose.Types.ObjectId(sessionUser.id),
    });

    if (!session) {
      return NextResponse.json(
        { error: "Interview session not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      session,
    });
  } catch (error) {
    console.error("GET /api/interview/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch interview session." },
      { status: 500 }
    );
  }
}
