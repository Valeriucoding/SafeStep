"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/hooks/use-auth";

interface AuthGateProps {
  children: ReactNode;
}

const AUTH_ROOT_PATH = "/auth";

export function AuthGate({ children }: AuthGateProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const isAuthRoute = useMemo(() => {
    if (!pathname) {
      return false;
    }
    return pathname === AUTH_ROOT_PATH || pathname.startsWith(`${AUTH_ROOT_PATH}/`);
  }, [pathname]);

  useEffect(() => {
    if (isLoading || isAuthRoute) {
      return;
    }

    if (!isAuthenticated && pathname) {
      const paramsString = searchParams.toString();
      const next = paramsString ? `${pathname}?${paramsString}` : pathname;
      router.replace(`/auth/sign-in?redirect=${encodeURIComponent(next)}`);
    }
  }, [isAuthenticated, isAuthRoute, isLoading, pathname, router, searchParams]);

  if (isAuthRoute) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Preparing your experience...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

