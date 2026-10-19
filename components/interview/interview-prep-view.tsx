"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bot,
  Sparkles,
  Layers,
  Award,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Loader2,
  AlertCircle,
  Building2,
  History,
  RotateCcw,
  Send,
  SkipForward,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { type InterviewQuestionItem, type InterviewAnswerEvaluationOutput } from "@/lib/ai/schemas";

interface ApplicationOption {
  _id: string;
  company: string;
  jobTitle: string;
}

interface HistoricalSession {
  _id: string;
  jobTitle?: string;
  company?: string;
  sessionType: string;
  difficulty: string;
  overallScore?: number;
  createdAt: string;
}

export function InterviewPrepView() {
  // Session Configuration States
  const [sessionType, setSessionType] = useState<"GENERAL" | "TECHNICAL" | "BEHAVIORAL" | "JOB_SPECIFIC">("TECHNICAL");
  const [difficulty, setDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">("MEDIUM");
  const [selectedAppId, setSelectedAppId] = useState<string>("");
  const [customRole, setCustomRole] = useState<string>("");
  const [customCompany, setCustomCompany] = useState<string>("");
  const [userApplications, setUserApplications] = useState<ApplicationOption[]>([]);
  const [historySessions, setHistorySessions] = useState<HistoricalSession[]>([]);

  // Active Session State
  const [activeStep, setActiveStep] = useState<"CONFIG" | "IN_PROGRESS" | "SUMMARY" | "VIEW_PAST">("CONFIG");
  const [questions, setQuestions] = useState<InterviewQuestionItem[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Evaluated answers for the current session
  const [evaluatedAnswers, setEvaluatedAnswers] = useState<
    Array<{
      questionId: string;
      question: string;
      category: string;
      expectedFocus?: string;
      userAnswer: string;
      evaluation?: InterviewAnswerEvaluationOutput;
    }>
  >([]);

  // Current question evaluation result
  const [currentEvaluation, setCurrentEvaluation] = useState<InterviewAnswerEvaluationOutput | null>(null);

  // Overall session evaluation result
  const [sessionReport, setSessionReport] = useState<{
    overallScore: number;
    overallFeedback: string;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  } | null>(null);

  // Load user applications and past sessions on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [appsRes, histRes] = await Promise.all([
          fetch("/api/applications"),
          fetch("/api/ai/interview/history"),
        ]);

        if (appsRes.ok) {
          const appsData = await appsRes.json();
          setUserApplications(appsData.applications || []);
        }

        if (histRes.ok) {
          const histData = await histRes.json();
          setHistorySessions(histData.sessions || []);
        }
      } catch (err) {
        console.error("Failed to load interview context:", err);
      }
    }
    loadData();
  }, []);

  const handleStartSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      setLoading(true);

      let targetCompany = customCompany.trim();
      let targetRole = customRole.trim();

      if (selectedAppId) {
        const found = userApplications.find((a) => a._id === selectedAppId);
        if (found) {
          targetCompany = found.company;
          targetRole = found.jobTitle;
        }
      }

      const res = await fetch("/api/ai/interview/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionType,
          difficulty,
          applicationId: selectedAppId || undefined,
          jobTitle: targetRole || undefined,
          company: targetCompany || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Failed to generate interview questions.");
        setLoading(false);
        return;
      }

      setQuestions(data.questions || []);
      setCurrentQuestionIndex(0);
      setCurrentAnswer("");
      setCurrentEvaluation(null);
      setEvaluatedAnswers([]);
      setActiveStep("IN_PROGRESS");
      setLoading(false);
    } catch (err) {
      console.error("Start session error:", err);
      setErrorMessage("Network error while connecting to AI interviewer.");
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim() || currentAnswer.trim().length < 5) {
      setErrorMessage("Please enter an answer with at least 5 characters.");
      return;
    }

    setErrorMessage("");
    const currentQ = questions[currentQuestionIndex];

    try {
      setEvaluating(true);
      const res = await fetch("/api/ai/interview/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: currentQ.question,
          userAnswer: currentAnswer.trim(),
          category: currentQ.category,
          expectedFocus: currentQ.expectedFocus,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Evaluation failed. Try again.");
        setEvaluating(false);
        return;
      }

      const evalResult: InterviewAnswerEvaluationOutput = data.evaluation;
      setCurrentEvaluation(evalResult);

      setEvaluatedAnswers((prev) => [
        ...prev,
        {
          questionId: currentQ.questionId,
          question: currentQ.question,
          category: currentQ.category,
          expectedFocus: currentQ.expectedFocus,
          userAnswer: currentAnswer.trim(),
          evaluation: evalResult,
        },
      ]);

      setEvaluating(false);
    } catch (err) {
      console.error("Evaluation error:", err);
      setErrorMessage("Failed to evaluate answer.");
      setEvaluating(false);
    }
  };

  const handleSkipQuestion = () => {
    const currentQ = questions[currentQuestionIndex];
    setEvaluatedAnswers((prev) => [
      ...prev,
      {
        questionId: currentQ.questionId,
        question: currentQ.question,
        category: currentQ.category,
        expectedFocus: currentQ.expectedFocus,
        userAnswer: "Skipped by candidate",
        evaluation: {
          score: 0,
          strengths: [],
          weaknesses: ["Question was skipped without an answer."],
          feedback: "No answer was provided. In real interviews, try answering with partial reasoning rather than conceding completely.",
          improvedAnswer: "Always structure at least a high-level trade-off analysis or ask clarifying questions when encountering unfamiliar topics.",
        },
      },
    ]);

    advanceNext();
  };

  const advanceNext = () => {
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setCurrentAnswer("");
      setCurrentEvaluation(null);
      setErrorMessage("");
    } else {
      finalizeSession();
    }
  };

  const finalizeSession = async () => {
    try {
      setLoading(true);
      let targetCompany = customCompany.trim();
      let targetRole = customRole.trim();

      if (selectedAppId) {
        const found = userApplications.find((a) => a._id === selectedAppId);
        if (found) {
          targetCompany = found.company;
          targetRole = found.jobTitle;
        }
      }

      const res = await fetch("/api/ai/interview/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: selectedAppId || undefined,
          jobTitle: targetRole || "Software Engineer",
          company: targetCompany || "Tech Company",
          sessionType,
          difficulty,
          questions: evaluatedAnswers,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setSessionReport({
          overallScore: json.session.overallScore,
          overallFeedback: json.session.overallFeedback,
          strengths: json.session.strengths || [],
          weaknesses: json.session.weaknesses || [],
          recommendations: json.session.recommendations || [],
        });
        setActiveStep("SUMMARY");
        // Refresh history
        fetch("/api/ai/interview/history")
          .then((r) => r.json())
          .then((d) => setHistorySessions(d.sessions || []));
      }
    } catch (err) {
      console.error("Finalize session error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
    if (score >= 60) return "text-indigo-400 border-indigo-500/30 bg-indigo-500/10";
    if (score >= 40) return "text-amber-400 border-amber-500/30 bg-amber-500/10";
    return "text-rose-400 border-rose-500/30 bg-rose-500/10";
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Bot className="h-6 w-6 text-purple-400" />
            <span>AI Interview Preparation</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Practice realistic interview questions using your resume, skills, and target role.
          </p>
        </div>

        {activeStep !== "CONFIG" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveStep("CONFIG")}
            className="gap-1.5 text-xs w-fit"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>New Practice Session</span>
          </Button>
        )}
      </div>

      {/* STEP 1: CONFIGURATION */}
      {activeStep === "CONFIG" && (
        <div className="space-y-8">
          <Card className="glass-card border-slate-800">
            <CardHeader>
              <CardTitle className="text-base text-white">Configure Practice Session</CardTitle>
              <CardDescription className="text-xs">
                Select session focus, difficulty, and optionally link one of your tracked applications
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleStartSession} className="space-y-5">
                {errorMessage && (
                  <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Session Type Grid */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Interview Type
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { type: "TECHNICAL", label: "Technical", desc: "Stack fundamentals & architecture" },
                      { type: "BEHAVIORAL", label: "Behavioral", desc: "STAR scenarios & collaboration" },
                      { type: "JOB_SPECIFIC", label: "Job Specific", desc: "Targeted to company & role" },
                      { type: "GENERAL", label: "General", desc: "Core software engineering" },
                    ].map((item) => (
                      <button
                        type="button"
                        key={item.type}
                        onClick={() => setSessionType(item.type as any)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          sessionType === item.type
                            ? "bg-purple-500/20 text-white border-purple-500/50"
                            : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700"
                        }`}
                      >
                        <div className="text-xs font-bold">{item.label}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                          {item.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difficulty */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Target Difficulty
                  </label>
                  <div className="grid grid-cols-3 gap-2.5 max-w-md">
                    {(["EASY", "MEDIUM", "HARD"] as const).map((diff) => (
                      <button
                        type="button"
                        key={diff}
                        onClick={() => setDifficulty(diff)}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                          difficulty === diff
                            ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/50"
                            : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700"
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Practice for an existing application */}
                {userApplications.length > 0 && (
                  <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Practice for an Application</span>
                    </label>
                    <select
                      value={selectedAppId}
                      onChange={(e) => {
                        setSelectedAppId(e.target.value);
                        if (e.target.value) {
                          setSessionType("JOB_SPECIFIC");
                        }
                      }}
                      className="w-full h-9 rounded-xl border border-slate-700 bg-slate-900 px-3 text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="">-- Manual Target Role / General Practice --</option>
                      {userApplications.map((app) => (
                        <option key={app._id} value={app._id}>
                          {app.jobTitle} at {app.company}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Manual Role & Company Inputs if no application selected */}
                {!selectedAppId && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-300">
                        Target Role (Optional)
                      </label>
                      <Input
                        value={customRole}
                        onChange={(e) => setCustomRole(e.target.value)}
                        placeholder="e.g. Full Stack Engineer"
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-300">
                        Target Company (Optional)
                      </label>
                      <Input
                        value={customCompany}
                        onChange={(e) => setCustomCompany(e.target.value)}
                        placeholder="e.g. Stripe, OpenAI"
                        className="h-9 text-xs"
                      />
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="gradient"
                    disabled={loading}
                    className="gap-2 px-6 py-5 rounded-xl text-xs font-semibold"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Generating Grounded Questions...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        <span>Start Interview Session</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Past Sessions History */}
          {historySessions.length > 0 && (
            <Card className="glass-card border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                  <History className="h-4 w-4 text-slate-400" />
                  <span>Previous Practice Sessions</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Review historical scores and simulated interview evaluations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2.5">
                  {historySessions.slice(0, 5).map((s) => (
                    <div
                      key={s._id}
                      className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="font-semibold text-white">
                          {s.jobTitle} {s.company ? `at ${s.company}` : ""}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2">
                          <span className="capitalize">{s.sessionType.toLowerCase()}</span>
                          <span>•</span>
                          <span>{s.difficulty}</span>
                          <span>•</span>
                          <span>{new Date(s.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {s.overallScore !== undefined && (
                        <div
                          className={`px-3 py-1 rounded-lg border font-bold text-xs ${getScoreColor(
                            s.overallScore
                          )}`}
                        >
                          {s.overallScore}/100
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* STEP 2: IN_PROGRESS QUESTION STEPPER */}
      {activeStep === "IN_PROGRESS" && questions.length > 0 && (
        <div className="space-y-6">
          {/* Progress Header */}
          <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
            <span className="font-semibold text-purple-400">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <div className="flex items-center gap-2">
              <Badge variant="purple" className="text-[10px]">
                {questions[currentQuestionIndex].category}
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                {difficulty}
              </Badge>
            </div>
          </div>

          {/* Question Card */}
          <Card className="glass-card border-slate-800 bg-slate-900/90">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                &ldquo;{questions[currentQuestionIndex].question}&rdquo;
              </h2>

              {questions[currentQuestionIndex].expectedFocus && (
                <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 text-purple-300 text-xs flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 shrink-0 text-purple-400 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Interviewer Focus:</span>
                    <span>{questions[currentQuestionIndex].expectedFocus}</span>
                  </div>
                </div>
              )}

              {/* Candidate Answer Input */}
              {!currentEvaluation ? (
                <div className="space-y-3 pt-2">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Your Response
                  </label>
                  <textarea
                    rows={6}
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder="Type your answer... Structure with STAR (Situation, Task, Action, Result) for behavioral questions, or clarify architecture and trade-offs for technical questions."
                    className="flex w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-xs text-slate-100 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 transition-colors leading-relaxed font-sans"
                  />

                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleSkipQuestion}
                      className="gap-1.5 text-xs text-slate-400"
                    >
                      <SkipForward className="h-3.5 w-3.5" />
                      <span>Skip</span>
                    </Button>

                    <Button
                      type="button"
                      variant="gradient"
                      size="sm"
                      disabled={evaluating}
                      onClick={handleSubmitAnswer}
                      className="gap-1.5 text-xs"
                    >
                      {evaluating ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Evaluating Response...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-3.5 w-3.5" />
                          <span>Submit Answer</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                /* Instant AI Evaluation Feedback */
                <div className="space-y-4 pt-2 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-xs font-semibold text-slate-300">
                      Answer Evaluation
                    </span>
                    <div
                      className={`px-3 py-1 rounded-lg border font-bold text-sm ${getScoreColor(
                        currentEvaluation.score
                      )}`}
                    >
                      Score: {currentEvaluation.score}/100
                    </div>
                  </div>

                  {/* Feedback Text */}
                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                    <span className="font-semibold text-white block mb-1">
                      Constructive Feedback:
                    </span>
                    <p>{currentEvaluation.feedback}</p>
                  </div>

                  {/* Strengths & Weaknesses */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-emerald-300 space-y-1.5">
                      <span className="font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Strengths</span>
                      </span>
                      <ul className="space-y-1 pl-4 list-disc text-emerald-400/90 text-[11px]">
                        {currentEvaluation.strengths.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 text-amber-300 space-y-1.5">
                      <span className="font-semibold flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                        <span>Missed Opportunities</span>
                      </span>
                      <ul className="space-y-1 pl-4 list-disc text-amber-400/90 text-[11px]">
                        {currentEvaluation.weaknesses.map((w, i) => (
                          <li key={i}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Improved Model Answer */}
                  {currentEvaluation.improvedAnswer && (
                    <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-xs space-y-1">
                      <span className="font-semibold text-indigo-300 flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
                        <span>Exemplary Senior Engineer Answer</span>
                      </span>
                      <p className="text-slate-300 text-[11px] leading-relaxed italic">
                        &ldquo;{currentEvaluation.improvedAnswer}&rdquo;
                      </p>
                    </div>
                  )}

                  {/* Advance Button */}
                  <div className="flex justify-end pt-2">
                    <Button
                      type="button"
                      variant="gradient"
                      size="sm"
                      onClick={advanceNext}
                      className="gap-1.5 text-xs"
                    >
                      <span>
                        {currentQuestionIndex + 1 < questions.length
                          ? "Next Question"
                          : "Finish & View Full Report"}
                      </span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* STEP 3: SUMMARY REPORT */}
      {activeStep === "SUMMARY" && sessionReport && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <Card className="glass-card border-slate-800 bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/30">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <Badge variant="purple" className="text-[10px]">
                      Session Completed
                    </Badge>
                    <span className="text-xs text-slate-400">
                      {questions.length} questions answered
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    Overall Performance Score: {sessionReport.overallScore}/100
                  </h2>
                  <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                    {sessionReport.overallFeedback}
                  </p>
                </div>

                <div
                  className={`flex flex-col items-center justify-center h-28 w-28 rounded-2xl border-2 shrink-0 ${getScoreColor(
                    sessionReport.overallScore
                  )}`}
                >
                  <span className="text-3xl font-extrabold tracking-tight">
                    {sessionReport.overallScore}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider mt-0.5">
                    Score
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Strengths & Weaknesses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="glass-card border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Demonstrated Strengths</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {sessionReport.strengths.map((str, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{str}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="glass-card border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-amber-400 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Key Areas to Improve</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {sessionReport.weaknesses.map((w, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                    <span>{w}</span>
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
                <span>Actionable Recommendations for the Real Interview</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {sessionReport.recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-200 flex items-start gap-2.5"
                >
                  <span className="font-bold text-purple-400 shrink-0">{idx + 1}.</span>
                  <span>{rec}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-center pt-2">
            <Button
              variant="gradient"
              onClick={() => setActiveStep("CONFIG")}
              className="gap-2 text-xs px-6 py-5 rounded-xl font-semibold"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Start Another Practice Session</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
