import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  ShieldAlert,
  ShieldCheck,
  Compass,
  ArrowLeft,
  Users,
  Activity,
  Database,
  Lock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { AdminDashboardView } from "@/components/admin/admin-dashboard-view";

export const metadata = {
  title: "Admin Portal — Privileged Access",
};

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?callbackUrl=/admin");
  }

  if (user.role !== "ADMIN") {
    redirect("/dashboard?error=unauthorized");
  }

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      {/* Admin header bar */}
      <header className="border-b border-purple-900/40 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 shadow-md shadow-purple-600/30">
              <ShieldAlert className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-white tracking-tight flex items-center gap-1.5">
                CareerPilot AI <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">ADMIN</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/dashboard?view=candidate">
              <button className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 flex items-center gap-1.5 transition-colors">
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Candidate View</span>
              </button>
            </Link>
            <SignOutButton variant="destructive" />
          </div>
        </div>
      </header>

      {/* Admin Portal Body */}
      <main className="flex-1 py-10">
        <Container>
          <AdminDashboardView />
        </Container>
      </main>
    </div>
  );
}
