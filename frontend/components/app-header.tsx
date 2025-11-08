"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, LogOut, Settings, ChevronRight } from "lucide-react";
import { useState } from "react";

import { SafeStepLogo } from "@/components/icons/safe-step-logo";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/hooks/use-auth";
import { cn } from "@/lib/utils";

const AUTH_ROOT_PATH = "/auth";

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const isAuthRoute = pathname === AUTH_ROOT_PATH || pathname?.startsWith(`${AUTH_ROOT_PATH}/`);

  if (isAuthRoute) {
    return null;
  }

  const displayName =
    user?.user_metadata?.full_name?.trim() ||
    user?.user_metadata?.name?.trim() ||
    user?.email ||
    "Your account";

  const initials =
    displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part: string) => part[0]?.toUpperCase() ?? "")
      .join("") || "SS";

  const handleSignOut = async () => {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);

    try {
      await signOut(false);
      setIsMenuOpen(false);
      router.replace("/auth/sign-in");
    } catch (error) {
      toast({
        title: "Sign out failed",
        description: error instanceof Error ? error.message : "Something went wrong while signing out.",
        variant: "destructive",
      });
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <Drawer direction="right" open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <header className="fixed inset-x-0 top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4 py-2 sm:h-16 sm:px-6">
          <Link href="/" className="flex items-center gap-2" aria-label="SafeStep home">
            <SafeStepLogo />
            <span className="sr-only">SafeStep</span>
          </Link>

          <DrawerTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 rounded-full border border-border bg-background shadow-sm"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </DrawerTrigger>
        </div>
      </header>

      <DrawerContent className="h-full w-full max-w-sm border-l pt-4 sm:max-w-xs">
        <DrawerHeader className="items-start gap-3 pb-2">
          <DrawerTitle className="text-left text-base font-medium text-muted-foreground">Account</DrawerTitle>
          <div className="flex w-full items-center gap-3 rounded-xl border bg-muted/40 p-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">{displayName}</span>
              {user?.email && <span className="text-xs text-muted-foreground">{user.email}</span>}
            </div>
          </div>
        </DrawerHeader>

        <div className="flex flex-1 flex-col gap-2 px-4 py-2">
          <DrawerClose asChild>
            <Button
              asChild
              variant="ghost"
              className="h-12 justify-between rounded-xl border border-transparent bg-background text-foreground shadow-sm transition-colors hover:border-border"
            >
              <Link href="/account">
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-primary/10 p-2">
                    <Settings className="h-4 w-4 text-primary" />
                  </span>
                  <div className="text-left">
                    <span className="block text-sm font-medium">Account settings</span>
                    <span className="text-xs text-muted-foreground">Manage your profile and preferences</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </Button>
          </DrawerClose>
        </div>

        <Separator className="mx-4" />

        <DrawerFooter className="gap-3 px-4 pb-6">
          <Button
            variant="outline"
            className={cn(
              "h-12 justify-between rounded-xl border-destructive/40 text-destructive hover:bg-destructive/10",
              isSigningOut && "pointer-events-none opacity-70",
            )}
            onClick={handleSignOut}
            disabled={isSigningOut}
          >
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-destructive/10 p-2">
                <LogOut className="h-4 w-4" />
              </span>
              <span className="text-sm font-medium">Log out</span>
            </div>
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}


