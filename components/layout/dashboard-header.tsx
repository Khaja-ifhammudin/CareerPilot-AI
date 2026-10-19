"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  Bell,
  User,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Compass,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SignOutButton } from "@/components/layout/sign-out-button";

interface DashboardHeaderProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: "USER" | "ADMIN";
  };
  onOpenMobileMenu: () => void;
}

export function DashboardHeader({
  user,
  onOpenMobileMenu,
}: DashboardHeaderProps) {
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Generate clean section name from pathname
  const getSectionTitle = () => {
    if (pathname === "/dashboard") return "Dashboard";
    if (pathname.startsWith("/profile")) return "Candidate Profile";
    if (pathname.startsWith("/resume")) return "Resume Management";
    if (pathname.startsWith("/job-analysis")) return "Job Analyzer";
    if (pathname.startsWith("/job-matcher")) return "AI Job Matcher";
    if (pathname.startsWith("/applications")) return "Application Pipeline";
    if (pathname.startsWith("/interview-prep") || pathname.startsWith("/interview"))
      return "AI Mock Interviews";
    if (pathname.startsWith("/skills")) return "Skill Gap Matrix";
    if (pathname.startsWith("/analytics")) return "Application Analytics";
    if (pathname.startsWith("/admin")) return "Admin Control Center";
    return "CareerPilot AI";
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800/80 bg-slate-950/80 px-4 sm:px-6 lg:px-8 backdrop-blur-md">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white focus:outline-none"
          aria-label="Open mobile navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 text-xs">
          <Link
            href="/dashboard"
            className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 font-medium"
          >
            <Compass className="h-3.5 w-3.5 text-blue-400" />
            <span className="hidden sm:inline">CareerPilot</span>
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
          <span className="font-semibold text-white truncate max-w-[160px] sm:max-w-none">
            {getSectionTitle()}
          </span>
        </div>
      </div>

      {/* Right: Actions & User Avatar */}
      <div className="flex items-center gap-3">
        {/* Admin Dashboard shortcut for ADMIN */}
        {user.role === "ADMIN" ? (
          <Link href="/admin">
            <button className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30 flex items-center gap-1.5 transition-colors shadow-sm">
              <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />
              <span>Admin Portal</span>
            </button>
          </Link>
        ) : (
          <Badge
            variant="default"
            className="hidden sm:inline-flex text-[11px] font-semibold uppercase tracking-wider"
          >
            {user.role}
          </Badge>
        )}

        {/* User profile avatar dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900 p-1 hover:border-slate-500 transition-colors focus:outline-none"
            aria-expanded={dropdownOpen}
            aria-label="User navigation menu"
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
              {getInitials(user.name)}
            </div>
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-800 bg-slate-950 p-2 shadow-2xl backdrop-blur-xl animate-in fade-in-50 zoom-in-95 duration-150 z-50"
              onClick={() => setDropdownOpen(false)}
            >
              <div className="px-3 py-2 border-b border-slate-800/80 mb-1">
                <p className="text-xs font-bold text-white truncate">{user.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                <div className="mt-1 sm:hidden">
                  <Badge variant={user.role === "ADMIN" ? "purple" : "default"} className="text-[10px]">
                    {user.role}
                  </Badge>
                </div>
              </div>

              <div className="space-y-0.5">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-900 hover:text-white transition-colors"
                >
                  <User className="h-4 w-4 text-blue-400" />
                  <span>Profile Settings</span>
                </Link>

                {user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-purple-300 hover:bg-purple-950/40 transition-colors"
                  >
                    <ShieldCheck className="h-4 w-4 text-purple-400" />
                    <span>Admin Control Center</span>
                  </Link>
                )}
              </div>

              <div className="pt-1.5 mt-1 border-t border-slate-800/80">
                <SignOutButton
                  variant="ghost"
                  className="w-full justify-start text-xs text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 px-3 py-2 h-auto"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
