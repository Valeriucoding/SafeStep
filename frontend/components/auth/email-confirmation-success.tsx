"use client";

import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EmailConfirmationSuccessProps {
  message: string;
  onContinue?: () => void;
  continueLabel?: string;
}

export function EmailConfirmationSuccess({
  message,
  onContinue,
  continueLabel = "Back to sign in",
}: EmailConfirmationSuccessProps) {
  return (
    <div className="flex h-[calc(100dvh-3.5rem)] overflow-y-auto bg-background p-4">
      <div className="flex w-full items-center justify-center">
        <Card className="w-full max-w-md border-border/50 shadow-sm sm:border-border sm:shadow-black/5">
          <CardContent className="flex flex-col items-center gap-6 pt-10 text-center">
            <CheckCircle2 className="h-16 w-16 text-primary" aria-hidden />
            <p className="text-base text-muted-foreground">{message}</p>
            {onContinue && (
              <Button className="h-12 w-full" onClick={onContinue}>
                {continueLabel}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

