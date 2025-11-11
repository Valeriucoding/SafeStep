"use client";

import type { ReactNode } from "react";
import { Suspense } from "react";
import { AuthGate } from "@/components/auth/auth-gate";
import { Spinner } from "@/components/ui/spinner";
import { AuthProvider } from "@/lib/hooks/use-auth";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <Suspense
        fallback={
          <div className="flex min-h-[100dvh] items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-3">
              <Spinner className="size-8 text-primary" />
              <p className="text-sm text-muted-foreground">Preparing your experience...</p>
            </div>
          </div>
        }
      >
        <AuthGate>{children}</AuthGate>
      </Suspense>
    </AuthProvider>
  );
}

