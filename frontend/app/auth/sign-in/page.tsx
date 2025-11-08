"use client";

import { useAuthForm } from "@repo/logic/hooks/auth/use-auth-form";
import { usePasswordVisibility } from "@repo/logic/hooks/auth/use-password-visibility";
import { validateEmail, validatePassword } from "@repo/logic/validation/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useId, useState } from "react";
import { toast } from "sonner";
import { PasswordVisibilityToggle } from "@/components/auth/password-visibility-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/hooks/use-auth";

function SignInContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { signIn } = useAuth();
    const [initialFocusComplete, setInitialFocusComplete] = useState(false);
    const password = usePasswordVisibility();
    const emailId = useId();
    const passwordId = useId();

    const { fieldState, isLoading, formError, handleSubmit, focusFirstField } = useAuthForm({
        email: {
            validationFn: validateEmail,
        },
        password: {
            validationFn: validatePassword,
        },
    });

    useEffect(() => {
        if (!initialFocusComplete) {
            const cleanup = focusFirstField();
            setInitialFocusComplete(true);
            return cleanup;
        }
    }, [focusFirstField, initialFocusComplete]);

    // Show error toast if redirected here with error param
    useEffect(() => {
        const errorParam = searchParams.get("error");
        if (errorParam) {
            toast.error("Error signing in", { description: errorParam });
            const params = new URLSearchParams(searchParams.toString());
            params.delete("error");
            router.replace(`/auth/sign-in${params.size ? `?${params.toString()}` : ""}`);
        }
    }, [router, searchParams]);

    const handleSignIn = async () => {
        try {
            await handleSubmit(async () => {
                await signIn(fieldState.email?.value || "", fieldState.password?.value || "");
                router.push("/");
                toast.success("Signed in successfully");
            });
        } catch (_error) {
            // Error already handled by useAuthForm
        }
    };

    return (
        <div className="flex h-[calc(100dvh-3.5rem)] overflow-y-auto bg-background p-4">
            <div className="flex w-full items-center justify-center">
                <Card className="w-full max-w-md border-border/50 shadow-sm sm:border-border sm:shadow-black/5">
                    <CardHeader>
                        <CardTitle className="text-center text-xl sm:text-left">Sign in to your app</CardTitle>
                        <CardDescription className="text-center sm:text-left">
                            Welcome back! Please sign in to continue
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-3">
                                <Label htmlFor={emailId}>Email</Label>
                                <Input
                                    autoCapitalize="none"
                                    autoComplete="email"
                                    id={emailId}
                                    onBlur={fieldState.email?.handleBlur}
                                    onChange={e => fieldState.email?.setValue(e.target.value)}
                                    placeholder="m@example.com"
                                    ref={fieldState.email?.ref}
                                    type="email"
                                    value={fieldState.email?.value || ""}
                                />
                                {fieldState.email?.error && (
                                    <span className="text-destructive text-sm">{fieldState.email.error}</span>
                                )}
                            </div>
                            <div className="grid gap-3">
                                <div className="flex items-center">
                                    <Label htmlFor={passwordId}>Password</Label>
                                    <Button
                                        className="ml-auto h-4 px-1 py-0 sm:h-4"
                                        onClick={() => router.push("/auth/forgot-password")}
                                        size="sm"
                                        variant="link">
                                        <span className="font-normal leading-4">Forgot your password?</span>
                                    </Button>
                                </div>
                                <div className="relative">
                                    <Input
                                        autoComplete="current-password"
                                        className="pr-12"
                                        id={passwordId}
                                        onBlur={fieldState.password?.handleBlur}
                                        onChange={e => fieldState.password?.setValue(e.target.value)}
                                        ref={fieldState.password?.ref}
                                        type={password.isVisible ? "text" : "password"}
                                        value={fieldState.password?.value || ""}
                                    />
                                    <PasswordVisibilityToggle
                                        isVisible={password.isVisible}
                                        onToggle={password.toggle}
                                    />
                                </div>
                                {fieldState.password?.error && (
                                    <span className="text-destructive text-sm">{fieldState.password.error}</span>
                                )}
                            </div>
                            {formError && <span className="text-center text-destructive text-sm">{formError}</span>}
                            <div className="flex flex-col gap-3">
                                <Button className="w-full" disabled={isLoading} onClick={handleSignIn}>
                                    Continue
                                </Button>
                            </div>
                        </div>
                        <div className="mt-4 mb-2 text-center text-sm">
                            Don't have an account?{" "}
                            <button
                                className="underline underline-offset-4"
                                onClick={() => router.push("/auth/sign-up")}
                                type="button">
                                Sign up
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function SignIn() {
    return (
        <Suspense
            fallback={
                <div className="flex h-[calc(100dvh-3.5rem)] overflow-y-auto bg-background p-4">
                    <div className="flex w-full items-center justify-center">
                        <div className="w-full max-w-md">Loading...</div>
                    </div>
                </div>
            }>
            <SignInContent />
        </Suspense>
    );
}
