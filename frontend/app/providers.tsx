"use client";

import type { ReactNode } from "react";
import { AuthGate } from "@/components/auth/auth-gate";
import { AuthProvider } from "@/lib/hooks/use-auth";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <AuthGate>{children}</AuthGate>
    </AuthProvider>
  );
}

