"use client"

import { useState, useEffect } from "react"
import { MapView } from "@/components/map-view"
import { IncidentMarker } from "@/components/incident-marker"
import { MapControls } from "@/components/map-controls"
import { FeedView } from "@/components/feed-view"
import { BottomNav } from "@/components/bottom-nav"
import { useUserLocation } from "@/hooks/use-user-location"
import { getAllIncidents } from "@/lib/api"
import type { Incident } from "@/types"
import { Loader2 } from "lucide-react"

export default function HomePage() {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [view, setView] = useState<"map" | "feed">("map")
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null)
  const { location, error: locationError, requestLocation } = useUserLocation()

  useEffect(() => {
    async function loadIncidents() {
      try {
        const data = await getAllIncidents()
        setIncidents(data)
      } catch (error) {
        console.error("Failed to load incidents:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadIncidents()
  }, [])

  const filteredIncidents = selectedCategory
    ? incidents.filter((incident) => incident.category === selectedCategory)
    : incidents

  useEffect(() => {
    if (!mapInstance || location || filteredIncidents.length === 0) {
      return
    }

    if (typeof google === "undefined") {
      return
    }

    const bounds = new google.maps.LatLngBounds()
    filteredIncidents.forEach((incident) => bounds.extend(incident.location))
    mapInstance.fitBounds(bounds, { top: 48, right: 48, bottom: 48, left: 48 })
  }, [mapInstance, location, filteredIncidents])

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
            {filteredIncidents.map((incident) => (
              <IncidentMarker key={incident.id} incident={incident} />
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
        <FeedView
          incidents={filteredIncidents}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
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
