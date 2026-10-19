"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Target,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Loader2,
  AlertCircle,
  FileText,
  User,
  Zap,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { type JobMatchOutput } from "@/lib/ai/schemas";

export function JobMatcherView() {
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [matchData, setMatchData] = useState<JobMatchOutput | null>(null);
  const [dataSource, setDataSource] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!jobDescription.trim() || jobDescription.trim().length < 30) {
      setErrorMessage("Please paste a job description with at least 30 characters.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/ai/job-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription: jobDescription.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Failed to calculate job compatibility.");
        setLoading(false);
        return;
      }

      setMatchData(data.match);
      setDataSource(data.dataSource || "Candidate Data");
      setLoading(false);
    } catch (err: unknown) {
      console.error("Match error:", err);
      setErrorMessage("Network error while communicating with AI service.");
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400 border-emerald-500/40 bg-emerald-500/10";
    if (score >= 60) return "text-indigo-400 border-indigo-500/40 bg-indigo-500/10";
    if (score >= 40) return "text-amber-400 border-amber-500/40 bg-amber-500/10";
    return "text-rose-400 border-rose-500/40 bg-rose-500/10";
  };

  const getBarColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-indigo-500";
    if (score >= 40) return "bg-amber-500";
    return "bg-rose-500";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Target className="h-6 w-6 text-purple-400" />
            <span>AI Job Matcher</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Evaluate your match percentage against any job posting using real profile skills and verified resume data.
          </p>
        </div>
      </div>

      {/* Input Form Card */}
      <Card className="glass-card border-slate-800">
        <CardHeader>
          <CardTitle className="text-base text-white">Target Job Posting</CardTitle>
          <CardDescription className="text-xs">
            Paste the requirements and description of the role you want to evaluate
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleMatch} className="space-y-4">
            <div className="space-y-1">
              <textarea
                rows={7}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description, required qualifications, and responsibilities here..."
                className="flex w-full rounded-xl border border-slate-700 bg-slate-900/90 p-3 text-xs text-slate-100 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 transition-colors leading-relaxed font-sans"
                required
              />
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Sparkles className="h-4 w-4 text-purple-400" />
                <span>Grounded analysis using your profile and uploaded resume</span>
              </div>

              <Button
                type="submit"
                variant="gradient"
                disabled={loading}
                className="gap-2 px-6 py-5 rounded-xl text-xs font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Matching with Gemini AI...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    <span>Calculate Compatibility</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Match Results */}
      {matchData && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Degraded Fallback Banner if live Gemini was unreachable */}
          {matchData.isFallback && (
            <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-3">
              <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-300">Degraded AI Evaluation Notice</p>
                <p className="text-amber-300/80 mt-0.5">
                  The live Gemini AI model was unavailable or unconfigured ({matchData.fallbackReason || "GEMINI_API_KEY unset"}). Showing an offline structural baseline rather than a live model evaluation.
                </p>
              </div>
            </div>
          )}

          {/* Main Compatibility Hero Card */}
          <Card className="glass-card border-slate-800 bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/30">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
                <div className="space-y-2 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <span className="text-xs uppercase tracking-wider font-semibold text-purple-400">
                      Match Assessment
                    </span>
                    <Badge variant={matchData.isFallback ? "destructive" : "purple"} className="text-[10px]">
                      {matchData.isFallback ? "Offline Baseline" : dataSource}
                    </Badge>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    Overall Compatibility: {matchData.overallCompatibilityScore}%
                  </h2>
                  <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                    {matchData.matchSummary}
                  </p>
                </div>

                {/* Score Pill / Visual */}
                <div
                  className={`flex flex-col items-center justify-center h-28 w-28 rounded-2xl border-2 shrink-0 ${getScoreColor(
                    matchData.overallCompatibilityScore
                  )}`}
                >
                  <span className="text-3xl font-extrabold tracking-tight">
                    {matchData.overallCompatibilityScore}%
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider mt-0.5">
                    Match
                  </span>
                </div>
              </div>

              {/* Sub-Dimension Breakdown Progress Bars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800">
                <div className="space-y-1.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Skills Match</span>
                    <span className="font-bold text-white">{matchData.skillsMatchScore}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getBarColor(matchData.skillsMatchScore)}`}
                      style={{ width: `${matchData.skillsMatchScore}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Experience Alignment</span>
                    <span className="font-bold text-white">{matchData.experienceMatchScore}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getBarColor(matchData.experienceMatchScore)}`}
                      style={{ width: `${matchData.experienceMatchScore}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Education Fit</span>
                    <span className="font-bold text-white">{matchData.educationMatchScore}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getBarColor(matchData.educationMatchScore)}`}
                      style={{ width: `${matchData.educationMatchScore}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">ATS Keyword Overlap</span>
                    <span className="font-bold text-white">{matchData.keywordMatchScore}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getBarColor(matchData.keywordMatchScore)}`}
                      style={{ width: `${matchData.keywordMatchScore}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Matched vs Missing Skills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="glass-card border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Matched Skills & Proficiencies</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Competencies found in both your profile/resume and the target role
                </CardDescription>
              </CardHeader>
              <CardContent>
                {matchData.matchedSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {matchData.matchedSkills.map((s) => (
                      <span
                        key={s}
                        className="px-2.5 py-1 rounded-md text-xs bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No direct skill matches detected.</p>
                )}
              </CardContent>
            </Card>

            <Card className="glass-card border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-rose-400 flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  <span>Missing Role Competencies</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Target requirements absent from your current profile or resume
                </CardDescription>
              </CardHeader>
              <CardContent>
                {matchData.missingSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {matchData.missingSkills.map((s) => (
                      <span
                        key={s}
                        className="px-2.5 py-1 rounded-md text-xs bg-rose-500/10 text-rose-300 border border-rose-500/30"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-emerald-400">All major role competencies satisfied!</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Strengths & Potential Concerns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="glass-card border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  <span>Key Candidate Strengths for this Role</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(matchData.strengths || []).map((str, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{str}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="glass-card border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <span>Potential Recruiter Concerns</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {matchData.potentialConcerns.map((con, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                    <span>{con}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Recommendations Card */}
          <Card className="glass-card border-slate-800 bg-slate-900/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-yellow-400" />
                <span>Actionable Optimization Recommendations</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {matchData.recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-200 flex items-start gap-2.5"
                >
                  <span className="font-bold text-purple-400 shrink-0">{idx + 1}.</span>
                  <span>{rec}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Responsible AI Notice */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2.5">
            <Info className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-slate-300">Responsible AI Notice:</strong> Compatibility percentages and skill match scores are automated estimates to assist candidates with application preparation. They do not represent employment guarantees, hiring decisions, or bias-free screening. Candidates should critically review all recommendations.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
