import React from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#090d16]">
      <Navbar />
      <main className="flex-1 flex items-center justify-center">{children}</main>
      <Footer />
    </div>
  );
}
