"use client";

import { useAuthForm } from "@/hooks/auth/use-auth-form";
import { usePasswordVisibility } from "@/hooks/auth/use-password-visibility";
import { validateConfirmPassword, validateEmail, validatePassword } from "@/lib/validation/auth";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { EmailConfirmationSuccess } from "@/components/auth/email-confirmation-success";
import { PasswordVisibilityToggle } from "@/components/auth/password-visibility-toggle";
import { SafeStepLogo } from "@/components/icons/safe-step-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/hooks/use-auth";

export default function SignUp() {
    const router = useRouter();
    const { signUp } = useAuth();
    const [initialFocusComplete, setInitialFocusComplete] = useState(false);
    const [signUpComplete, setSignUpComplete] = useState(false);
    const password = usePasswordVisibility();
    const confirmPassword = usePasswordVisibility();
    const passwordValueRef = useRef("");
    const emailId = useId();
    const passwordId = useId();
    const confirmPasswordId = useId();

    const { fieldState, isLoading, formError, handleSubmit, focusFirstField } = useAuthForm({
        confirmPassword: {
            validationFn: value => validateConfirmPassword(passwordValueRef.current, value),
        },
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

    const handleSignUp = async () => {
        try {
            await handleSubmit(async () => {
                await signUp(fieldState.email?.value || "", fieldState.password?.value || "");
                setSignUpComplete(true);
            });
        } catch (_error) {
            // Error already handled by useAuthForm
        }
    };

    if (signUpComplete) {
        return (
            <EmailConfirmationSuccess
                continueLabel="Back to sign in"
                message={`Confirmation link sent to ${fieldState.email?.value}. Please check your inbox to verify your account.`}
                onContinue={() => router.push("/auth/sign-in")}
            />
        );
    }

    return (
        <div className="flex h-[calc(100dvh-3.5rem)] overflow-y-auto bg-background p-4">
            <div className="flex w-full flex-col items-center justify-center gap-6">
                <SafeStepLogo className="h-12 w-auto" />
                <Card className="w-full max-w-md border-border/50 shadow-sm sm:border-border sm:shadow-black/5">
                    <CardHeader className="space-y-2 text-center sm:text-left">
                        <CardTitle className="text-xl font-semibold sm:text-2xl">Join SafeStep</CardTitle>
                        <CardDescription className="text-sm sm:text-base">
                            Create your account to help report and track local issues.
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
                                <Label htmlFor={passwordId}>Password</Label>
                                <div className="relative">
                                    <Input
                                        autoComplete="new-password"
                                        className="pr-12"
                                        id={passwordId}
                                        onBlur={fieldState.password?.handleBlur}
                                    onChange={e => {
                                        const value = e.target.value;
                                        passwordValueRef.current = value;
                                        fieldState.password?.setValue(value);
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
                                <Label htmlFor={confirmPasswordId}>Confirm Password</Label>
                                <div className="relative">
                                    <Input
                                        autoComplete="new-password"
                                        className="pr-12"
                                        id={confirmPasswordId}
                                        onBlur={fieldState.confirmPassword?.handleBlur}
                                        onChange={e => fieldState.confirmPassword?.setValue(e.target.value)}
                                        placeholder="Confirm Password"
                                        ref={fieldState.confirmPassword?.ref}
                                        type={confirmPassword.isVisible ? "text" : "password"}
                                        value={fieldState.confirmPassword?.value || ""}
                                    />
                                    <PasswordVisibilityToggle
                                        isVisible={confirmPassword.isVisible}
                                        onToggle={confirmPassword.toggle}
                                    />
                                </div>
                                {fieldState.confirmPassword?.error && (
                                    <span className="text-destructive text-sm">{fieldState.confirmPassword.error}</span>
                                )}
                            </div>
                            {formError && <span className="text-destructive text-sm">{formError}</span>}
                            <div className="flex flex-col gap-3">
                                <Button className="w-full" disabled={isLoading} onClick={handleSignUp}>
                                    Continue
                                </Button>
                            </div>
                        </div>
                        <div className="mt-4 mb-2 text-center text-sm">
                            Already have an account?{" "}
                            <button
                                className="underline underline-offset-4"
                                onClick={() => router.push("/auth/sign-in")}
                                type="button">
                                Sign in
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
