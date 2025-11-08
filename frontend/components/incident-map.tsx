"use client"

import { useEffect, useRef, useState } from "react"
import { importLibrary } from "@googlemaps/js-api-loader"
import type { Location } from "@/types"
import type * as google from "google.maps"

interface IncidentMapProps {
  location: Location
}

export function IncidentMap({ location }: IncidentMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)

  useEffect(() => {
    const initMap = async () => {
      try {
        const { Map } = (await importLibrary("maps", {
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        })) as google.maps.MapsLibrary

        const { Marker } = (await importLibrary("marker", {
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        })) as google.maps.MarkerLibrary

        if (mapRef.current && !map) {
          const newMap = new Map(mapRef.current, {
            center: location,
            zoom: 16,
            disableDefaultUI: true,
            zoomControl: true,
            gestureHandling: "cooperative",
            mapId: "safestep-incident-map",
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
  }, [])

  return <div ref={mapRef} className="h-64 w-full" />
}
