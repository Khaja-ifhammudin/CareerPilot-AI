"use client";

import React, { useState, useRef } from "react";
import {
  FileText,
  Upload,
  Sparkles,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Award,
  Layers,
  Search,
  Check,
  AlertCircle,
  Loader2,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { type ResumeAnalysisOutput } from "@/lib/ai/schemas";

interface ResumeRecord {
  id: string;
  originalFileName: string;
  fileSize: number;
  mimeType: string;
  analysisStatus: "NOT_ANALYZED" | "PROCESSING" | "COMPLETED" | "FAILED";
  analysisResult?: ResumeAnalysisOutput | null;
  createdAt: string;
  updatedAt: string;
  textPreview?: string;
}

interface ResumeDashboardProps {
  initialResume: ResumeRecord | null;
}

export function ResumeDashboard({ initialResume }: ResumeDashboardProps) {
  const [resume, setResume] = useState<ResumeRecord | null>(initialResume);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(
    initialResume?.analysisStatus === "PROCESSING"
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleFileUpload = async (file: File) => {
    setErrorMessage("");
    setSuccessMessage("");

    // 1. Validation
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setErrorMessage("Only PDF resumes (.pdf) are permitted.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("File exceeds maximum size limit of 5 MB.");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/resume/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Failed to upload resume.");
        setUploading(false);
        return;
      }

      setResume(data.resume);
      setSuccessMessage("Resume uploaded and text extracted successfully! Ready for AI analysis.");
      setUploading(false);
    } catch (err: unknown) {
      console.error("Upload error:", err);
      setErrorMessage("Network error during resume upload. Please try again.");
      setUploading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!resume) return;
    setErrorMessage("");
    setSuccessMessage("");
    setAnalyzing(true);

    try {
      const res = await fetch("/api/resume/analyze", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Resume analysis failed. Please try again.");
        setResume((prev) => (prev ? { ...prev, analysisStatus: "FAILED" } : null));
        setAnalyzing(false);
        return;
      }

      setResume((prev) =>
        prev
          ? {
              ...prev,
              analysisStatus: "COMPLETED",
              analysisResult: data.analysis,
            }
          : null
      );
      setSuccessMessage("AI resume analysis completed successfully!");
      setAnalyzing(false);
    } catch (err: unknown) {
      console.error("Analyze error:", err);
      setErrorMessage("Network error while communicating with AI service.");
      setResume((prev) => (prev ? { ...prev, analysisStatus: "FAILED" } : null));
      setAnalyzing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete your resume and analysis?")) return;
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await fetch("/api/resume", {
        method: "DELETE",
      });

      if (!res.ok) {
        setErrorMessage("Failed to delete resume.");
        return;
      }

      setResume(null);
      setSuccessMessage("Resume removed successfully.");
    } catch (err: unknown) {
      console.error("Delete error:", err);
      setErrorMessage("Network error while deleting resume.");
    }
  };

  const analysis = resume?.analysisResult;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <FileText className="h-6 w-6 text-blue-400" />
            <span>Resume Intelligence</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Upload your resume and let CareerPilot analyze your ATS readiness, strengths, skills, and improvement opportunities.
          </p>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Upload Zone / Resume File Status */}
      {!resume ? (
        <Card className="glass-card border-slate-800 border-dashed hover:border-blue-500/40 transition-colors">
          <CardContent className="p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-4">
            <div className="h-16 w-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              {uploading ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : (
                <Upload className="h-8 w-8" />
              )}
            </div>

            <div className="space-y-1 max-w-md">
              <h3 className="text-base font-bold text-white">
                {uploading ? "Extracting & Parsing PDF..." : "Upload your PDF Resume"}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Drag and drop your resume file here or click below to browse. Supports PDF documents up to 5 MB.
              </p>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
              disabled={uploading}
            />

            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              variant="gradient"
              className="gap-2 px-6"
            >
              <Upload className="h-4 w-4" />
              <span>{uploading ? "Uploading..." : "Browse PDF File"}</span>
            </Button>

            <div className="pt-2 text-[11px] text-slate-500 flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
              <span>Stored privately in server storage • Never exposed publicly</span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="glass-card border-slate-800">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base text-white">{resume.originalFileName}</CardTitle>
                    <Badge
                      variant={
                        resume.analysisStatus === "COMPLETED"
                          ? "success"
                          : resume.analysisStatus === "PROCESSING"
                          ? "purple"
                          : resume.analysisStatus === "FAILED"
                          ? "destructive"
                          : "default"
                      }
                      className="text-[10px]"
                    >
                      {resume.analysisStatus === "PROCESSING" && (
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      )}
                      {resume.analysisStatus}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs text-slate-400 mt-0.5">
                    {formatFileSize(resume.fileSize)} • Uploaded on{" "}
                    {new Date(resume.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </CardDescription>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                  disabled={uploading || analyzing}
                />

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || analyzing}
                  className="text-xs gap-1.5"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Replace PDF</span>
                </Button>

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={uploading || analyzing}
                  className="text-xs gap-1.5"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </Button>

                <Button
                  size="sm"
                  variant="gradient"
                  onClick={handleAnalyze}
                  disabled={analyzing || uploading}
                  className="text-xs gap-1.5 shadow-md shadow-blue-500/20"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Analyzing with Gemini...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>{resume.analysisStatus === "COMPLETED" ? "Re-Analyze" : "Analyze Resume"}</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Analysis Results View */}
      {analysis && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Degraded Fallback Banner if live Gemini was unreachable */}
          {analysis.isFallback && (
            <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-3">
              <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-300">Degraded AI Evaluation Notice</p>
                <p className="text-amber-300/80 mt-0.5">
                  The live Gemini AI model was unavailable or unconfigured ({analysis.fallbackReason || "GEMINI_API_KEY unset"}). Showing an offline structural baseline rather than a live model evaluation.
                </p>
              </div>
            </div>
          )}

          {/* Dual Score Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Overall Score */}
            <Card className="glass-card border-slate-800 bg-gradient-to-br from-blue-950/40 to-slate-900/80">
              <CardContent className="p-6">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="font-semibold text-slate-300">Overall Resume Health</span>
                  {analysis.isFallback ? (
                    <Badge variant="destructive" className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px]">
                      Offline Baseline
                    </Badge>
                  ) : (
                    <Badge variant="default" className="text-[10px]">Gemini Evaluated</Badge>
                  )}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-white">{analysis.overallScore}</span>
                  <span className="text-slate-400 text-xs">/ 100</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mt-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-700"
                    style={{ width: `${analysis.overallScore}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                  Composite score weighing technical depth, formatting clarity, and impact verbs.
                </p>
              </CardContent>
            </Card>

            {/* ATS Readiness */}
            <Card className="glass-card border-slate-800 bg-gradient-to-br from-purple-950/40 to-slate-900/80">
              <CardContent className="p-6">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="font-semibold text-slate-300">ATS Machine Parsability</span>
                  <Badge variant="purple">Keyword Audit</Badge>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-indigo-400">
                    {analysis.atsReadinessScore}
                  </span>
                  <span className="text-slate-400 text-xs">/ 100</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mt-3">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-700"
                    style={{ width: `${analysis.atsReadinessScore}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                  Measures how cleanly Applicant Tracking Systems extract contact info, skills, and sections.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Professional Summary */}
          {analysis.professionalSummary && (
            <Card className="glass-card border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-200">
                  <FileText className="h-4 w-4 text-blue-400" />
                  <span>AI Profile Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {analysis.professionalSummary}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Skills Breakdown: Technical vs Soft Skills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Technical Skills */}
            <Card className="glass-card border-slate-800">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                    <Layers className="h-4 w-4 text-blue-400" />
                    <span>Technical Competencies Detected</span>
                  </CardTitle>
                  <Badge variant="default" className="text-[10px]">
                    {analysis.technicalSkills.length} Skills
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.technicalSkills.map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-1 rounded-md text-xs bg-blue-600/15 text-blue-300 border border-blue-500/30"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Soft Skills */}
            <Card className="glass-card border-slate-800">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                    <Award className="h-4 w-4 text-purple-400" />
                    <span>Soft & Leadership Skills</span>
                  </CardTitle>
                  <Badge variant="purple" className="text-[10px]">
                    {analysis.softSkills.length} Skills
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.softSkills.map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-1 rounded-md text-xs bg-purple-600/15 text-purple-300 border border-purple-500/30"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths */}
            <Card className="glass-card border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Resume Strengths</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {analysis.strengths.map((str, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{str}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Weaknesses */}
            <Card className="glass-card border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-rose-400 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Identified Vulnerabilities</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {analysis.weaknesses.map((w, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <XCircle className="h-3.5 w-3.5 text-rose-400 shrink-0 mt-0.5" />
                    <span>{w}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Missing Skills Matrix */}
          {analysis.missingSkills.length > 0 && (
            <Card className="glass-card border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-amber-400 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>Missing High-Demand Industry Skills</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Keywords and tools commonly expected by recruiters for your experience bracket
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {analysis.missingSkills.map((m) => (
                    <span
                      key={m}
                      className="px-3 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    >
                      + {m}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actionable Recommendations */}
          <Card className="glass-card border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-400" />
                <span>Actionable Recommendations for Maximum Callbacks</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {analysis.recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5"
                >
                  <span className="h-5 w-5 rounded-full bg-blue-600/20 text-blue-400 font-bold text-[10px] flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{rec}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Responsible AI Notice */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2.5">
            <Info className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-slate-300">Responsible AI Notice:</strong> CareerPilot AI evaluations, ATS scores, and recommendations are algorithmic estimates designed for career preparation guidance. They do not represent employment guarantees or automated recruitment decisions. Candidates retain full ownership and discretion over their resumes and career applications.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
