"use client";

import { useAuthForm } from "@/hooks/auth/use-auth-form";
import { usePasswordVisibility } from "@/hooks/auth/use-password-visibility";
import { validatePassword } from "@/lib/validation/auth";
import { CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { PasswordVisibilityToggle } from "@/components/auth/password-visibility-toggle";
import { SafeStepLogo } from "@/components/icons/safe-step-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/hooks/use-auth";

export default function ResetPassword() {
    const router = useRouter();
    const { updatePassword, signOut, isAuthenticated, isLoading: authLoading } = useAuth();
    const [passwordReset, setPasswordReset] = useState(false);
    const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
    const password = usePasswordVisibility();
    const confirmPassword = usePasswordVisibility();
    const passwordId = useId();
    const confirmPasswordId = useId();
    const confirmPasswordInputRef = useRef<HTMLInputElement>(null);

    const { fieldState, isLoading, formError, handleSubmit, focusFirstField } = useAuthForm({
        confirmPassword: {
            // Use a simple validation that doesn't depend on other fields during typing
            validationFn: (value: string) => {
                if (!value) {
                    return "This field is required";
                }
                return null;
            },
        },
        password: {
            validationFn: validatePassword,
        },
    });

    useEffect(() => {
        focusFirstField();
    }, [focusFirstField]);

    // Custom validation for confirm password that checks against the current password
    const validateConfirmPasswordMatch = () => {
        const passwordValue = fieldState.password?.value || "";
        const confirmPasswordValue = fieldState.confirmPassword?.value || "";

        if (confirmPasswordValue && passwordValue !== confirmPasswordValue) {
            const error = "Passwords do not match";
            setConfirmPasswordError(error);
            return error;
        }
        setConfirmPasswordError(null);
        return null;
    };

    // Redirect to sign-in if user is not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/auth/sign-in");
        }
    }, [authLoading, isAuthenticated, router]);

    const handlePasswordReset = async () => {
        try {
            await handleSubmit(async () => {
                // Perform custom validation for password matching
                const matchError = validateConfirmPasswordMatch();
                if (matchError) {
                    throw new Error(matchError);
                }

                await updatePassword(fieldState.password?.value || "");
                setPasswordReset(true);
            });
        } catch (_error) {
            // Error already handled by useAuthForm
        }
    };

    const handleReturnToSignIn = async () => {
        await signOut(false);
        router.push("/auth/sign-in");
    };

    // Show loading while checking authentication
    if (authLoading) {
        return (
            <div className="flex h-[calc(100dvh-3.5rem)] items-center justify-center overflow-hidden">
                <div className="text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="mt-2 text-muted-foreground text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    // Redirect will happen in useEffect if not authenticated
    if (!isAuthenticated) {
        return null;
    }

    if (passwordReset) {
        return (
            <div className="flex h-[calc(100dvh-3.5rem)] overflow-y-auto bg-background p-4">
            <div className="flex w-full flex-col items-center justify-center gap-6">
                <SafeStepLogo className="h-12 w-auto" />
                <Card className="w-full max-w-md border-border/50 shadow-sm sm:border-border sm:shadow-black/5">
                    <CardHeader className="space-y-2 text-center">
                        <CardTitle className="text-xl font-semibold sm:text-2xl">Password updated</CardTitle>
                        <CardDescription className="text-sm sm:text-base">
                            Your credentials are refreshed. Sign in with your new password to continue.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-6">
                            <CheckCircle className="h-16 w-16 text-primary" />
                            <Button className="h-14 w-full" onClick={handleReturnToSignIn}>
                                Back to sign in
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100dvh-3.5rem)] overflow-y-auto bg-background p-4">
            <div className="flex w-full flex-col items-center justify-center gap-6">
                <SafeStepLogo className="h-12 w-auto" />
                <Card className="w-full max-w-md border-border/50 shadow-sm sm:border-border sm:shadow-black/5">
                    <CardHeader className="space-y-2 text-center sm:text-left">
                        <CardTitle className="text-xl font-semibold sm:text-2xl">Reset your password</CardTitle>
                        <CardDescription className="text-sm sm:text-base">
                            Choose a strong password to keep your SafeStep account secure.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-3">
                                <Label htmlFor={passwordId}>New password</Label>
                                <div className="relative">
                                    <Input
                                        autoComplete="new-password"
                                        className="pr-12"
                                        id={passwordId}
                                        onBlur={fieldState.password?.handleBlur}
                                        onChange={e => fieldState.password?.setValue(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                confirmPasswordInputRef.current?.focus();
                                            }
                                        }}
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
                            <div className="grid gap-3">
                                <Label htmlFor={confirmPasswordId}>Confirm New Password</Label>
                                <div className="relative">
                                    <Input
                                        autoComplete="new-password"
                                        className="pr-12"
                                        id={confirmPasswordId}
                                        onBlur={() => {
                                            fieldState.confirmPassword?.handleBlur();
                                            // Validate password match on blur
                                            validateConfirmPasswordMatch();
                                        }}
                                        onChange={e => {
                                            fieldState.confirmPassword?.setValue(e.target.value);
                                            // Clear custom error when user starts typing
                                            if (confirmPasswordError) {
                                                setConfirmPasswordError(null);
                                            }
                                        }}
                                        onKeyDown={e => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                handlePasswordReset();
                                            }
                                        }}
                                        placeholder="Confirm New Password"
                                        ref={confirmPasswordInputRef}
                                        type={confirmPassword.isVisible ? "text" : "password"}
                                        value={fieldState.confirmPassword?.value || ""}
                                    />
                                    <PasswordVisibilityToggle
                                        isVisible={confirmPassword.isVisible}
                                        onToggle={confirmPassword.toggle}
                                    />
                                </div>
                                {(fieldState.confirmPassword?.error || confirmPasswordError) && (
                                    <span className="text-destructive text-sm">
                                        {fieldState.confirmPassword?.error || confirmPasswordError}
                                    </span>
                                )}
                            </div>
                            {formError && <span className="text-destructive text-sm">{formError}</span>}
                            <Button className="w-full" disabled={isLoading} onClick={handlePasswordReset}>
                                <span>Reset Password</span>
                            </Button>
                        </div>
                        <div className="mt-4 mb-2 text-center text-sm">
                            Remember your password?{" "}
                            <button
                                className="underline underline-offset-4"
                                onClick={() => router.push("/auth/sign-in")}
                                type="button">
                                Sign In
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
