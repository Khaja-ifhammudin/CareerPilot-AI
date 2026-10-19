"use client";

import React from "react";
import Link from "next/link";
import { Compass, Sparkles, GraduationCap } from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand info */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Compass className="h-4 w-4" />
              </div>
              <span className="text-base font-bold text-white tracking-tight">
                {APP_CONFIG.name}
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-slate-400">
              {APP_CONFIG.tagline} End-to-end career intelligence engine designed for university students, graduates, and ambitious professionals.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-950/60 border border-blue-800/40 text-[11px] text-blue-300">
              <GraduationCap className="h-3.5 w-3.5 text-blue-400" />
              <span>University AI Capstone Project</span>
            </div>
          </div>

          {/* Navigation Columns */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Platform
            </h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link href="/#features" className="hover:text-white transition-colors">
                  AI Resume Analysis
                </Link>
              </li>
              <li>
                <Link href="/#features" className="hover:text-white transition-colors">
                  Job Match & ATS Fit
                </Link>
              </li>
              <li>
                <Link href="/#features" className="hover:text-white transition-colors">
                  Application Tracker
                </Link>
              </li>
              <li>
                <Link href="/#features" className="hover:text-white transition-colors">
                  AI Mock Interviews
                </Link>
              </li>
              <li>
                <Link href="/#features" className="hover:text-white transition-colors">
                  Skill Gap Matrix
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Technology
            </h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                <span>Next.js App Router</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>MongoDB & Mongoose</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                <span>Google Gemini AI</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                <span>TypeScript & Tailwind</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Access
            </h4>
            <div className="mt-3 flex flex-col space-y-2 text-xs">
              <Link href="/login" className="hover:text-white transition-colors">
                Candidate Login
              </Link>
              <Link href="/register" className="hover:text-white transition-colors">
                Create Free Account
              </Link>
              <Link href="/dashboard" className="hover:text-white transition-colors">
                Candidate Dashboard
              </Link>
              <Link href="/admin/dashboard" className="text-slate-500 hover:text-slate-400 transition-colors">
                Admin Portal
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-800/60 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 CareerPilot AI. Built for Academic Capstone & Professional Demonstration.</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1 text-slate-400">
              <Sparkles className="h-3.5 w-3.5 text-blue-400" /> Powered by Gemini
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
