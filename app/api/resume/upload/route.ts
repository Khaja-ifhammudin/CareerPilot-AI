import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Resume from "@/models/Resume";
import { extractText } from "unpdf";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB limit
const UPLOAD_DIR = path.join(process.cwd(), "uploads", "resumes");

export async function POST(req: Request) {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = (formData.get("file") || formData.get("resume")) as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file was provided in the upload request." },
        { status: 400 }
      );
    }

    // 1. File Size Validation
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File exceeds the maximum allowable size of 5 MB." },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        { error: "The uploaded file is empty." },
        { status: 400 }
      );
    }

    // 2. Filename & Extension Validation
    const originalFileName = file.name || "resume.pdf";
    const extension = path.extname(originalFileName).toLowerCase();

    if (extension !== ".pdf") {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF resumes (.pdf) are supported." },
        { status: 400 }
      );
    }

    // 3. MIME Type & Magic Bytes Check
    const rawArrayBuffer = await file.arrayBuffer();
    const diskBuffer = Buffer.from(rawArrayBuffer.slice(0));
    const pdfUint8 = new Uint8Array(rawArrayBuffer.slice(0));

    // Validate PDF magic number (%PDF-)
    const isPdfHeader = diskBuffer.subarray(0, 4).toString("utf-8") === "%PDF";
    if (!isPdfHeader) {
      return NextResponse.json(
        { error: "The uploaded file is not a valid PDF document." },
        { status: 400 }
      );
    }

    // 4. Extract Text from PDF
    let extractedText = "";
    try {
      const pdfData = await extractText(pdfUint8);
      extractedText = (pdfData.text || []).join("\n").trim();
    } catch (extractErr) {
      console.error("PDF Extraction error:", extractErr);
      return NextResponse.json(
        {
          error:
            "Unable to parse PDF text. The document may be corrupted or password-protected.",
        },
        { status: 400 }
      );
    }

    if (!extractedText || extractedText.length < 25) {
      return NextResponse.json(
        {
          error:
            "This PDF contains no extractable text. Please upload a standard text-based PDF rather than a scanned image.",
        },
        { status: 400 }
      );
    }

    // 5. Ensure private server storage directory exists
    await fs.mkdir(UPLOAD_DIR, { recursive: true });

    // Generate sanitized unique filename
    const safeUUID = crypto.randomUUID();
    const storedFileName = `${Date.now()}-${safeUUID}.pdf`;
    const storagePath = path.join(UPLOAD_DIR, storedFileName);

    // Save PDF to private disk
    await fs.writeFile(storagePath, diskBuffer);

    // 6. Connect to DB and update/create Resume document
    await connectToDatabase();

    const existingResume = await Resume.findOne({ userId: sessionUser.id });

    if (existingResume) {
      // Remove old file if it exists on disk
      try {
        await fs.unlink(existingResume.storagePath);
      } catch {
        // Silently continue if old file wasn't found
      }

      existingResume.originalFileName = originalFileName;
      existingResume.storedFileName = storedFileName;
      existingResume.fileSize = file.size;
      existingResume.mimeType = file.type || "application/pdf";
      existingResume.storagePath = storagePath;
      existingResume.extractedText = extractedText;
      existingResume.analysisStatus = "NOT_ANALYZED";
      existingResume.analysisResult = undefined;

      await existingResume.save();

      return NextResponse.json({
        success: true,
        message: "Resume uploaded and text extracted successfully.",
        resume: {
          id: existingResume._id.toString(),
          originalFileName: existingResume.originalFileName,
          fileSize: existingResume.fileSize,
          mimeType: existingResume.mimeType,
          analysisStatus: existingResume.analysisStatus,
          createdAt: existingResume.createdAt,
          updatedAt: existingResume.updatedAt,
          textLength: extractedText.length,
        },
      });
    }

    const newResume = await Resume.create({
      userId: sessionUser.id,
      originalFileName,
      storedFileName,
      fileSize: file.size,
      mimeType: file.type || "application/pdf",
      storagePath,
      extractedText,
      analysisStatus: "NOT_ANALYZED",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Resume uploaded and text extracted successfully.",
        resume: {
          id: newResume._id.toString(),
          originalFileName: newResume.originalFileName,
          fileSize: newResume.fileSize,
          mimeType: newResume.mimeType,
          analysisStatus: newResume.analysisStatus,
          createdAt: newResume.createdAt,
          updatedAt: newResume.updatedAt,
          textLength: extractedText.length,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Resume upload error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during resume upload." },
      { status: 500 }
    );
  }
}
