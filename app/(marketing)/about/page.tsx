import React from "react";
import Link from "next/link";
import { GraduationCap, ShieldCheck, Sparkles, Code2, Users, Layers, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";

export const metadata = {
  title: "About — Academic Capstone Project",
  description:
    "Learn about the mission, architecture, and technology behind CareerPilot AI, a university AI integration capstone project.",
};

export default function AboutPage() {
  return (
    <div className="py-20 bg-[#090d16]">
      <Container>
        <div className="max-w-3xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <Badge variant="default" className="gap-1.5">
              <GraduationCap className="h-3.5 w-3.5" /> Academic Capstone Project
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
              About CareerPilot AI
            </h1>
            <p className="text-slate-400 text-base leading-relaxed">
              CareerPilot AI was built as an advanced university capstone project demonstrating production full-stack engineering, secure credentials authentication, role-based authorization, and schema-validated AI integration.
            </p>
          </div>

          {/* Project Pillars */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white border-b border-slate-800 pb-3">
              Core Architecture Objectives
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="glass-card p-5 rounded-xl border border-slate-800">
                <Code2 className="h-6 w-6 text-blue-400 mb-3" />
                <h3 className="text-base font-bold text-white mb-1">Production Next.js 16</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Utilizes App Router, React 19, Server Components, Route Handlers, and strict TypeScript types across all schemas and client interactions.
                </p>
              </div>

              <div className="glass-card p-5 rounded-xl border border-slate-800">
                <ShieldCheck className="h-6 w-6 text-emerald-400 mb-3" />
                <h3 className="text-base font-bold text-white mb-1">Security & RBAC</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Bcrypt hashed credentials, session isolation, protected route middleware, strict resource ownership checks, and role-based admin controls.
                </p>
              </div>

              <div className="glass-card p-5 rounded-xl border border-slate-800">
                <Sparkles className="h-6 w-6 text-purple-400 mb-3" />
                <h3 className="text-base font-bold text-white mb-1">Guaranteed AI Schemas</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Google Gemini integration encapsulated exclusively on the backend. All structured responses are parsed and validated via Zod before persistence.
                </p>
              </div>

              <div className="glass-card p-5 rounded-xl border border-slate-800">
                <Layers className="h-6 w-6 text-indigo-400 mb-3" />
                <h3 className="text-base font-bold text-white mb-1">Mongoose Data Integrity</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Relational document models for Users, Resumes, Applications, Job Analyses, Interview Sessions, and Skill Profiles with proper indexes.
                </p>
              </div>
            </div>
          </div>

          {/* Project Details */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4 text-xs text-slate-300">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Project Submission Context
            </h3>
            <p>
              This application was engineered to fulfill the requirements of an advanced AI Integration Capstone. It avoids simulated or hardcoded stats by maintaining active MongoDB CRUD operations, verified sessions, and real-time AI reasoning.
            </p>
            <div className="pt-2 flex flex-wrap gap-2">
              <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300">Next.js 16</span>
              <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300">TypeScript 5</span>
              <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300">MongoDB 8</span>
              <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300">Tailwind CSS v4</span>
              <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300">Google Gemini AI</span>
              <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300">Zod Validation</span>
            </div>
          </div>

          <div className="text-center pt-4">
            <Link href="/register">
              <Button size="lg" variant="gradient" className="gap-2">
                <span>Experience CareerPilot AI</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
