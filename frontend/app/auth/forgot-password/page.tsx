"use client";

import { useAuthForm } from "@/hooks/auth/use-auth-form";
import { validateEmail } from "@/lib/validation/auth";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { EmailConfirmationSuccess } from "@/components/auth/email-confirmation-success";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/hooks/use-auth";

export default function ForgotPassword() {
    const router = useRouter();
    const { resetPassword } = useAuth();
    const [resetEmailSent, setResetEmailSent] = useState(false);
    const emailId = useId();

    const { fieldState, isLoading, formError, handleSubmit, focusFirstField } = useAuthForm({
        email: {
            validationFn: validateEmail,
        },
    });

    useEffect(() => {
        const cleanup = focusFirstField();
        return cleanup;
    }, [focusFirstField]);

    const handleForgotPassword = async () => {
        try {
            await handleSubmit(async () => {
                await resetPassword(fieldState.email?.value || "");
                setResetEmailSent(true);
            });
        } catch (_error) {
            // Error already handled by useAuthForm
        }
    };

    if (resetEmailSent) {
        return (
            <EmailConfirmationSuccess
                continueLabel="Back to sign in"
                message={`Password reset instructions sent to ${fieldState.email?.value}`}
                onContinue={() => router.push("/auth/sign-in")}
            />
        );
    }

    return (
        <div className="flex h-[calc(100dvh-3.5rem)] overflow-y-auto bg-background p-4">
            <div className="flex w-full items-center justify-center">
                <Card className="w-full max-w-md border-border/50 shadow-sm sm:border-border sm:shadow-black/5">
                    <CardHeader>
                        <CardTitle className="text-center text-xl sm:text-left">Forgot password?</CardTitle>
                        <CardDescription className="text-center sm:text-left">
                            Enter your email to reset your password
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
                                {(fieldState.email?.error || formError) && (
                                    <span className="text-destructive text-sm">
                                        {fieldState.email?.error || formError}
                                    </span>
                                )}
                            </div>
                            <Button className="w-full" disabled={isLoading} onClick={handleForgotPassword}>
                                <span>Reset your password</span>
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
