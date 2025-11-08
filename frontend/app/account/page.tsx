"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/hooks/use-auth";

export default function AccountPage() {
  const router = useRouter();
  const { user } = useAuth();

  const email = user?.email ?? "";
  const fullName =
    user?.user_metadata?.full_name?.trim() ||
    user?.user_metadata?.name?.trim() ||
    "";

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-3.5rem)] w-full max-w-2xl flex-col gap-6 px-4 pb-10 pt-2 sm:min-h-[calc(100dvh-4rem)] sm:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-11 w-11 rounded-full border border-border bg-background shadow-sm"
          onClick={() => router.back()}
          aria-label="Back to previous page"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex flex-col">
          <h1 className="text-xl font-semibold text-foreground">Account settings</h1>
          <span className="text-sm text-muted-foreground">Review your profile information</span>
        </div>
      </div>

      <Card className="rounded-2xl border border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Name</Label>
            <Input id="fullName" value={fullName} readOnly placeholder="Add your name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="flex items-center gap-2 rounded-lg border border-border/70 bg-muted/40 px-3 py-2.5 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>{email}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Editing profile details will be available soon. Contact support if you need to update your account data.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}


