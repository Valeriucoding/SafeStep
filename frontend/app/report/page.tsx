"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ReportForm } from "@/components/report-form"
import { LocationPicker } from "@/components/location-picker"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { createEvent } from "@/lib/api"
import { useUserLocation } from "@/hooks/use-user-location"
import type { Location, NewEvent } from "@/types"
import { useAuth } from "@/lib/hooks/use-auth"
import { formatDistanceToNow } from "date-fns"

export default function ReportPage() {
  const router = useRouter()
  const { user, supabase } = useAuth()
  const { location: userLocation, requestLocation } = useUserLocation()
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [radiusMeters, setRadiusMeters] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reportBanUntil, setReportBanUntil] = useState<string | null>(null)
  const [isProfileLoading, setIsProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadProfileMetrics = async () => {
      if (!user?.id || !supabase) {
        if (isMounted) {
          setReportBanUntil(null)
          setProfileError(null)
          setIsProfileLoading(false)
        }
        return
      }

      setIsProfileLoading(true)
      setProfileError(null)

      const { data, error } = await supabase
        .from("profiles")
        .select("report_ban_until")
        .eq("id", user.id)
        .maybeSingle()

      if (!isMounted) {
        return
      }

      if (error) {
        console.error("[report] Failed to load reporter profile metrics:", error)
        setProfileError("We couldn't verify your reporting status. Please try again shortly.")
        setReportBanUntil(null)
      } else {
        setReportBanUntil(data?.report_ban_until ?? null)
      }

      setIsProfileLoading(false)
    }

    void loadProfileMetrics()

    return () => {
      isMounted = false
    }
  }, [supabase, user?.id])

  const isBanActive = useMemo(() => {
    if (!reportBanUntil) {
      return false
    }

    const banDate = new Date(reportBanUntil)
    return Number.isFinite(banDate.getTime()) && banDate.getTime() > Date.now()
  }, [reportBanUntil])

  const authBlocked = !user
  const errorBlocked = Boolean(profileError)
  const banBlocked = isBanActive
  const loadingBlocked = isProfileLoading

  const isReportingBlocked = authBlocked || loadingBlocked || banBlocked || errorBlocked

  const blockedMessage = useMemo(() => {
    if (authBlocked) {
      return "Sign in to share safety updates with the community."
    }

    if (loadingBlocked) {
      return "Checking your reporting status..."
    }

    if (banBlocked && reportBanUntil) {
      const banDate = new Date(reportBanUntil)
      if (Number.isFinite(banDate.getTime())) {
        const relative = formatDistanceToNow(banDate, { addSuffix: true })
        return `Reporting is temporarily disabled until ${banDate.toLocaleString()} (${relative}).`
      }
      return "Reporting is temporarily disabled right now."
    }

    if (errorBlocked && profileError) {
      return profileError
    }

    return null
  }, [authBlocked, banBlocked, errorBlocked, loadingBlocked, profileError, reportBanUntil])

  const handleSubmit = async (data: Omit<NewEvent, "location">) => {
    if (!selectedLocation || isReportingBlocked) {
      return
    }

    setIsSubmitting(true)
    try {
      const newEvent: NewEvent = {
        ...data,
        radiusMeters: radiusMeters > 0 ? radiusMeters : undefined,
        location: {
          lat: selectedLocation.lat,
          lng: selectedLocation.lng,
        },
      }

      await createEvent(newEvent)
      router.push("/")
    } catch (error) {
      console.error("Failed to create event:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] w-full flex-col gap-6 px-4 pb-10 pt-4 sm:min-h-[calc(100dvh-4rem)] sm:px-6 sm:pt-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-11 w-11 rounded-full border border-border bg-background shadow-sm"
          asChild
        >
          <Link href="/" aria-label="Back to home">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex flex-col">
          <h1 className="text-xl font-semibold text-foreground sm:text-2xl">Report Event</h1>
          <span className="text-sm text-muted-foreground">Share a new safety update with the community</span>
        </div>
      </div>

      <div className="space-y-8">
        <div className="space-y-5">
          <LocationPicker
            userLocation={userLocation}
            selectedLocation={selectedLocation}
            onLocationChange={setSelectedLocation}
            onRequestLocation={requestLocation}
            radiusMeters={radiusMeters}
          />

          <div className="rounded-xl border border-border bg-background px-4 py-4 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col">
                <span className="text-base font-medium text-foreground">Impact radius</span>
                <span className="text-sm text-muted-foreground">
                  Set a radius to highlight the affected zone (0 hides the overlay)
                </span>
              </div>
              <span className="text-sm font-semibold text-primary">
                {radiusMeters > 0 ? `${radiusMeters} m` : "Off"}
              </span>
            </div>
            <div className="mt-4 px-1">
              <Slider
                aria-label="Impact radius in meters"
                value={[radiusMeters]}
                min={0}
                max={1000}
                step={10}
                onValueChange={(value) => {
                  const next = value[0]
                  setRadiusMeters(typeof next === "number" ? next : radiusMeters)
                }}
              />
            </div>
          </div>
        </div>

        <ReportForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          disabled={!selectedLocation}
          radiusMeters={radiusMeters}
          isReportingBlocked={isReportingBlocked}
          blockedReason={blockedMessage}
        />
      </div>
    </div>
  )
}
