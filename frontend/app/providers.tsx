"use client";

import { Suspense, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { AuthGate } from "@/components/auth/auth-gate";
import { AuthProvider } from "@/lib/hooks/use-auth";

interface ProvidersProps {
  children: ReactNode;
}

function ProvidersFallback() {
  return (
    <div className="flex h-[100dvh] items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading SafeStep...</p>
      </div>
    </div>
  );
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <Suspense fallback={<ProvidersFallback />}>
        <AuthGate>{children}</AuthGate>
      </Suspense>
    </AuthProvider>
  );
}

