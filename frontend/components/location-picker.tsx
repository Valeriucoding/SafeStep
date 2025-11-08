"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navigation, MapPin } from "lucide-react"
import type { Location } from "@/types"
import { importMapsLibrary, importMarkerLibrary } from "@/lib/google-maps"

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
    <Card className="overflow-hidden">
      <div className="relative">
        <div ref={mapRef} className="h-64 w-full bg-muted" />

        <Button
          type="button"
          size="icon"
          variant="secondary"
          className="absolute top-2 right-2 shadow-lg"
          onClick={onRequestLocation}
        >
          <Navigation className="h-4 w-4" />
        </Button>

        {selectedLocation && (
          <div className="absolute bottom-2 left-2 right-2">
            <Card className="p-2 bg-background/95 backdrop-blur">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="font-medium">Location selected</span>
              </div>
            </Card>
          </div>
        )}
      </div>

      <div className="p-4 border-t bg-muted/30">
        <p className="text-sm text-muted-foreground text-center">Click on the map to select the incident location</p>
      </div>
    </Card>
  )
}
