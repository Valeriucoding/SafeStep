"use client"

import { useEffect, useRef, useState } from "react"
import type { Location } from "@/types"
import { importMapsLibrary, importMarkerLibrary } from "@/lib/google-maps"
import { CATEGORY_COLORS } from "@/lib/constants"

interface EventMapProps {
  location: Location
  radiusMeters?: number
  category?: string
}

export function EventMap({ location, radiusMeters, category }: EventMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const circleRef = useRef<google.maps.Circle | null>(null)

  useEffect(() => {
    const initMap = async () => {
      try {
        const { Map: GoogleMap } = await importMapsLibrary()
        const { Marker } = await importMarkerLibrary()

        if (mapRef.current && !map) {
          const newMap = new GoogleMap(mapRef.current, {
            center: location,
            zoom: 16,
            disableDefaultUI: true,
            zoomControl: true,
            gestureHandling: "cooperative",
            clickableIcons: false,
            mapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID ?? "safestep-event-map",
          })

          new Marker({
            position: location,
            map: newMap,
          })

          setMap(newMap)
        }
      } catch (error) {
        console.error("Error loading map:", error)
      }
    }

    initMap()
  }, [location, map])

  useEffect(() => {
    if (map) {
      map.panTo(location)
    }
  }, [map, location])

  useEffect(() => {
    if (!map) return

    // Remove existing circle if it exists
    if (circleRef.current) {
      circleRef.current.setMap(null)
      circleRef.current = null
    }

    // Create new circle if radius is provided
    if (radiusMeters && radiusMeters > 0) {
      const color =
        category && CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS]
          ? CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS]
          : "rgba(15, 23, 42, 1)"

      const circleConfig: google.maps.CircleOptions = {
        map,
        center: location,
        radius: radiusMeters,
        strokeColor: color,
        strokeOpacity: 0.65,
        strokeWeight: 2,
        fillColor: color,
        fillOpacity: 0.2,
      }

      circleRef.current = new google.maps.Circle(circleConfig)
    }

    return () => {
      if (circleRef.current) {
        circleRef.current.setMap(null)
        circleRef.current = null
      }
    }
  }, [map, location, radiusMeters, category])

  return <div ref={mapRef} className="h-64 w-full rounded-lg" />
}
