"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Target,
  Briefcase,
  Bot,
  BrainCircuit,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  Zap,
  Award,
  ChevronRight,
  Layers,
  Code2,
  BarChart3,
  Search,
  Check,
  Star,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Container } from "@/components/ui/container";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<"tracker" | "interview">("tracker");

  return (
    <div className="relative overflow-hidden bg-[#090d16]">
      {/* Background radial glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-full max-w-7xl bg-radial-gradient blur-3xl opacity-70" />
      <div className="pointer-events-none absolute top-[800px] right-0 h-[500px] w-[500px] bg-blue-600/10 rounded-full blur-[140px]" />
      <div className="pointer-events-none absolute top-[1800px] left-0 h-[500px] w-[500px] bg-purple-600/10 rounded-full blur-[140px]" />

      {/* ========================================================================= */}
      {/* 2. HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative pt-20 pb-20 md:pt-28 md:pb-28 border-b border-slate-800/60 bg-grid-pattern">
        <Container>
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-6">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 backdrop-blur-md text-xs font-semibold text-blue-300">
              <Sparkles className="h-3.5 w-3.5 text-blue-400 animate-spin" style={{ animationDuration: "6s" }} />
              <span>University AI Capstone • Production Full-Stack Architecture</span>
              <span className="hidden sm:inline-block text-slate-500">|</span>
              <span className="hidden sm:inline-block text-slate-300">Powered by Gemini AI</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
              Build your career <br />
              <span className="text-gradient">with AI.</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl font-normal leading-relaxed">
              Analyze your resume, discover skill gaps, match your profile with
              opportunities, track applications, and prepare for interviews — all
              in one place.
            </p>

            {/* Hero CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 w-full sm:w-auto">
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="lg" variant="gradient" className="w-full sm:w-auto gap-2 text-base px-8 py-6 rounded-xl shadow-xl shadow-blue-600/20">
                  <span>Get Started</span>
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 py-6 rounded-xl border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200">
                  Sign In
                </Button>
              </Link>
            </div>

            {/* Interactive Hero Showcase Preview */}
            <div className="w-full mt-12 pt-4">
              <div className="relative rounded-2xl border border-slate-800/80 bg-slate-950/80 p-2 sm:p-4 shadow-2xl shadow-blue-950/40 backdrop-blur-xl">
                {/* Fake browser bar */}
                <div className="flex items-center justify-between pb-3 px-2 border-b border-slate-800/60 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-rose-500/80" />
                    <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                    <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <div className="text-xs text-slate-400 font-mono bg-slate-900/80 px-3 py-1 rounded-md border border-slate-800">
                    careerpilot.ai/dashboard/overview
                  </div>
                  <div className="text-xs text-blue-400 font-medium hidden sm:flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    AI Engine Active
                  </div>
                </div>

                {/* Hero Dashboard Grid Mock */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                  {/* Card 1: Resume Score */}
                  <div className="glass-card p-4 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span className="font-medium text-slate-300">Resume Health</span>
                      <Badge variant="success">ATS Optimized</Badge>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-white">88</span>
                      <span className="text-xs text-slate-400">/ 100</span>
                      <span className="text-xs text-emerald-400 font-semibold ml-auto flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" /> +14 pts
                      </span>
                    </div>
                    <div className="mt-3 w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full w-[88%]" />
                    </div>
                    <p className="mt-2.5 text-[11px] text-slate-400 leading-tight">
                      Strong technical impact verbs; recommended to add 2 cloud computing metrics.
                    </p>
                  </div>

                  {/* Card 2: Job Match Rate */}
                  <div className="glass-card p-4 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span className="font-medium text-slate-300">Target Role Match</span>
                      <Badge variant="purple">Full-Stack Dev</Badge>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-indigo-400">85%</span>
                      <span className="text-xs text-slate-400">compatibility</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">TypeScript ✓</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">React ✓</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Next.js ✓</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20">Docker (Gap)</span>
                    </div>
                  </div>

                  {/* Card 3: Live Application Funnel */}
                  <div className="glass-card p-4 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span className="font-medium text-slate-300">Application Pipeline</span>
                      <span className="text-[11px] text-blue-400">Active Cycle</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center pt-1">
                      <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                        <div className="text-lg font-bold text-white">12</div>
                        <div className="text-[10px] text-slate-400">Applied</div>
                      </div>
                      <div className="bg-slate-900/60 p-2 rounded-lg border border-purple-500/20">
                        <div className="text-lg font-bold text-purple-400">4</div>
                        <div className="text-[10px] text-purple-300">Interviews</div>
                      </div>
                      <div className="bg-slate-900/60 p-2 rounded-lg border border-emerald-500/20">
                        <div className="text-lg font-bold text-emerald-400">2</div>
                        <div className="text-[10px] text-emerald-300">Offers</div>
                      </div>
                    </div>
                    <p className="mt-2.5 text-[11px] text-slate-400 text-center">
                      Conversion rate: <strong className="text-slate-200">33.3%</strong> (industry avg: 8%)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ========================================================================= */}
      {/* 3. PROBLEM STATEMENT */}
      {/* ========================================================================= */}
      <section className="py-20 border-b border-slate-800/60 bg-slate-950/40">
        <Container>
          <div className="text-center max-w-3xl mx-auto mb-14">
            <Badge variant="outline" className="mb-3 text-rose-400 border-rose-500/30 bg-rose-500/10">
              The Modern Job Search Crisis
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Why 75% of Qualified Candidates Get Filtered Out Before the First Interview
            </h2>
            <p className="mt-4 text-slate-400 text-base leading-relaxed">
              University graduates and job seekers apply into a void of opaque automated ATS filters, disorganized tracking spreadsheets, and generic interview guides.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-rose-500/20 bg-rose-950/10 backdrop-blur-sm">
              <div className="h-10 w-10 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">The ATS Black Hole</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Applicant Tracking Systems silently reject well-formatted resumes over missing synonyms, bad layout parsers, or misaligned experience keywords.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-amber-500/20 bg-amber-950/10 backdrop-blur-sm">
              <div className="h-10 w-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
                <Search className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Invisible Skill Gaps</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Candidates don't know which specific libraries, architectural tools, or certifications are actually holding them back from their dream engineering roles.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-blue-500/20 bg-blue-950/10 backdrop-blur-sm">
              <div className="h-10 w-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Fragmented Workflow</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Juggling disconnected spreadsheets, LeetCode tabs, generic ChatGPT prompts, and unorganized email threads wastes precious interview prep time.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* ========================================================================= */}
      {/* 4. HOW CAREERPILOT WORKS */}
      {/* ========================================================================= */}
      <section id="workflow" className="py-20 border-b border-slate-800/60 bg-[#090d16]">
        <Container>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="default" className="mb-3">
              Intelligent Pipeline
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              How CareerPilot AI Works
            </h2>
            <p className="mt-4 text-slate-400 text-base">
              A structured 4-step intelligence cycle that transforms raw resumes into compelling job offers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Step 1 */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800 relative">
              <div className="text-3xl font-black text-slate-700 mb-3">01</div>
              <div className="h-10 w-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Upload Resume</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Upload your PDF resume. Our parser extracts textual sections, experiences, and technical skill matrices.
              </p>
            </div>

            {/* Step 2 */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800 relative">
              <div className="text-3xl font-black text-slate-700 mb-3">02</div>
              <div className="h-10 w-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">AI Deep Analysis</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Gemini evaluates ATS readiness, action verbs, quantified achievements, and uncovers high-priority skill gaps.
              </p>
            </div>

            {/* Step 3 */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800 relative">
              <div className="text-3xl font-black text-slate-700 mb-3">03</div>
              <div className="h-10 w-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
                <Target className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Match & Track</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Paste any job description to instantly get an AI compatibility rating, keyword breakdown, and track your application pipeline.
              </p>
            </div>

            {/* Step 4 */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800 relative">
              <div className="text-3xl font-black text-slate-700 mb-3">04</div>
              <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                <Bot className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Mock Interview</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Practice targeted behavioral & technical questions tailored to the company, evaluated in real-time with STAR rubrics.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* ========================================================================= */}
      {/* 5. FEATURE SHOWCASE */}
      {/* ========================================================================= */}
      <section id="features" className="py-20 border-b border-slate-800/60 bg-slate-950/60">
        <Container>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="purple" className="mb-3">
              Full Spectrum Platform
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Six Powerful Modules. Zero Guesswork.
            </h2>
            <p className="mt-4 text-slate-400 text-base">
              Every tool is engineered to function collaboratively so your career profile compounds value at every milestone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <Card className="glass-card border-slate-800 hover:border-blue-500/40">
              <CardHeader>
                <div className="h-11 w-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-2">
                  <FileText className="h-5 w-5" />
                </div>
                <CardTitle>AI Resume Diagnostic</CardTitle>
                <CardDescription>
                  Comprehensive ATS audit scoring technical skills, soft skills, bullet impact, and structural parsing clarity.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-slate-400 space-y-2">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>ATS Readiness Score (0-100)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Quantifiable metric suggestions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Missing industry standard keywords</span>
                </div>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="glass-card border-slate-800 hover:border-indigo-500/40">
              <CardHeader>
                <div className="h-11 w-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-2">
                  <Target className="h-5 w-5" />
                </div>
                <CardTitle>Job Description Analyzer</CardTitle>
                <CardDescription>
                  Extracts core requirements, hidden expectations, tech stack needs, and seniority level from any pasted job posting.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-slate-400 space-y-2">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Required vs Preferred skills extraction</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Experience and credential parsing</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Saved job database for one-click matching</span>
                </div>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="glass-card border-slate-800 hover:border-purple-500/40">
              <CardHeader>
                <div className="h-11 w-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-2">
                  <Sparkles className="h-5 w-5" />
                </div>
                <CardTitle>AI Job Matcher</CardTitle>
                <CardDescription>
                  Multi-dimensional compatibility rating assessing skills, experience, education, and keywords against target roles.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-slate-400 space-y-2">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Overall match % estimate</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Direct matched skills breakdown</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Concrete improvement recommendations</span>
                </div>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="glass-card border-slate-800 hover:border-emerald-500/40">
              <CardHeader>
                <div className="h-11 w-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2">
                  <Briefcase className="h-5 w-5" />
                </div>
                <CardTitle>Application Tracker</CardTitle>
                <CardDescription>
                  Full CRUD application management with status lifecycles, interview date reminders, notes, and salary ranges.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-slate-400 space-y-2">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>6 structured status stages</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Fast search, filtering, and sorting</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Conversion rate & velocity analytics</span>
                </div>
              </CardContent>
            </Card>

            {/* Feature 5 */}
            <Card className="glass-card border-slate-800 hover:border-cyan-500/40">
              <CardHeader>
                <div className="h-11 w-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-2">
                  <Bot className="h-5 w-5" />
                </div>
                <CardTitle>AI Mock Interview Simulator</CardTitle>
                <CardDescription>
                  Generate targeted Technical, Behavioral, and HR questions with instant STAR evaluation and scoring.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-slate-400 space-y-2">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Contextual questions by role & seniority</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Evaluation of strengths & weaknesses</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Model answer coaching guidance</span>
                </div>
              </CardContent>
            </Card>

            {/* Feature 6 */}
            <Card className="glass-card border-slate-800 hover:border-amber-500/40">
              <CardHeader>
                <div className="h-11 w-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-2">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <CardTitle>Skill Gap Matrix</CardTitle>
                <CardDescription>
                  Benchmark current skills against industry requirements for target roles and generate personalized study roadmaps.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-slate-400 space-y-2">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Prioritized missing high-impact tech</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Explanation of why each skill matters</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Actionable self-learning trajectories</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </Container>
      </section>

      {/* ========================================================================= */}
      {/* 6. AI CAPABILITIES */}
      {/* ========================================================================= */}
      <section id="ai-capabilities" className="py-20 border-b border-slate-800/60 bg-[#090d16]">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge variant="outline" className="text-indigo-400 border-indigo-500/30 bg-indigo-500/10">
                Next-Gen Gemini Architecture
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Enterprise AI Engine Built for Career Accuracy
              </h2>
              <p className="text-slate-300 leading-relaxed text-base">
                Unlike generic chat interfaces, CareerPilot AI uses strict schema-constrained prompts on the server side. All AI outputs are validated through Zod schemas before being saved to MongoDB or rendered to candidates.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="h-7 w-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Zero Client Exposure</h4>
                    <p className="text-xs text-slate-400">All Gemini keys, prompt assembly, and sanitization remain strictly isolated on Next.js Route Handlers.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-7 w-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Zap className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Structured JSON Schemas</h4>
                    <p className="text-xs text-slate-400">Scores, skill arrays, and interview rubrics are returned in strict typed objects rather than markdown prose.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-7 w-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Award className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">STAR Evaluation Metric</h4>
                    <p className="text-xs text-slate-400">Interview feedback uses real hiring rubrics: Situation, Task, Action, Result, and Technical depth.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Code / Architecture Terminal Visual */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-2xl font-mono text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4 text-slate-500">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Code2 className="h-4 w-4 text-blue-400" /> lib/gemini.ts (Server-Side)
                </span>
                <span className="text-[11px] text-emerald-400 font-sans font-medium">Verified Server Action</span>
              </div>
              <pre className="text-slate-300 overflow-x-auto leading-relaxed">
{`// Schema-guaranteed AI Resume Evaluation
export async function analyzeResume(extractedText: string) {
  const prompt = \`Evaluate this resume against standard ATS metrics.
  Return valid JSON matching ResumeAnalysisSchema.\`;

  const response = await geminiModel.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: "application/json" }
  });

  const parsed = ResumeAnalysisSchema.safeParse(
    JSON.parse(response.text)
  );

  if (!parsed.success) throw new AIValidationError();
  return parsed.data; // Typed, validated, ready for Mongo
}`}
              </pre>
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                <span>Latency: ~1.2s</span>
                <span className="text-blue-400">Zod Schema Validation: Passed</span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ========================================================================= */}
      {/* 7. CAREER WORKFLOW */}
      {/* ========================================================================= */}
      <section className="py-20 border-b border-slate-800/60 bg-slate-950/40">
        <Container>
          <div className="text-center max-w-3xl mx-auto mb-14">
            <Badge variant="default" className="mb-3">
              Cohesive Lifecycle
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              A Unified Career Progression Engine
            </h2>
            <p className="mt-4 text-slate-400 text-base">
              From your initial college resume to multi-round technical interviews, every action informs your career trajectory.
            </p>
          </div>

          <div className="max-w-5xl mx-auto p-6 rounded-2xl border border-slate-800/80 bg-slate-950/70 backdrop-blur-md">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
              {[
                { label: "1. Profile Setup", desc: "Academics & skills", icon: Compass },
                { label: "2. Resume Upload", desc: "PDF extraction", icon: FileText },
                { label: "3. AI Diagnostics", desc: "ATS & score", icon: BrainCircuit },
                { label: "4. Job Matching", desc: "Compatibility %", icon: Target },
                { label: "5. Skill Gap", desc: "Roadmap to learn", icon: TrendingUp },
              ].map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div key={step.label} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 flex flex-col items-center">
                    <div className="h-8 w-8 rounded-lg bg-blue-600/10 text-blue-400 flex items-center justify-center mb-2">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold text-white">{step.label}</span>
                    <span className="text-[11px] text-slate-400 mt-0.5">{step.desc}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-center my-3 text-slate-600">
              <ArrowRight className="h-5 w-5 rotate-90 sm:rotate-0" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              {[
                { label: "6. App Tracking", desc: "Kanban pipeline", icon: Briefcase },
                { label: "7. Mock Interviews", desc: "STAR evaluations", icon: Bot },
                { label: "8. Analytics", desc: "Conversion rates", icon: BarChart3 },
                { label: "9. Hired!", desc: "Dream role offer", icon: Award },
              ].map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.label} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 flex flex-col items-center">
                    <div className="h-8 w-8 rounded-lg bg-indigo-600/10 text-indigo-400 flex items-center justify-center mb-2">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold text-white">{step.label}</span>
                    <span className="text-[11px] text-slate-400 mt-0.5">{step.desc}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Container>
      </section>

      {/* ========================================================================= */}
      {/* 8 & 9. APPLICATION TRACKING & INTERVIEW PREP PREVIEWS */}
      {/* ========================================================================= */}
      <section id="preview" className="py-20 border-b border-slate-800/60 bg-[#090d16]">
        <Container>
          <div className="text-center max-w-3xl mx-auto mb-10">
            <Badge variant="purple" className="mb-3">
              Interactive Live Preview
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Experience the Real Workflow
            </h2>
            <p className="mt-4 text-slate-400 text-base">
              Switch tabs below to preview the responsive Application Tracker and AI Interview Simulator interfaces.
            </p>

            {/* Tab switch */}
            <div className="inline-flex p-1.5 mt-6 rounded-xl bg-slate-900 border border-slate-800">
              <button
                onClick={() => setActiveTab("tracker")}
                className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "tracker"
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Application Pipeline Preview
              </button>
              <button
                onClick={() => setActiveTab("interview")}
                className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "interview"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                AI Mock Interview Preview
              </button>
            </div>
          </div>

          {/* Tab 1: Application Tracker Preview */}
          {activeTab === "tracker" && (
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 sm:p-6 shadow-2xl backdrop-blur-xl animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-blue-400" /> Active Job Applications
                  </h3>
                  <p className="text-xs text-slate-400">Real-time status tracking with salary and interview date reminders</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                    Total: <strong className="text-white">6 Tracked</strong>
                  </span>
                </div>
              </div>

              {/* Responsive simulated table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/60 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Company</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Applied</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Interview Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    <tr className="hover:bg-slate-900/40">
                      <td className="py-3 px-4 font-semibold text-white">Stripe</td>
                      <td className="py-3 px-4">Full Stack Engineer</td>
                      <td className="py-3 px-4 text-slate-400">Remote (US)</td>
                      <td className="py-3 px-4 text-slate-400">3 days ago</td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          Interview
                        </span>
                      </td>
                      <td className="py-3 px-4 text-purple-300 font-medium">Tomorrow, 2:00 PM</td>
                    </tr>
                    <tr className="hover:bg-slate-900/40">
                      <td className="py-3 px-4 font-semibold text-white">Vercel</td>
                      <td className="py-3 px-4">Frontend Engineer</td>
                      <td className="py-3 px-4 text-slate-400">Hybrid / SF</td>
                      <td className="py-3 px-4 text-slate-400">1 week ago</td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Screening
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">Pending recruiter</td>
                    </tr>
                    <tr className="hover:bg-slate-900/40">
                      <td className="py-3 px-4 font-semibold text-white">Linear</td>
                      <td className="py-3 px-4">Product Engineer</td>
                      <td className="py-3 px-4 text-slate-400">Remote</td>
                      <td className="py-3 px-4 text-slate-400">2 weeks ago</td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Offer
                        </span>
                      </td>
                      <td className="py-3 px-4 text-emerald-400 font-medium">$135,000 / yr</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 2: Interview Prep Preview */}
          {activeTab === "interview" && (
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 sm:p-6 shadow-2xl backdrop-blur-xl animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Bot className="h-5 w-5 text-indigo-400" /> AI Mock Interview Session
                  </h3>
                  <p className="text-xs text-slate-400">Role: Junior Full Stack Engineer • Topic: React State & Next.js Server Components</p>
                </div>
                <Badge variant="purple">Question 1 of 5</Badge>
              </div>

              {/* Question card */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 mb-4">
                <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider">Interview Question</span>
                <p className="mt-1 text-sm font-medium text-white">
                  &ldquo;Explain the difference between Next.js React Server Components (RSC) and Client Components. When would you explicitly use &apos;use client&apos;?&rdquo;
                </p>
                <div className="mt-2 text-[11px] text-slate-400">
                  <strong className="text-slate-300">Interviewer is evaluating:</strong> Understanding of zero-bundle-size RSC, hydration boundaries, and browser interactivity APIs.
                </div>
              </div>

              {/* AI STAR Evaluation Feedback Mock */}
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4" /> AI Evaluation: Score 92/100 (Strong Pass)
                  </span>
                  <Badge variant="success">Excellent</Badge>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong>Strengths:</strong> You clearly articulated that RSC renders exclusively on the server, saving bundle weight. Correctly noted event listeners (onClick) and useState require &apos;use client&apos;.
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  <strong>Coaching Tip:</strong> Mentioning that cookies and headers can be read safely in RSC without client serialization would elevate this to a senior-level answer.
                </p>
              </div>
            </div>
          )}
        </Container>
      </section>

      {/* ========================================================================= */}
      {/* 10. BENEFITS */}
      {/* ========================================================================= */}
      <section className="py-20 border-b border-slate-800/60 bg-slate-950/40">
        <Container>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="default" className="mb-3">
              Measurable Outcomes
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Designed for Early-Career Breakthroughs
            </h2>
            <p className="mt-4 text-slate-400 text-base">
              Built specifically to empower university students and entry-level developers with enterprise-grade career tools.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 text-center">
              <div className="text-3xl font-black text-blue-400 mb-2">3.5x</div>
              <h4 className="text-sm font-semibold text-white mb-1">Interview Callbacks</h4>
              <p className="text-xs text-slate-400">Resumes tailored with exact keyword frequencies bypass ATS filters.</p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 text-center">
              <div className="text-3xl font-black text-indigo-400 mb-2">100%</div>
              <h4 className="text-sm font-semibold text-white mb-1">Targeted Skill Gaps</h4>
              <p className="text-xs text-slate-400">Stop learning random frameworks; focus only on what employers demand.</p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 text-center">
              <div className="text-3xl font-black text-purple-400 mb-2">0</div>
              <h4 className="text-sm font-semibold text-white mb-1">Lost Applications</h4>
              <p className="text-xs text-slate-400">Centralized database keeps every follow-up date and note organized.</p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 text-center">
              <div className="text-3xl font-black text-emerald-400 mb-2">24/7</div>
              <h4 className="text-sm font-semibold text-white mb-1">On-Demand Mock Prep</h4>
              <p className="text-xs text-slate-400">Practice questions anytime with immediate STAR objective evaluations.</p>
            </div>
          </div>
        </Container>
      </section>

      {/* ========================================================================= */}
      {/* 11. CTA SECTION */}
      {/* ========================================================================= */}
      <section className="py-24 bg-gradient-to-b from-[#090d16] via-slate-950 to-[#090d16] relative">
        <Container>
          <div className="rounded-3xl border border-blue-500/30 bg-gradient-to-r from-blue-950/60 via-indigo-950/60 to-purple-950/60 p-8 sm:p-14 text-center relative overflow-hidden backdrop-blur-2xl shadow-2xl">
            {/* Glow decoration */}
            <div className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />

            <div className="max-w-2xl mx-auto space-y-6 relative z-10">
              <Badge variant="default" className="text-xs">
                Launch Your Career Today
              </Badge>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                Ready to take control of your career journey?
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Join students and developers using CareerPilot AI to optimize resumes, identify skills gaps, and ace technical interviews.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/register" className="w-full sm:w-auto">
                  <Button size="lg" variant="gradient" className="w-full sm:w-auto gap-2 px-8 py-6 rounded-xl text-base shadow-xl">
                    <span>Create Free Account</span>
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/login" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 py-6 rounded-xl border-slate-700 bg-slate-900/80 text-slate-200">
                    Candidate Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
