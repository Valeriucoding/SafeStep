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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-4 px-4 py-3">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">Report Event</h1>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-2xl p-4 space-y-6">
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
