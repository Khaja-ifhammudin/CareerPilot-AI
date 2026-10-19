import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { ProfileSchema } from "@/lib/validations";
import { calculateProfileCompletion } from "@/lib/profile-utils";

export async function GET() {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findById(sessionUser.id).select("-passwordHash -__v");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const completion = calculateProfileCompletion({
      name: user.name,
      profile: user.profile,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile || {},
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      completion,
    });
  } catch (error) {
    console.error("GET /api/profile error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parseResult = ProfileSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    await connectToDatabase();
    const user = await User.findById(sessionUser.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update authorized profile fields only
    if (data.name) {
      user.name = data.name.trim();
    }

    // Ensure skills are unique and trimmed
    const uniqueSkills = data.skills
      ? Array.from(new Set(data.skills.map((s) => s.trim()).filter(Boolean)))
      : user.profile?.skills || [];

    // Ensure preferredLocations are trimmed
    const uniqueLocations = data.preferredLocations
      ? Array.from(new Set(data.preferredLocations.map((l) => l.trim()).filter(Boolean)))
      : user.profile?.preferredLocations || [];

    user.profile = {
      phone: data.phone?.trim() ?? user.profile?.phone ?? "",
      location: data.location?.trim() ?? user.profile?.location ?? "",
      university: data.university?.trim() ?? user.profile?.university ?? "",
      degree: data.degree?.trim() ?? user.profile?.degree ?? "",
      graduationYear: data.graduationYear ?? user.profile?.graduationYear,
      experienceLevel: data.experienceLevel ?? user.profile?.experienceLevel ?? "Entry",
      preferredRole: data.preferredRole?.trim() ?? user.profile?.preferredRole ?? "",
      preferredLocations: uniqueLocations,
      skills: uniqueSkills,
      bio: data.bio?.trim() ?? user.profile?.bio ?? "",
    };

    await user.save();

    const completion = calculateProfileCompletion({
      name: user.name,
      profile: user.profile,
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile,
        updatedAt: user.updatedAt,
      },
      completion,
    });
  } catch (error) {
    console.error("PUT /api/profile error:", error);
    return NextResponse.json(
      { error: "Failed to update profile. Please try again." },
      { status: 500 }
    );
  }
}
