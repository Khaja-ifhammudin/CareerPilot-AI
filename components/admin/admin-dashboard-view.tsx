"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  FileText,
  Briefcase,
  Bot,
  Award,
  Search,
  ShieldCheck,
  TrendingUp,
  BarChart3,
  Calendar,
  Loader2,
  Lock,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "../ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface AdminMetrics {
  totalUsers: number;
  newUsersThisMonth: number;
  totalResumes: number;
  analyzedResumes: number;
  totalApplications: number;
  totalOffers: number;
  totalInterviews: number;
}

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  createdAt: string;
  preferredRole: string;
  profileCompletion: number;
}

export function AdminDashboardView() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [registrationTrend, setRegistrationTrend] = useState<any[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<any[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState("");
  const [usersLoading, setUsersLoading] = useState(false);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const res = await fetch("/api/admin/metrics");
        if (res.ok) {
          const json = await res.json();
          setMetrics(json.metrics);
          setRegistrationTrend(json.registrationTrend || []);
          setStatusDistribution(json.applicationStatusDistribution || []);
        }
      } catch (err) {
        console.error("Failed to load admin metrics:", err);
      } finally {
        setLoading(false);
      }
    }
    loadMetrics();
  }, []);

  const loadUsers = async (query = "") => {
    try {
      setUsersLoading(true);
      const res = await fetch(`/api/admin/users?search=${encodeURIComponent(query)}`);
      if (res.ok) {
        const json = await res.json();
        setUsers(json.users || []);
      }
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      loadUsers(userSearch);
    }, 250);
    return () => clearTimeout(handler);
  }, [userSearch]);

  if (loading) {
    return (
      <div className="p-16 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
        <span>Loading system intelligence metrics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Banner */}
      <div className="p-6 rounded-2xl border border-purple-500/30 bg-purple-950/20 backdrop-blur-md">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 mb-2">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Privileged Access Verified (Role: ADMIN)</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          System Administration & Intelligence
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Monitor multi-tenant platform health, candidate adoption, application volume, and AI evaluation metrics across all registered accounts.
        </p>
      </div>

      {/* System Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Total Users</span>
              <Users className="h-3.5 w-3.5 text-purple-400" />
            </span>
            <div className="text-2xl font-black text-white">{metrics.totalUsers}</div>
            <div className="text-[10px] text-purple-300">
              +{metrics.newUsersThisMonth} this month
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Resumes</span>
              <FileText className="h-3.5 w-3.5 text-blue-400" />
            </span>
            <div className="text-2xl font-black text-white">{metrics.totalResumes}</div>
            <div className="text-[10px] text-blue-300">
              {metrics.analyzedResumes} analyzed
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Applications</span>
              <Briefcase className="h-3.5 w-3.5 text-indigo-400" />
            </span>
            <div className="text-2xl font-black text-white">{metrics.totalApplications}</div>
            <div className="text-[10px] text-slate-500">Tracked in pipeline</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Interviews</span>
              <Bot className="h-3.5 w-3.5 text-purple-400" />
            </span>
            <div className="text-2xl font-black text-white">{metrics.totalInterviews}</div>
            <div className="text-[10px] text-purple-300">Simulations completed</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Job Offers</span>
              <Award className="h-3.5 w-3.5 text-emerald-400" />
            </span>
            <div className="text-2xl font-black text-emerald-400">{metrics.totalOffers}</div>
            <div className="text-[10px] text-slate-500">Secured offers</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>DB Status</span>
              <Lock className="h-3.5 w-3.5 text-emerald-400" />
            </span>
            <div className="text-2xl font-black text-emerald-400">Secure</div>
            <div className="text-[10px] text-slate-500">Mongoose / Auth.js</div>
          </div>
        </div>
      )}

      {/* System Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Registration Trend */}
        <Card className="glass-card border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-400" />
              <span>User Registrations (Past 6 Months)</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Platform user growth and account creation rate
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={registrationTrend} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "0.75rem",
                      fontSize: "12px",
                      color: "#f8fafc",
                    }}
                  />
                  <Bar dataKey="users" fill="#a855f7" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Global Pipeline Distribution */}
        <Card className="glass-card border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-400" />
              <span>Platform-Wide Application Funnel</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Aggregate distribution across all tracked candidate jobs
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis dataKey="status" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "0.75rem",
                      fontSize: "12px",
                      color: "#f8fafc",
                    }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Candidate Directory Table */}
      <Card className="glass-card border-slate-800">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base text-white flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-400" />
                <span>Candidate & User Directory</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Inspect registered users and account completion status without exposing sensitive credentials
              </CardDescription>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <Input
                value={userSearch}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserSearch(e.target.value)}
                placeholder="Search name or email..."
                className="pl-8 h-8 text-xs"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {usersLoading ? (
            <div className="p-8 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
              <span>Loading users...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No users matching your query.
            </div>
          ) : (
            <div className="rounded-xl border border-slate-800/80 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">Email</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Target Role</th>
                    <th className="py-2.5 px-3">Profile Completion</th>
                    <th className="py-2.5 px-3 text-right">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-white">
                        {u.name}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">
                        {u.email}
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge
                          variant={u.role === "ADMIN" ? "purple" : "outline"}
                          className="text-[10px]"
                        >
                          {u.role}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">
                        {u.preferredRole}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-full"
                              style={{ width: `${u.profileCompletion}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-400 font-bold">
                            {u.profileCompletion}%
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right text-[11px] text-slate-500">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
