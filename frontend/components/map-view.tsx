"use client"

import { Children, cloneElement, isValidElement, useEffect, useRef, useState } from "react"
import type { ReactElement, ReactNode } from "react"
import type { Location } from "@/types"
import { importMapsLibrary } from "@/lib/google-maps"

interface MapViewProps {
  center: Location
  zoom: number
  children?: ReactNode
  onLocationRequest?: () => void
  onMapReady?: (map: google.maps.Map) => void
}

export function MapView({ center, zoom, children, onMapReady }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initMap = async () => {
      try {
        const { Map } = await importMapsLibrary()

        if (mapRef.current && !map) {
          const newMap = new Map(mapRef.current, {
            center,
            zoom,
            disableDefaultUI: true,
            zoomControl: false,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            mapId: "safestep-map",
            styles: [
              {
                featureType: "poi",
                stylers: [{ visibility: "off" }],
              },
            ],
          })
          setMap(newMap)
          setIsLoading(false)
          onMapReady?.(newMap)
        }
      } catch (error) {
        console.error("Error loading Google Maps:", error)
        setIsLoading(false)
      }
    }

    initMap()
  }, [center, map, onMapReady, zoom])

  useEffect(() => {
    if (map) {
      map.panTo(center)
    }
  }, [map, center])

  const renderedChildren =
    map && children
      ? Children.map(children, (child) => {
          if (!isValidElement(child)) {
            return child
          }

          return cloneElement(child as ReactElement<{ map?: google.maps.Map }>, { map })
        })
      : null

  return (
    <>
      <div ref={mapRef} className="h-full w-full" />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background">
          <div className="text-sm text-muted-foreground">Loading map...</div>
        </div>
      )}
      {renderedChildren}
    </>
  )
}
