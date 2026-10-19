"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Loader2,
  AlertCircle,
  Briefcase,
  Layers,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { type SkillGapOutput } from "@/lib/ai/schemas";

const COMMON_ROLES = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Software Engineer",
  "Data Engineer",
  "DevOps Engineer",
  "Machine Learning Engineer",
];

export function SkillGapView() {
  const [targetRole, setTargetRole] = useState("Full Stack Developer");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [analysis, setAnalysis] = useState<SkillGapOutput | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Load existing saved skill gap profile if available
  useEffect(() => {
    async function fetchSaved() {
      try {
        const res = await fetch("/api/ai/skill-gap");
        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            setTargetRole(data.profile.targetRole || "Full Stack Developer");
            setAnalysis({
              targetRole: data.profile.targetRole,
              currentSkills: data.profile.currentSkills || [],
              requiredSkills: data.profile.requiredSkills || [],
              matchedSkills: data.profile.matchedSkills || [],
              skillGaps: data.profile.skillGaps || [],
              actionableRecommendations: data.profile.recommendations || [],
            });
          }
        }
      } catch (err) {
        console.error("Failed to load saved skill profile:", err);
      } finally {
        setInitialLoading(false);
      }
    }

    fetchSaved();
  }, []);

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage("");

    if (!targetRole.trim()) {
      setErrorMessage("Please enter or select a target role.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/ai/skill-gap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetRole: targetRole.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Failed to generate skill gap analysis.");
        setLoading(false);
        return;
      }

      setAnalysis(data.analysis);
      setLoading(false);
    } catch (err: unknown) {
      console.error("Skill gap analysis error:", err);
      setErrorMessage("Network error while communicating with AI service.");
      setLoading(false);
    }
  };

  const getPriorityBadge = (priority: "HIGH" | "MEDIUM" | "LOW") => {
    switch (priority) {
      case "HIGH":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            HIGH PRIORITY
          </span>
        );
      case "MEDIUM":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            MEDIUM PRIORITY
          </span>
        );
      case "LOW":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
            LOW PRIORITY
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <TrendingUp className="h-6 w-6 text-amber-400" />
            <span>Skill Gap Matrix</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Benchmark your current profile against target roles and discover high-impact competencies to master.
          </p>
        </div>
      </div>

      {/* Target Role Selector */}
      <Card className="glass-card border-slate-800">
        <CardHeader>
          <CardTitle className="text-base text-white">Target Career Path</CardTitle>
          <CardDescription className="text-xs">
            Select a target position or enter a custom job title to benchmark your current skills against industry expectations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleAnalyze} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Briefcase className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <Input
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Full Stack Developer, Data Engineer"
                  className="pl-9 h-10 text-xs"
                />
              </div>

              <Button
                type="submit"
                variant="gradient"
                disabled={loading}
                className="gap-2 px-6 h-10 text-xs font-semibold shrink-0"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Analyzing Gaps...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Run Gap Analysis</span>
                  </>
                )}
              </Button>
            </div>

            {/* Quick Select Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-semibold text-slate-400 mr-1">Popular Roles:</span>
              {COMMON_ROLES.map((role) => (
                <button
                  type="button"
                  key={role}
                  onClick={() => setTargetRole(role)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                    targetRole.toLowerCase() === role.toLowerCase()
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                      : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Results Matrix */}
      {initialLoading ? (
        <div className="p-8 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
          <span>Checking for existing skill matrix...</span>
        </div>
      ) : analysis ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Target Role & Match Ratio Card */}
          <Card className="glass-card border-slate-800 bg-gradient-to-r from-amber-950/30 via-slate-900 to-indigo-950/20">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs uppercase tracking-wider font-semibold text-amber-400">
                    Target Role Profile
                  </div>
                  <h2 className="text-xl font-bold text-white">{analysis.targetRole}</h2>
                  <p className="text-xs text-slate-400">
                    Benchmarked against your Profile & Resume skills.
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-2xl font-black text-amber-400">
                      {analysis.matchedSkills.length}/{analysis.requiredSkills.length}
                    </div>
                    <div className="text-[10px] uppercase font-semibold text-slate-400">
                      Skills Satisfied
                    </div>
                  </div>
                  <div className="h-10 w-px bg-slate-800" />
                  <div className="text-right">
                    <div className="text-2xl font-black text-rose-400">
                      {analysis.skillGaps.length}
                    </div>
                    <div className="text-[10px] uppercase font-semibold text-slate-400">
                      Gaps Identified
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Skills vs Required Skills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Matched Skills */}
            <Card className="glass-card border-slate-800">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Skills You Currently Possess</span>
                  </CardTitle>
                  <Badge variant="success" className="text-[10px]">
                    {analysis.matchedSkills.length} Matched
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {analysis.matchedSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.matchedSkills.map((s) => (
                      <span
                        key={s}
                        className="px-2.5 py-1 rounded-md text-xs bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    No matching skills detected for this role yet. Consider updating your Profile skills or uploading your Resume.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Target Role Core Skills */}
            <Card className="glass-card border-slate-800">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-indigo-400 flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    <span>Industry Expected Competencies</span>
                  </CardTitle>
                  <Badge variant="purple" className="text-[10px]">
                    {analysis.requiredSkills.length} Total
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.requiredSkills.map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-1 rounded-md text-xs bg-slate-800 text-slate-300 border border-slate-700"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Prioritized Skill Gaps */}
          <Card className="glass-card border-slate-800">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                    <span>Prioritized Skill Gaps</span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Competencies ordered by impact on hiring decisions
                  </CardDescription>
                </div>
                <Badge variant="destructive" className="text-[10px]">
                  {analysis.skillGaps.length} Gaps
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {analysis.skillGaps.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {analysis.skillGaps.map((gap, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 flex flex-col justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-white text-xs">{gap.skill}</span>
                          {getPriorityBadge(gap.priority)}
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          {gap.reason}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-800/60 flex items-center gap-1.5 text-[11px] text-amber-300/90 font-medium">
                        <BookOpen className="h-3 w-3 text-amber-400 shrink-0" />
                        <span className="truncate">{gap.learningDirection}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-emerald-300 text-xs">
                  Congratulations! No critical skill gaps identified for {analysis.targetRole}.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actionable Learning Pathways */}
          <Card className="glass-card border-slate-800 bg-slate-900/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-yellow-400" />
                <span>Actionable Learning Pathway Recommendations</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Realistic self-study topics and portfolio projects to close identified gaps
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {analysis.actionableRecommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-200 flex items-start gap-2.5"
                >
                  <span className="font-bold text-amber-400 shrink-0">{idx + 1}.</span>
                  <span>{rec}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="glass-card border-slate-800">
          <CardContent className="p-8 text-center flex flex-col items-center justify-center space-y-3">
            <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-white">No Skill Matrix Generated Yet</h4>
              <p className="text-xs text-slate-400 max-w-sm">
                Enter your desired career role above and click &quot;Run Gap Analysis&quot; to benchmark your competencies against current market demands.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
