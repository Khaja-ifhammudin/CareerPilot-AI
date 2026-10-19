import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const safeUser = {
    id: user.id,
    name: user.name || "Candidate",
    email: user.email || "",
    role: user.role,
  };

  return <DashboardShell user={safeUser}>{children}</DashboardShell>;
}
