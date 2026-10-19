"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  LayoutDashboard,
  FileText,
  Search,
  Target,
  Briefcase,
  Bot,
  TrendingUp,
  BarChart3,
  User,
  ShieldAlert,
  LogOut,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: "USER" | "ADMIN";
  };
  onCloseMobile?: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export function Sidebar({ user, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();

  const navigationGroups: NavGroup[] = [
    {
      title: "Overview",
      items: [
        {
          label: "Dashboard",
          href: "/dashboard",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: "Career Tools",
      items: [
        {
          label: "Resume Management",
          href: "/resume",
          icon: FileText,
        },
        {
          label: "Job Analyzer",
          href: "/job-analysis",
          icon: Search,
        },
        {
          label: "AI Job Matcher",
          href: "/job-matcher",
          icon: Target,
        },
        {
          label: "Application Tracker",
          href: "/applications",
          icon: Briefcase,
        },
      ],
    },
    {
      title: "AI Tools",
      items: [
        {
          label: "Interview Prep",
          href: "/interview-prep",
          icon: Bot,
        },
        {
          label: "Skill Gap Matrix",
          href: "/skills",
          icon: TrendingUp,
        },
      ],
    },
    {
      title: "Insights",
      items: [
        {
          label: "Application Analytics",
          href: "/analytics",
          icon: BarChart3,
        },
      ],
    },
    {
      title: "Account",
      items: [
        {
          label: "Candidate Profile",
          href: "/profile",
          icon: User,
        },
      ],
    },
  ];

  if (user.role === "ADMIN") {
    navigationGroups.unshift({
      title: "System Control",
      items: [
        {
          label: "Admin Dashboard",
          href: "/admin",
          icon: ShieldAlert,
          badge: "ADMIN",
        },
      ],
    });
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <aside className="flex h-full w-full flex-col justify-between border-r border-slate-800/80 bg-slate-950/95 text-slate-300">
      {/* Top brand header */}
      <div className="flex flex-col flex-1 min-h-0">
        <div className="flex h-16 items-center justify-between px-5 border-b border-slate-800/80 shrink-0">
          <Link
            href={user.role === "ADMIN" ? "/admin" : "/dashboard"}
            onClick={onCloseMobile}
            className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 shadow-md shadow-blue-500/20">
              <Compass className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                CareerPilot{" "}
                <span className="text-gradient font-extrabold text-xs px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                  AI
                </span>
              </span>
            </div>
          </Link>

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Scrollable Navigation Groups */}
        <div className="px-3 py-4 space-y-6 overflow-y-auto flex-1">
          {navigationGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              <h3 className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {group.title}
              </h3>
              <div className="space-y-0.5 pt-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onCloseMobile}
                      className={cn(
                        "flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all group",
                        isActive
                          ? "bg-blue-600/15 text-blue-400 font-semibold border border-blue-500/30 shadow-sm"
                          : "text-slate-400 hover:bg-slate-900/80 hover:text-slate-100"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={cn(
                            "h-4 w-4 transition-colors",
                            isActive
                              ? "text-blue-400"
                              : "text-slate-500 group-hover:text-slate-300"
                          )}
                        />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <Badge
                          variant="purple"
                          className="text-[10px] px-1.5 py-0 font-bold"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom User Profile Section */}
      <div className="border-t border-slate-800/80 p-3 bg-slate-950/80">
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800/60">
          <Link
            href="/profile"
            onClick={onCloseMobile}
            className="flex items-center gap-2.5 overflow-hidden hover:opacity-90 transition-opacity"
          >
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-sm">
              {getInitials(user.name)}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="truncate text-xs font-semibold text-white">
                {user.name}
              </span>
              <span className="truncate text-[10px] text-slate-400">
                {user.email}
              </span>
            </div>
          </Link>
          <SignOutButton
            variant="ghost"
            className="h-8 w-8 p-0 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 shrink-0"
          />
        </div>
      </div>
    </aside>
  );
}
