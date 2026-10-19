import { IUserDocument } from "@/models/User";

export interface ProfileCompletionDetails {
  percentage: number;
  completedFields: string[];
  missingFields: { field: string; label: string }[];
  totalFields: number;
}

export function calculateProfileCompletion(user: {
  name?: string;
  profile?: {
    phone?: string;
    location?: string;
    university?: string;
    degree?: string;
    graduationYear?: number;
    experienceLevel?: string;
    preferredRole?: string;
    preferredLocations?: string[];
    skills?: string[];
    bio?: string;
  };
}): ProfileCompletionDetails {
  const profile = user.profile || {};

  const fieldChecks: { key: string; label: string; isComplete: boolean }[] = [
    { key: "name", label: "Full Name", isComplete: !!user.name?.trim() },
    { key: "phone", label: "Phone Number", isComplete: !!profile.phone?.trim() },
    { key: "location", label: "Location", isComplete: !!profile.location?.trim() },
    { key: "university", label: "University", isComplete: !!profile.university?.trim() },
    { key: "degree", label: "Degree Program", isComplete: !!profile.degree?.trim() },
    { key: "graduationYear", label: "Graduation Year", isComplete: !!profile.graduationYear },
    { key: "experienceLevel", label: "Experience Level", isComplete: !!profile.experienceLevel },
    { key: "preferredRole", label: "Target Role", isComplete: !!profile.preferredRole?.trim() },
    {
      key: "preferredLocations",
      label: "Target Locations",
      isComplete: Array.isArray(profile.preferredLocations) && profile.preferredLocations.length > 0,
    },
    {
      key: "skills",
      label: "Technical Skills",
      isComplete: Array.isArray(profile.skills) && profile.skills.length > 0,
    },
    { key: "bio", label: "Professional Bio", isComplete: !!profile.bio?.trim() && profile.bio.trim().length >= 20 },
  ];

  const totalFields = fieldChecks.length;
  const completedFields = fieldChecks.filter((f) => f.isComplete).map((f) => f.label);
  const missingFields = fieldChecks
    .filter((f) => !f.isComplete)
    .map((f) => ({ field: f.key, label: f.label }));

  const percentage = Math.round((completedFields.length / totalFields) * 100);

  return {
    percentage,
    completedFields,
    missingFields,
    totalFields,
  };
}
