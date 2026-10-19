import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Application from "@/models/Application";
import { ApplicationInputSchema } from "@/lib/validations";
import { escapeRegex } from "@/lib/utils";

export async function GET(req: Request) {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "ALL";
    const jobType = searchParams.get("jobType")?.trim() || "ALL";
    const sortBy = searchParams.get("sortBy")?.trim() || "newest";

    // Base filter scoped strictly to authenticated user
    const filter: Record<string, unknown> = { userId: sessionUser.id };

    if (status !== "ALL" && status !== "") {
      filter.status = status;
    }

    if (jobType !== "ALL" && jobType !== "") {
      filter.jobType = jobType;
    }
    if (search) {
      const sanitized = escapeRegex(search.slice(0, 100));
      const regex = new RegExp(sanitized, "i");
      filter.$or = [
        { company: regex },
        { jobTitle: regex },
        { location: regex },
      ];
    }

    // Determine sort order
    let sortOptions: Record<string, 1 | -1> = { createdAt: -1 };
    switch (sortBy) {
      case "oldest":
        sortOptions = { createdAt: 1 };
        break;
      case "company_asc":
        sortOptions = { company: 1 };
        break;
      case "company_desc":
        sortOptions = { company: -1 };
        break;
      case "interview_date":
        sortOptions = { interviewDate: -1 };
        break;
      case "status":
        sortOptions = { status: 1 };
        break;
      case "newest":
      default:
        sortOptions = { createdAt: -1 };
        break;
    }

    const applications = await Application.find(filter).sort(sortOptions);

    // Compute status counts for summary cards across all user's applications
    const allUserApps = await Application.find({ userId: sessionUser.id }).select("status");

    const summary = {
      total: allUserApps.length,
      saved: allUserApps.filter((a) => a.status === "SAVED").length,
      applied: allUserApps.filter((a) => a.status === "APPLIED").length,
      screening: allUserApps.filter((a) => a.status === "SCREENING").length,
      interviews: allUserApps.filter((a) => a.status === "INTERVIEW").length,
      offers: allUserApps.filter((a) => a.status === "OFFER").length,
      rejected: allUserApps.filter((a) => a.status === "REJECTED").length,
    };

    return NextResponse.json({
      success: true,
      applications,
      summary,
    });
  } catch (error) {
    console.error("GET /api/applications error:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = ApplicationInputSchema.safeParse(body);

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

    const application = await Application.create({
      ...parsed.data,
      userId: new mongoose.Types.ObjectId(sessionUser.id),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Application tracked successfully.",
        application,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/applications error:", error);
    return NextResponse.json(
      { error: "Failed to create application record." },
      { status: 500 }
    );
  }
}
