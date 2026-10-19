"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Building2,
  MapPin,
  Briefcase,
  Sparkles,
  Layers,
  Award,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { type JobAnalysisOutput } from "@/lib/ai/schemas";

export function JobAnalyzerView() {
  const [description, setDescription] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [jobUrl, setJobUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<JobAnalysisOutput | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!description.trim() || description.trim().length < 30) {
      setErrorMessage("Please paste a job description with at least 30 characters.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/ai/job-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription: description.trim(),
          jobTitle: jobTitle.trim() || undefined,
          company: company.trim() || undefined,
          location: location.trim() || undefined,
          jobUrl: jobUrl.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Failed to analyze job description.");
        setLoading(false);
        return;
      }

      setAnalysis(data.analysis);
      setLoading(false);
    } catch (err: unknown) {
      console.error("Job analysis error:", err);
      setErrorMessage("Network error while communicating with AI service.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Search className="h-6 w-6 text-indigo-400" />
            <span>Job Description Analyzer</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Extract mandatory technical requirements, preferred qualifications, and keywords from any job posting.
          </p>
        </div>
      </div>

      {/* Input Form */}
      <Card className="glass-card border-slate-800">
        <CardHeader>
          <CardTitle className="text-base text-white">Paste Job Posting</CardTitle>
          <CardDescription className="text-xs">
            Paste the raw text of any job description from LinkedIn, Indeed, or career portals
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleAnalyze} className="space-y-4">
            {/* Optional Metadata Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">
                  Target Title (Optional)
                </label>
                <Input
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Software Engineer"
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">
                  Company (Optional)
                </label>
                <Input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Stripe, Google"
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">
                  Location (Optional)
                </label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Remote, San Francisco"
                  className="h-9 text-xs"
                />
              </div>
            </div>

            {/* Description Textarea */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 block">
                Job Description *
              </label>
              <textarea
                rows={8}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Paste the full job posting requirements and responsibilities here..."
                className="flex w-full rounded-xl border border-slate-700 bg-slate-900/90 p-3 text-xs text-slate-100 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-colors leading-relaxed font-sans"
                required
              />
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <Button
              type="submit"
              variant="gradient"
              disabled={loading}
              className="gap-2 px-6 py-5 rounded-xl text-xs font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Extracting Requirements with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Analyze Job Requirements</span>
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Structured Results Display */}
      {analysis && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Header Overview Card */}
          <Card className="glass-card border-slate-800 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-blue-950/30">
            <CardContent className="p-6 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span>{analysis.jobTitle}</span>
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                    {analysis.company && (
                      <span className="flex items-center gap-1 text-slate-300">
                        <Building2 className="h-3.5 w-3.5 text-indigo-400" />
                        <span>{analysis.company}</span>
                      </span>
                    )}
                    {analysis.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-slate-500" />
                        <span>{analysis.location}</span>
                      </span>
                    )}
                    <Badge variant="purple" className="text-[10px]">
                      {analysis.seniority}
                    </Badge>
                  </div>
                </div>

                <Link
                  href={`/job-matcher`}
                  className="shrink-0"
                >
                  <Button variant="gradient" size="sm" className="gap-1.5 text-xs">
                    <span>Match with My Profile</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>

              {analysis.summary && (
                <p className="text-xs text-slate-300 leading-relaxed border-t border-slate-800/80 pt-3">
                  {analysis.summary}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Requirements Grid: Required vs Preferred Skills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Required Skills */}
            <Card className="glass-card border-slate-800">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Mandatory Technical Requirements</span>
                  </CardTitle>
                  <Badge variant="success" className="text-[10px]">
                    {analysis.requiredTechnicalSkills.length} Required
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.requiredTechnicalSkills.map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-1 rounded-md text-xs bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Preferred Skills */}
            <Card className="glass-card border-slate-800">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-indigo-400 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    <span>Preferred & Bonus Qualifications</span>
                  </CardTitle>
                  <Badge variant="purple" className="text-[10px]">
                    {analysis.preferredSkills.length} Preferred
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.preferredSkills.map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-1 rounded-md text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/30"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Responsibilities & Keywords */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Responsibilities */}
            <Card className="glass-card border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-blue-400" />
                  <span>Core Responsibilities</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {analysis.responsibilities.map((resp, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0 mt-1.5" />
                    <span>{resp}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Important ATS Keywords */}
            <Card className="glass-card border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                  <Layers className="h-4 w-4 text-purple-400" />
                  <span>High-Priority ATS Keywords</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.importantKeywords.map((kw) => (
                    <span
                      key={kw}
                      className="px-2.5 py-1 rounded-md text-xs bg-slate-800 text-slate-300 border border-slate-700 font-mono"
                    >
                      #{kw}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
