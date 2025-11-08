"use client"

import { useState, useEffect, useMemo } from "react"
import { MapView } from "@/components/map-view"
import { EventMarker } from "@/components/event-marker"
import { MapControls } from "@/components/map-controls"
import { FeedView } from "@/components/feed-view"
import { BottomNav } from "@/components/bottom-nav"
import { useUserLocation } from "@/hooks/use-user-location"
import type { Category } from "@/types"
import { useEventsStore } from "@/store/events-store"
import { Loader2 } from "lucide-react"

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [view, setView] = useState<"map" | "feed">("map")
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null)
  const { location, error: locationError, requestLocation } = useUserLocation()
  const events = useEventsStore((state) => state.events)
  const isLoading = useEventsStore((state) => state.isLoading)
  const error = useEventsStore((state) => state.error)
  const fetchEvents = useEventsStore((state) => state.fetchEvents)
  const subscribeToRealtime = useEventsStore((state) => state.subscribeToRealtime)
  const unsubscribeFromRealtime = useEventsStore((state) => state.unsubscribeFromRealtime)

  useEffect(() => {
    fetchEvents()
    subscribeToRealtime()

    return () => {
      unsubscribeFromRealtime()
    }
  }, [fetchEvents, subscribeToRealtime, unsubscribeFromRealtime])

  const filteredEvents = useMemo(() => {
    if (!selectedCategory) {
      return events
    }
    return events.filter((event) => event.category === selectedCategory)
  }, [events, selectedCategory])

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

  if (isLoading && events.length === 0) {
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
    <div className="relative flex h-[calc(100dvh-3.5rem)] w-full flex-col sm:h-[calc(100dvh-4rem)]">
      {error && (
        <div className="absolute top-4 left-1/2 z-50 w-[90%] max-w-sm -translate-x-1/2 rounded-lg border border-destructive bg-destructive/10 px-4 py-2 text-center text-sm text-destructive">
          {error}
        </div>
      )}
      {view === "map" ? (
        <div className="relative flex flex-1">
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
        </div>
      ) : (
        <div className="flex-1 overflow-hidden">
          <FeedView events={filteredEvents} selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />
        </div>
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
