"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { AppHeader } from "@/components/app-header";
import { cn } from "@/lib/utils";

const AUTH_ROOT_PATH = "/auth";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isAuthRoute = pathname === AUTH_ROOT_PATH || pathname?.startsWith(`${AUTH_ROOT_PATH}/`);

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <AppHeader />
      <main
        className={cn(
          "flex-1",
          isAuthRoute ? "pt-0" : "pt-14 sm:pt-16",
        )}
      >
        {children}
      </main>
    </div>
  );
}


