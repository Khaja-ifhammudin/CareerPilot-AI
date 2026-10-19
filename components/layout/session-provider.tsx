"use client";

import React, { Suspense } from "react";
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <NextAuthSessionProvider>{children}</NextAuthSessionProvider>
    </Suspense>
  );
}
