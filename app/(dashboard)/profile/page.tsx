import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { calculateProfileCompletion } from "@/lib/profile-utils";
import { ProfileEditor } from "@/components/profile/profile-editor";

export const metadata = {
  title: "Candidate Profile — CareerPilot AI",
  description: "Manage your academic background, experience, target roles, and technical skills.",
};

export default async function ProfilePage() {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) {
    redirect("/login?callbackUrl=/profile");
  }

  await connectToDatabase();
  const dbUser = await User.findById(sessionUser.id).select("-passwordHash -__v");

  if (!dbUser) {
    redirect("/login");
  }

  const completion = calculateProfileCompletion({
    name: dbUser.name,
    profile: dbUser.profile,
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Candidate Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Maintain your academic details and technical competencies to power accurate AI matching and mock interview scenarios.
        </p>
      </div>

      <ProfileEditor
        initialUser={{
          id: dbUser._id.toString(),
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role,
          profile: dbUser.profile ? {
            phone: dbUser.profile.phone || "",
            location: dbUser.profile.location || "",
            university: dbUser.profile.university || "",
            degree: dbUser.profile.degree || "",
            graduationYear: dbUser.profile.graduationYear,
            experienceLevel: dbUser.profile.experienceLevel || "Entry",
            preferredRole: dbUser.profile.preferredRole || "",
            preferredLocations: dbUser.profile.preferredLocations || [],
            skills: dbUser.profile.skills || [],
            bio: dbUser.profile.bio || "",
          } : undefined,
        }}
        initialCompletion={completion}
      />
    </div>
  );
}
