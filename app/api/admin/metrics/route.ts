import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import Resume from "@/models/Resume";
import Application from "@/models/Application";
import InterviewSession from "@/models/InterviewSession";

export async function GET() {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (sessionUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Admin privileges required" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Run parallel counts for maximum efficiency
    const [
      totalUsers,
      newUsersThisMonth,
      totalResumes,
      analyzedResumes,
      totalApplications,
      totalOffers,
      totalInterviews,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Resume.countDocuments(),
      Resume.countDocuments({ analysisStatus: "COMPLETED" }),
      Application.countDocuments(),
      Application.countDocuments({ status: "OFFER" }),
      InterviewSession.countDocuments(),
    ]);

    // Application status breakdown
    const allApps = await Application.find().select("status");
    const statusCounts: Record<string, number> = {
      SAVED: 0,
      APPLIED: 0,
      SCREENING: 0,
      INTERVIEW: 0,
      OFFER: 0,
      REJECTED: 0,
    };
    allApps.forEach((a) => {
      if (statusCounts[a.status] !== undefined) {
        statusCounts[a.status] += 1;
      }
    });

    const applicationStatusDistribution = Object.entries(statusCounts).map(
      ([status, count]) => ({ status, count })
    );

    // Monthly registration trend for past 6 months
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const registrationTrend: Record<string, { name: string; users: number }> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      registrationTrend[key] = {
        name: `${monthNames[d.getMonth()]} ${d.getFullYear() % 100}`,
        users: 0,
      };
    }

    const allUsers = await User.find().select("createdAt");
    allUsers.forEach((u) => {
      const d = new Date(u.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (registrationTrend[key]) {
        registrationTrend[key].users += 1;
      }
    });

    return NextResponse.json({
      success: true,
      metrics: {
        totalUsers,
        newUsersThisMonth,
        totalResumes,
        analyzedResumes,
        totalApplications,
        totalOffers,
        totalInterviews,
      },
      applicationStatusDistribution,
      registrationTrend: Object.values(registrationTrend),
    });
  } catch (error) {
    console.error("GET /api/admin/metrics error:", error);
    return NextResponse.json(
      { error: "Failed to generate admin metrics." },
      { status: 500 }
    );
  }
}
