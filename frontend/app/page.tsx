"use client"

import { useState, useEffect } from "react"
import { MapView } from "@/components/map-view"
import { EventMarker } from "@/components/event-marker"
import { MapControls } from "@/components/map-controls"
import { FeedView } from "@/components/feed-view"
import { BottomNav } from "@/components/bottom-nav"
import { useUserLocation } from "@/hooks/use-user-location"
import { getAllEvents } from "@/lib/api"
import type { Category, Event } from "@/types"
import { Loader2 } from "lucide-react"

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([])
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [view, setView] = useState<"map" | "feed">("map")
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null)
  const { location, error: locationError, requestLocation } = useUserLocation()

  useEffect(() => {
    async function loadEvents() {
      try {
        const data = await getAllEvents()
        setEvents(data)
      } catch (error) {
        console.error("Failed to load events:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadEvents()
  }, [])

  const filteredEvents = selectedCategory
    ? events.filter((event) => event.category === selectedCategory)
    : events

  useEffect(() => {
    if (!mapInstance || location || filteredEvents.length === 0) {
      return
    }

    if (typeof google === "undefined") {
      return
    }

    const bounds = new google.maps.LatLngBounds()
    filteredEvents.forEach((event) => bounds.extend(event.location))
    mapInstance.fitBounds(bounds, { top: 48, right: 48, bottom: 48, left: 48 })
  }, [mapInstance, location, filteredEvents])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading SafeStep...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-screen w-full pb-16">
      {view === "map" ? (
        <>
          <MapView
            center={location || { lat: 44.4268, lng: 26.1025 }}
            zoom={14}
            onLocationRequest={requestLocation}
            onMapReady={setMapInstance}
          >
            {filteredEvents.map((event) => (
              <EventMarker key={event.id} event={event} />
            ))}
          </MapView>

          <MapControls
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            onLocationRequest={requestLocation}
            hasLocation={!!location}
          />
        </>
      ) : (
        <FeedView events={filteredEvents} selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />
      )}

      {locationError && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg shadow-lg text-sm z-50">
          {locationError}
        </div>
      )}

      <BottomNav currentView={view} onViewChange={setView} />
    </div>
  )
}
