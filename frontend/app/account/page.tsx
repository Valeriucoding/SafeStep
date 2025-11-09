"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Mail, ShieldCheck, Sparkles, TriangleAlert } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/hooks/use-auth"
import { cn } from "@/lib/utils"

interface ReporterMetrics {
  score: number
  level: number
  valid: number
  invalid: number
  premiumUntil: string | null
}

const INITIAL_METRICS: ReporterMetrics = {
  score: 0,
  level: 0,
  valid: 0,
  invalid: 0,
  premiumUntil: null,
}

export default function AccountPage() {
  const router = useRouter()
  const { user, supabase } = useAuth()
  const [metrics, setMetrics] = useState<ReporterMetrics>(INITIAL_METRICS)
  const [isMetricsLoading, setIsMetricsLoading] = useState(false)

  const email = user?.email ?? ""
  const fullName = user?.user_metadata?.full_name?.trim() || user?.user_metadata?.name?.trim() || ""

  useEffect(() => {
    let isMounted = true

    const loadMetrics = async () => {
      if (!user?.id || !supabase) {
        if (isMounted) {
          setMetrics(INITIAL_METRICS)
        }
        return
      }

      setIsMetricsLoading(true)

      const { data, error } = await supabase
        .from("profiles")
        .select("report_score, report_level, total_valid_reports, total_invalid_reports, premium_until")
        .eq("id", user.id)
        .maybeSingle()

      if (!isMounted) {
        return
      }

      if (error) {
        console.error("[account] Failed to load reporter metrics:", error)
        setMetrics(INITIAL_METRICS)
      } else if (data) {
        setMetrics({
          score: data.report_score ?? 0,
          level: data.report_level ?? 0,
          valid: data.total_valid_reports ?? 0,
          invalid: data.total_invalid_reports ?? 0,
          premiumUntil: data.premium_until ?? null,
        })
      } else {
        setMetrics(INITIAL_METRICS)
      }

      setIsMetricsLoading(false)
    }

    void loadMetrics()

    return () => {
      isMounted = false
    }
  }, [supabase, user?.id])

  const premiumStatus = useMemo(() => {
    if (!metrics.premiumUntil) {
      return { label: "Inactive", helper: "Earn 20 points for a week of Premium Safety Insights.", isActive: false }
    }

    const premiumDate = new Date(metrics.premiumUntil)
    if (!Number.isFinite(premiumDate.getTime()) || premiumDate.getTime() <= Date.now()) {
      return { label: "Expired", helper: "Keep verifying events accurately to extend your premium access.", isActive: false }
    }

    const relative = formatDistanceToNow(premiumDate, { addSuffix: true })
    return {
      label: "Active",
      helper: `Premium Safety Insights until ${premiumDate.toLocaleString()} (${relative}).`,
      isActive: true,
    }
  }, [metrics.premiumUntil])

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

      <Card className="rounded-2xl border border-border/60 shadow-sm">
        <CardHeader className="flex flex-col gap-1">
          <CardTitle className="text-base font-semibold text-foreground">Safety Reporting</CardTitle>
          <p className="text-sm text-muted-foreground">
            Track how your contributions unlock premium access and community status.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-border/70 bg-background px-3 py-3">
              <p className="text-xs uppercase text-muted-foreground">Score</p>
              <p className="text-lg font-semibold text-foreground">{metrics.score}</p>
            </div>
            <div className="rounded-xl border border-border/70 bg-background px-3 py-3">
              <p className="text-xs uppercase text-muted-foreground">Level</p>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <p className="text-lg font-semibold text-foreground">{metrics.level}</p>
              </div>
            </div>
            <div className="rounded-xl border border-border/70 bg-background px-3 py-3">
              <p className="text-xs uppercase text-muted-foreground">Valid</p>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-500" />
                <p className="text-lg font-semibold text-foreground">{metrics.valid}</p>
              </div>
            </div>
            <div className="rounded-xl border border-border/70 bg-background px-3 py-3">
              <p className="text-xs uppercase text-muted-foreground">Spam / False</p>
              <div className="flex items-center gap-2">
                <TriangleAlert className="h-4 w-4 text-destructive" />
                <p className="text-lg font-semibold text-foreground">{metrics.invalid}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border/70 bg-primary/5 px-4 py-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">Premium Safety Insights</p>
                <p
                  className={cn(
                    "text-sm",
                    premiumStatus.isActive ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {premiumStatus.helper}
                </p>
              </div>
              <span
                className={cn(
                  "inline-flex h-8 items-center justify-center rounded-full px-4 text-sm font-medium",
                  premiumStatus.isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {isMetricsLoading ? "…" : premiumStatus.label}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

