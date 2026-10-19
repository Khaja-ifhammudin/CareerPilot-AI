import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Resume from "@/models/Resume";
import fs from "fs/promises";

export async function GET() {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const resume = await Resume.findOne({ userId: sessionUser.id });

    if (!resume) {
      return NextResponse.json({ resume: null });
    }

    return NextResponse.json({
      resume: {
        id: resume._id.toString(),
        originalFileName: resume.originalFileName,
        fileSize: resume.fileSize,
        mimeType: resume.mimeType,
        analysisStatus: resume.analysisStatus,
        analysisResult: resume.analysisResult || null,
        createdAt: resume.createdAt,
        updatedAt: resume.updatedAt,
        textPreview: resume.extractedText.slice(0, 300),
      },
    });
  } catch (error) {
    console.error("GET /api/resume error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve resume." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const resume = await Resume.findOne({ userId: sessionUser.id });

    if (!resume) {
      return NextResponse.json(
        { error: "No resume found to delete." },
        { status: 404 }
      );
    }

    // Remove private file from server disk
    try {
      await fs.unlink(resume.storagePath);
    } catch {
      // Continue even if disk file was already absent
    }

    // Remove from MongoDB
    await Resume.deleteOne({ _id: resume._id });

    return NextResponse.json({
      success: true,
      message: "Resume deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE /api/resume error:", error);
    return NextResponse.json(
      { error: "Failed to delete resume." },
      { status: 500 }
    );
  }
}
