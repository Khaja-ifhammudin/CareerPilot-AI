import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Application from "@/models/Application";

export async function GET(req: Request) {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const userObjectId = new mongoose.Types.ObjectId(sessionUser.id);

    // 1. Fetch all user applications
    const applications = await Application.find({ userId: userObjectId }).sort({
      createdAt: -1,
    });

    const totalApplications = applications.length;

    if (totalApplications === 0) {
      return NextResponse.json({
        success: true,
        hasData: false,
        summary: {
          totalApplications: 0,
          applicationsThisMonth: 0,
          interviews: 0,
          offers: 0,
          rejected: 0,
          interviewRate: 0,
          offerRate: 0,
          rejectionRate: 0,
        },
        statusDistribution: [],
        applicationTrend: [],
        topCompanies: [],
      });
    }

    // 2. Applications This Month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const applicationsThisMonth = applications.filter((a) => {
      const date = a.appliedDate || a.createdAt;
      return new Date(date) >= startOfMonth;
    }).length;

    // 3. Counts by Status
    const saved = applications.filter((a) => a.status === "SAVED").length;
    const applied = applications.filter((a) => a.status === "APPLIED").length;
    const screening = applications.filter((a) => a.status === "SCREENING").length;
    const interviews = applications.filter((a) => a.status === "INTERVIEW").length;
    const offers = applications.filter((a) => a.status === "OFFER").length;
    const rejected = applications.filter((a) => a.status === "REJECTED").length;

    // Safe division calculation
    const interviewRate =
      totalApplications > 0
        ? Number(((interviews / totalApplications) * 100).toFixed(1))
        : 0;

    const offerRate =
      totalApplications > 0
        ? Number(((offers / totalApplications) * 100).toFixed(1))
        : 0;

    const rejectionRate =
      totalApplications > 0
        ? Number(((rejected / totalApplications) * 100).toFixed(1))
        : 0;

    // 4. Status Distribution for Funnel / Bar Chart
    const statusDistribution = [
      { status: "SAVED", label: "Saved", count: saved, fill: "#64748b" },
      { status: "APPLIED", label: "Applied", count: applied, fill: "#3b82f6" },
      { status: "SCREENING", label: "Screening", count: screening, fill: "#8b5cf6" },
      { status: "INTERVIEW", label: "Interview", count: interviews, fill: "#a855f7" },
      { status: "OFFER", label: "Offer", count: offers, fill: "#10b981" },
      { status: "REJECTED", label: "Rejected", count: rejected, fill: "#f43f5e" },
    ];

    // 5. Application Trend (Last 6 Months)
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const monthsTrend: Record<string, { label: string; count: number; order: number }> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      monthsTrend[key] = {
        label: `${monthNames[d.getMonth()]} ${d.getFullYear() % 100}`,
        count: 0,
        order: i,
      };
    }

    applications.forEach((a) => {
      const date = new Date(a.appliedDate || a.createdAt);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (monthsTrend[key]) {
        monthsTrend[key].count += 1;
      }
    });

    const applicationTrend = Object.values(monthsTrend).map((m) => ({
      name: m.label,
      applications: m.count,
    }));

    // 6. Top Companies Applied To
    const companyCounts: Record<string, number> = {};
    applications.forEach((a) => {
      const company = a.company.trim();
      if (company) {
        companyCounts[company] = (companyCounts[company] || 0) + 1;
      }
    });

    const topCompanies = Object.entries(companyCounts)
      .map(([company, count]) => ({ company, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      hasData: true,
      summary: {
        totalApplications,
        applicationsThisMonth,
        interviews,
        offers,
        rejected,
        interviewRate,
        offerRate,
        rejectionRate,
      },
      statusDistribution,
      applicationTrend,
      topCompanies,
    });
  } catch (error) {
    console.error("GET /api/analytics error:", error);
    return NextResponse.json(
      { error: "Failed to generate analytics." },
      { status: 500 }
    );
  }
}
