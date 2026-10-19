import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "CareerPilot AI — Your AI-Powered Career Companion",
    template: "%s | CareerPilot AI",
  },
  description:
    "End-to-end career intelligence: AI resume analysis, ATS compatibility scoring, real-time application tracking, skill-gap detection, and interactive interview simulations.",
  keywords: [
    "AI Career Coach",
    "Resume Analyzer",
    "ATS Compatibility",
    "Job Matcher",
    "Interview Preparation",
    "Application Tracker",
  ],
  authors: [{ name: "CareerPilot AI Engineering Team" }],
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#090d16",
  width: "device-width",
  initialScale: 1,
};

import { SessionProvider } from "@/components/layout/session-provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-[#090d16] text-slate-100 antialiased selection:bg-blue-600 selection:text-white flex flex-col font-sans`}
      >
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
