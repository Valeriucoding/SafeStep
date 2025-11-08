"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ReportForm } from "@/components/report-form"
import { LocationPicker } from "@/components/location-picker"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { createEvent } from "@/lib/api"
import { useUserLocation } from "@/hooks/use-user-location"
import type { Location, NewEvent } from "@/types"

export default function ReportPage() {
  const router = useRouter()
  const { location: userLocation, requestLocation } = useUserLocation()
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: Omit<NewEvent, "location">) => {
    if (!selectedLocation) return

    setIsSubmitting(true)
    try {
      const newEvent: NewEvent = {
        ...data,
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
    <div className="mx-auto flex min-h-[calc(100dvh-3.5rem)] w-full max-w-2xl flex-col gap-6 px-4 pb-10 pt-2 sm:min-h-[calc(100dvh-4rem)] sm:px-6">
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
          <h1 className="text-xl font-semibold text-foreground">Report Event</h1>
          <span className="text-sm text-muted-foreground">Share a new safety update with the community</span>
        </div>
      </div>

      <div className="space-y-6">
        <LocationPicker
          userLocation={userLocation}
          selectedLocation={selectedLocation}
          onLocationChange={setSelectedLocation}
          onRequestLocation={requestLocation}
        />

        <ReportForm onSubmit={handleSubmit} isSubmitting={isSubmitting} disabled={!selectedLocation} />
      </div>
    </div>
  )
}
