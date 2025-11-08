"use client"

import { useEffect, useRef, useState } from "react"
import type { Location } from "@/types"
import { importMapsLibrary, importMarkerLibrary } from "@/lib/google-maps"

interface EventMapProps {
  location: Location
}

export function EventMap({ location }: EventMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)

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


  return <div ref={mapRef} className="h-64 w-full" />
}
