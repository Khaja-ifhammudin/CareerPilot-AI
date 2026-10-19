import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { calculateProfileCompletion } from "@/lib/profile-utils";
import { escapeRegex } from "@/lib/utils";

export async function GET(req: Request) {
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

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";

    const filter: Record<string, unknown> = {};
    if (search) {
      const sanitized = escapeRegex(search.slice(0, 100));
      const regex = new RegExp(sanitized, "i");
      filter.$or = [{ name: regex }, { email: regex }];
    }

    const rawUsers = await User.find(filter)
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .limit(100);

    const users = rawUsers.map((u) => {
      const completion = calculateProfileCompletion({
        name: u.name,
        profile: u.profile,
      });

      return {
        id: u._id.toString(),
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
        preferredRole: u.profile?.preferredRole || "Not specified",
        profileCompletion: completion.percentage,
      };
    });

    return NextResponse.json({
      success: true,
      users,
      total: users.length,
    });
  } catch (error) {
    console.error("GET /api/admin/users error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user directory." },
      { status: 500 }
    );
  }
}
