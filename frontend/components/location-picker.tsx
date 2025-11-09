"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Navigation, MapPin } from "lucide-react"
import type { Location } from "@/types"
import { importMapsLibrary, importMarkerLibrary } from "@/lib/google-maps"
import { UserLocationMarker } from "@/components/user-location-marker"

interface LocationPickerProps {
  userLocation: Location | null
  selectedLocation: Location | null
  onLocationChange: (location: Location) => void
  onRequestLocation: () => void
}

export function LocationPicker({
  userLocation,
  selectedLocation,
  onLocationChange,
  onRequestLocation,
}: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const markerRef = useRef<google.maps.Marker | null>(null)

  useEffect(() => {
    const initMap = async () => {
      try {
        const { Map } = await importMapsLibrary()

        if (mapRef.current && !map) {
          const defaultCenter = userLocation || { lat: 44.4268, lng: 26.1025 }

          const newMap = new Map(mapRef.current, {
            center: defaultCenter,
            zoom: 15,
            disableDefaultUI: true,
            zoomControl: true,
            clickableIcons: false,
            mapId: "safestep-location-picker",
          })

          newMap.addListener("click", (e: google.maps.MapMouseEvent) => {
            if (e.latLng) {
              const location = {
                lat: e.latLng.lat(),
                lng: e.latLng.lng(),
              }
              onLocationChange(location)
            }
          })

          setMap(newMap)
        }
      } catch (error) {
        console.error("Error loading map:", error)
      }
    }

    initMap()
  }, [])

  useEffect(() => {
    const updateMarker = async () => {
      if (map && selectedLocation) {
        if (markerRef.current) {
          markerRef.current.setMap(null)
        }

        const { Marker } = await importMarkerLibrary()

        markerRef.current = new Marker({
          position: selectedLocation,
          map: map,
        })

        map.panTo(selectedLocation)
      }
    }

    updateMarker()
  }, [map, selectedLocation])

  useEffect(() => {
    if (map && userLocation) {
      map.panTo(userLocation)
      if (!selectedLocation) {
        onLocationChange(userLocation)
      }
    }
  }, [map, userLocation])

  return (
    <div className="space-y-3">
      <div className="relative w-full overflow-hidden rounded-lg border border-border bg-muted">
        <div ref={mapRef} className="h-64 w-full sm:h-80" />

        {map && userLocation && (
          <UserLocationMarker map={map} location={userLocation} />
        )}

        <Button
          type="button"
          size="icon"
          variant="secondary"
          className="absolute top-3 right-3 h-11 w-11 shadow-lg bg-background/95 backdrop-blur-sm hover:bg-background"
          onClick={onRequestLocation}
          aria-label="Use current location"
        >
          <Navigation className="h-5 w-5" />
        </Button>

        {selectedLocation && (
          <div className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-3 sm:w-auto">
            <div className="inline-flex items-center gap-2 rounded-lg bg-background/95 backdrop-blur-sm px-4 py-2.5 shadow-lg border border-border/50">
              <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-sm font-medium text-foreground">Location selected</span>
            </div>
          </div>
        )}
      </div>

      <p className="text-sm text-muted-foreground text-center px-2">
        Click on the map to select the incident location
      </p>
    </div>
  )
}
