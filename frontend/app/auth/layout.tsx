"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/hooks/use-auth";

interface AuthLayoutProps {
    children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const isResetPasswordPage = pathname === "/auth/reset-password";

    useEffect(() => {
        if (!isLoading && isAuthenticated && !isResetPasswordPage) {
            router.replace("/");
        }
    }, [isAuthenticated, isLoading, isResetPasswordPage, router]);

    if (isLoading) {
        return (
            <div className="flex h-[calc(100dvh-3.5rem)] items-center justify-center overflow-hidden">
                <div className="text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="mt-2 text-muted-foreground text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    if (isAuthenticated && !isResetPasswordPage) {
        return null;
    }

    return <div className="h-[calc(100dvh-3.5rem)] overflow-y-auto bg-background">{children}</div>;
}
