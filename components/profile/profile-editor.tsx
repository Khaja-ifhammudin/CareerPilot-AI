"use client";

import React, { useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  Layers,
  Sparkles,
  Plus,
  X,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { type ProfileCompletionDetails } from "@/lib/profile-utils";

interface ProfileEditorProps {
  initialUser: {
    id: string;
    name: string;
    email: string;
    role: "USER" | "ADMIN";
    profile?: {
      phone?: string;
      location?: string;
      university?: string;
      degree?: string;
      graduationYear?: number;
      experienceLevel?: "Entry" | "Mid" | "Senior";
      preferredRole?: string;
      preferredLocations?: string[];
      skills?: string[];
      bio?: string;
    };
  };
  initialCompletion: ProfileCompletionDetails;
}

export function ProfileEditor({
  initialUser,
  initialCompletion,
}: ProfileEditorProps) {
  // Form State
  const [name, setName] = useState(initialUser.name || "");
  const [phone, setPhone] = useState(initialUser.profile?.phone || "");
  const [location, setLocation] = useState(initialUser.profile?.location || "");
  const [university, setUniversity] = useState(initialUser.profile?.university || "");
  const [degree, setDegree] = useState(initialUser.profile?.degree || "");
  const [graduationYear, setGraduationYear] = useState(
    initialUser.profile?.graduationYear?.toString() || "2026"
  );
  const [experienceLevel, setExperienceLevel] = useState<"Entry" | "Mid" | "Senior">(
    initialUser.profile?.experienceLevel || "Entry"
  );
  const [preferredRole, setPreferredRole] = useState(
    initialUser.profile?.preferredRole || ""
  );
  const [locationsInput, setLocationsInput] = useState(
    (initialUser.profile?.preferredLocations || []).join(", ")
  );
  const [skills, setSkills] = useState<string[]>(
    initialUser.profile?.skills || []
  );
  const [newSkill, setNewSkill] = useState("");
  const [bio, setBio] = useState(initialUser.profile?.bio || "");

  // Status & Completion State
  const [completion, setCompletion] = useState<ProfileCompletionDetails>(initialCompletion);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Popular skills suggestion chips
  const suggestedSkills = [
    "JavaScript",
    "TypeScript",
    "React",
    "Next.js",
    "Node.js",
    "Python",
    "MongoDB",
    "PostgreSQL",
    "Docker",
    "AWS",
    "Tailwind CSS",
    "Git",
  ];

  const handleAddSkill = (skillToAdd: string) => {
    const trimmed = skillToAdd.trim();
    if (!trimmed) return;
    if (skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setErrorMessage(`Skill "${trimmed}" is already added.`);
      return;
    }
    setSkills([...skills, trimmed]);
    setNewSkill("");
    setErrorMessage("");
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleKeyDownSkill = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSkill(newSkill);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const preferredLocations = locationsInput
        .split(",")
        .map((l) => l.trim())
        .filter(Boolean);

      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        location: location.trim(),
        university: university.trim(),
        degree: degree.trim(),
        graduationYear: graduationYear ? parseInt(graduationYear, 10) : undefined,
        experienceLevel,
        preferredRole: preferredRole.trim(),
        preferredLocations,
        skills,
        bio: bio.trim(),
      };

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Failed to update profile.");
        setSaving(false);
        return;
      }

      setSuccessMessage("Profile updated successfully!");
      if (data.completion) {
        setCompletion(data.completion);
      }
      setSaving(false);

      // Auto dismiss success toast after 4s
      setTimeout(() => {
        setSuccessMessage("");
      }, 4000);
    } catch (err: unknown) {
      console.error("Save profile error:", err);
      setErrorMessage("Network error while updating profile. Please try again.");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top Profile Header with Completion Tracker */}
      <Card className="glass-card border-slate-800 bg-gradient-to-r from-slate-900/90 via-slate-950 to-blue-950/30">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center font-extrabold text-xl text-white shadow-xl shadow-blue-500/20">
                {initialUser.name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white">{name || initialUser.name}</h2>
                  <Badge variant={initialUser.role === "ADMIN" ? "purple" : "default"}>
                    {initialUser.role}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="flex items-center gap-1 font-mono">{initialUser.email}</span>
                  <span>•</span>
                  <span>{experienceLevel} Level</span>
                </div>
              </div>
            </div>

            {/* Dynamic Profile Completion Meter */}
            <div className="w-full md:w-72 space-y-2 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-blue-400" /> Profile Strength
                </span>
                <span className="font-extrabold text-blue-400">{completion.percentage}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${completion.percentage}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400">
                {completion.percentage >= 100
                  ? "✓ Profile 100% complete. Optimal for AI matching."
                  : `Add ${completion.missingFields.length} more details for 100% score.`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Notifications */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      {/* Section 1: Basic & Academic Information */}
      <Card className="glass-card border-slate-800">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-blue-400" />
            <span>Academic & Personal Information</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Basic background details used in ATS scoring and profile summaries
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-xs font-semibold text-slate-300">
                Full Name *
              </label>
              <div className="relative">
                <User className="h-4 w-4 text-slate-500 absolute left-3 top-3" />
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Morgan"
                  className="pl-9"
                  required
                />
              </div>
            </div>

            {/* Email Address (Read-only) */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Email Address</span>
                <span className="text-[10px] text-slate-500 flex items-center gap-1 font-normal">
                  <Lock className="h-3 w-3" /> Fixed Account ID
                </span>
              </label>
              <div className="relative">
                <Mail className="h-4 w-4 text-slate-500 absolute left-3 top-3" />
                <Input
                  id="email"
                  value={initialUser.email}
                  disabled
                  className="pl-9 bg-slate-900/40 text-slate-400 cursor-not-allowed border-slate-800"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label htmlFor="phone" className="text-xs font-semibold text-slate-300">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="h-4 w-4 text-slate-500 absolute left-3 top-3" />
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="pl-9"
                />
              </div>
            </div>

            {/* Current Location */}
            <div className="space-y-1.5">
              <label htmlFor="location" className="text-xs font-semibold text-slate-300">
                Location (City, Country)
              </label>
              <div className="relative">
                <MapPin className="h-4 w-4 text-slate-500 absolute left-3 top-3" />
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="San Francisco, CA or Remote"
                  className="pl-9"
                />
              </div>
            </div>

            {/* University */}
            <div className="space-y-1.5">
              <label htmlFor="university" className="text-xs font-semibold text-slate-300">
                University / Institution
              </label>
              <Input
                id="university"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                placeholder="State University"
              />
            </div>

            {/* Degree Program */}
            <div className="space-y-1.5">
              <label htmlFor="degree" className="text-xs font-semibold text-slate-300">
                Degree / Major
              </label>
              <Input
                id="degree"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                placeholder="B.S. in Computer Science"
              />
            </div>

            {/* Graduation Year */}
            <div className="space-y-1.5">
              <label htmlFor="graduationYear" className="text-xs font-semibold text-slate-300">
                Graduation Year
              </label>
              <Input
                id="graduationYear"
                type="number"
                min="1990"
                max="2035"
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
                placeholder="2026"
              />
            </div>

            {/* Experience Level */}
            <div className="space-y-1.5">
              <label htmlFor="experienceLevel" className="text-xs font-semibold text-slate-300">
                Experience Level
              </label>
              <select
                id="experienceLevel"
                value={experienceLevel}
                onChange={(e) =>
                  setExperienceLevel(e.target.value as "Entry" | "Mid" | "Senior")
                }
                className="flex h-10 w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-colors"
              >
                <option value="Entry">Entry Level / New Grad (0-2 yrs)</option>
                <option value="Mid">Mid Level (2-5 yrs)</option>
                <option value="Senior">Senior Level (5+ yrs)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Career Targets & Preferences */}
      <Card className="glass-card border-slate-800">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-indigo-400" />
            <span>Career Targets & Professional Bio</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Directly informs AI job compatibility ratings and interview simulation questions
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Preferred Role */}
            <div className="space-y-1.5">
              <label htmlFor="preferredRole" className="text-xs font-semibold text-slate-300">
                Target Job Role *
              </label>
              <Input
                id="preferredRole"
                value={preferredRole}
                onChange={(e) => setPreferredRole(e.target.value)}
                placeholder="e.g. Full Stack Engineer, Frontend Developer"
                required
              />
            </div>

            {/* Preferred Locations */}
            <div className="space-y-1.5">
              <label htmlFor="locationsInput" className="text-xs font-semibold text-slate-300">
                Preferred Locations (comma separated)
              </label>
              <Input
                id="locationsInput"
                value={locationsInput}
                onChange={(e) => setLocationsInput(e.target.value)}
                placeholder="Remote, New York, Seattle"
              />
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="bio" className="text-xs font-semibold text-slate-300">
                Professional Bio (Summary)
              </label>
              <span className="text-[10px] text-slate-500 font-mono">
                {bio.length} / 500 characters
              </span>
            </div>
            <textarea
              id="bio"
              rows={3}
              value={bio}
              maxLength={500}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Ambitious computer science graduate passionate about scalable distributed systems and modern web development..."
              className="flex w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            />
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Technical Skills Tag Manager */}
      <Card className="glass-card border-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Layers className="h-4 w-4 text-purple-400" />
                <span>Technical Skills Management</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Add, manage, and curate skills for automated skill-gap analysis
              </CardDescription>
            </div>
            <Badge variant="purple" className="text-[10px]">
              {skills.length} Skills Listed
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Add skill input form */}
          <div className="flex gap-2">
            <Input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={handleKeyDownSkill}
              placeholder="Type a skill and press Enter (e.g. Next.js, Docker, Python)..."
              className="flex-1"
            />
            <Button
              type="button"
              onClick={() => handleAddSkill(newSkill)}
              variant="secondary"
              className="shrink-0 gap-1 text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Skill</span>
            </Button>
          </div>

          {/* Quick suggestions */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-medium text-slate-400">
              Quick Suggestions (Click to add):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {suggestedSkills.map((s) => {
                const alreadyAdded = skills.some(
                  (sk) => sk.toLowerCase() === s.toLowerCase()
                );
                return (
                  <button
                    key={s}
                    type="button"
                    disabled={alreadyAdded}
                    onClick={() => handleAddSkill(s)}
                    className={`text-[11px] px-2.5 py-1 rounded-md border transition-all ${
                      alreadyAdded
                        ? "bg-slate-900/40 text-slate-600 border-slate-800 cursor-not-allowed"
                        : "bg-slate-900 text-slate-300 border-slate-700 hover:border-blue-500 hover:text-white"
                    }`}
                  >
                    + {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Skills Chip Matrix */}
          <div className="pt-2">
            <span className="text-[11px] font-medium text-slate-400 block mb-2">
              Your Current Skill Matrix:
            </span>
            {skills.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-500">
                No skills added yet. Add languages, frameworks, or cloud platforms above.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-slate-900/40 border border-slate-800">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-600/15 text-blue-300 border border-blue-500/30 shadow-sm"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-slate-400 hover:text-rose-400 focus:outline-none"
                      aria-label={`Remove ${skill}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Save Button Bar */}
      <div className="sticky bottom-4 z-20 p-4 rounded-2xl border border-slate-800 bg-slate-950/90 backdrop-blur-xl flex items-center justify-between shadow-2xl">
        <p className="text-xs text-slate-400 hidden sm:block">
          Profile changes will update your resume compatibility and skill-gap ratings.
        </p>
        <Button
          type="submit"
          variant="gradient"
          size="lg"
          disabled={saving}
          className="w-full sm:w-auto gap-2 px-8 py-5 text-sm font-semibold rounded-xl"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>Save Career Profile</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
