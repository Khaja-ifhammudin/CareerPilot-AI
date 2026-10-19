"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  Percent,
  CheckCircle2,
  XCircle,
  Briefcase,
  Building2,
  Calendar,
  Plus,
  Loader2,
  ArrowRight,
  PieChart as PieChartIcon,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface AnalyticsData {
  hasData: boolean;
  summary: {
    totalApplications: number;
    applicationsThisMonth: number;
    interviews: number;
    offers: number;
    rejected: number;
    interviewRate: number;
    offerRate: number;
    rejectionRate: number;
  };
  statusDistribution: Array<{
    status: string;
    label: string;
    count: number;
    fill: string;
  }>;
  applicationTrend: Array<{
    name: string;
    applications: number;
  }>;
  topCompanies: Array<{
    company: string;
    count: number;
  }>;
}

const PIE_COLORS = ["#64748b", "#3b82f6", "#8b5cf6", "#a855f7", "#10b981", "#f43f5e"];

export function CareerAnalyticsView() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await fetch("/api/analytics");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Failed to load analytics:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="p-16 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
        <span>Aggregating your career telemetry from database...</span>
      </div>
    );
  }

  if (!data || !data.hasData || data.summary.totalApplications === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <BarChart3 className="h-6 w-6 text-blue-400" />
              <span>Career Analytics</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Grounded pipeline telemetry and conversion velocity computed directly from your application records.
            </p>
          </div>
        </div>

        <Card className="glass-card border-slate-800">
          <CardContent className="p-16 text-center flex flex-col items-center justify-center space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <BarChart3 className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">No application data yet.</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                Add your tracked applications to unlock conversion funnel charts, monthly submission trends, and offer rate analytics.
              </p>
            </div>
            <Link href="/applications">
              <Button variant="gradient" size="sm" className="gap-1.5 text-xs">
                <Plus className="h-3.5 w-3.5" />
                <span>Add your first application</span>
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { summary, statusDistribution, applicationTrend, topCompanies } = data;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <BarChart3 className="h-6 w-6 text-blue-400" />
            <span>Career Analytics & Pipeline Velocity</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Conversion metrics, interview rates, and historical application distributions powered by Recharts.
          </p>
        </div>
        <Badge variant="purple" className="w-fit text-[11px]">
          Live Database Telemetry
        </Badge>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Total Applications
          </span>
          <div className="text-2xl font-black text-white">{summary.totalApplications}</div>
          <div className="text-[10px] text-slate-500">{summary.applicationsThisMonth} this month</div>
        </div>

        <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 space-y-1">
          <span className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider">
            Interview Rate
          </span>
          <div className="text-2xl font-black text-purple-300">{summary.interviewRate}%</div>
          <div className="text-[10px] text-slate-500">{summary.interviews} interviews scheduled</div>
        </div>

        <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1">
          <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
            Offer Rate
          </span>
          <div className="text-2xl font-black text-emerald-300">{summary.offerRate}%</div>
          <div className="text-[10px] text-slate-500">{summary.offers} offers extended</div>
        </div>

        <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 space-y-1">
          <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider">
            Rejection Rate
          </span>
          <div className="text-2xl font-black text-rose-300">{summary.rejectionRate}%</div>
          <div className="text-[10px] text-slate-500">{summary.rejected} rejected attempts</div>
        </div>
      </div>

      {/* Charts Grid: Application Funnel Bar Chart & Monthly Trend Area Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funnel / Status Bar Chart */}
        <Card className="glass-card border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-400" />
              <span>Application Pipeline Distribution</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Count of opportunities currently at each stage of the hiring pipeline
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={statusDistribution}
                  margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                >
                  <XAxis
                    dataKey="label"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    allowDecimals={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "0.75rem",
                      fontSize: "12px",
                      color: "#f8fafc",
                    }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill || PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 6-Month Submission Trend Area Chart */}
        <Card className="glass-card border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <span>Submission Velocity (Past 6 Months)</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Historical count of applications submitted month-by-month
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={applicationTrend}
                  margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                >
                  <defs>
                    <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    allowDecimals={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "0.75rem",
                      fontSize: "12px",
                      color: "#f8fafc",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="applications"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#trendGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Companies & Pipeline Breakdown Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Companies Card */}
        <Card className="glass-card border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
              <Building2 className="h-4 w-4 text-purple-400" />
              <span>Top Companies Applied To</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Organizations where you have the highest density of active applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            {topCompanies.length > 0 ? (
              <div className="space-y-2.5">
                {topCompanies.map((c, idx) => (
                  <div
                    key={c.company}
                    className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-bold text-slate-500 w-4">
                        #{idx + 1}
                      </span>
                      <span className="font-semibold text-white">{c.company}</span>
                    </div>
                    <Badge variant="purple" className="text-[10px]">
                      {c.count} {c.count === 1 ? "Application" : "Applications"}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No companies recorded yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Funnel Conversion Insights */}
        <Card className="glass-card border-slate-800 bg-gradient-to-r from-blue-950/20 via-slate-900 to-indigo-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
              <Percent className="h-4 w-4 text-indigo-400" />
              <span>Conversion Benchmark Analysis</span>
            </CardTitle>
            <CardDescription className="text-xs">
              How your pipeline metrics compare to engineering industry averages
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3.5 text-xs text-slate-300">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex justify-between font-semibold">
                <span>Application-to-Interview Conversion:</span>
                <span className={summary.interviewRate >= 15 ? "text-emerald-400" : "text-amber-400"}>
                  {summary.interviewRate}%
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Industry average for entry/mid engineers is ~10-15%.{" "}
                {summary.interviewRate >= 15
                  ? "Your resume keyword targeting is performing above average."
                  : "Improve resume keyword density in Stage 4 to increase screen pass rates."}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex justify-between font-semibold">
                <span>Interview-to-Offer Conversion:</span>
                <span className={summary.offerRate >= 20 ? "text-emerald-400" : "text-blue-400"}>
                  {summary.offerRate}%
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Industry standard is ~20-30%. Use the AI Interview Simulator to practice STAR responses and system design trade-offs.
              </p>
            </div>

            <div className="pt-1">
              <Link href="/interview-prep">
                <Button variant="gradient" size="sm" className="gap-1.5 text-xs w-full">
                  <span>Practice AI Mock Interviews</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
