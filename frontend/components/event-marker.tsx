"use client"

import { useEffect } from "react"
import type { Event } from "@/types"
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/constants"
import { importMapsLibrary, importMarkerLibrary } from "@/lib/google-maps"

interface EventMarkerProps {
  event: Event
  map?: google.maps.Map
  onSelect?: (event: Event) => void
}

export function EventMarker({ event, map, onSelect }: EventMarkerProps) {
  useEffect(() => {
    if (!map) {
      return
    }

    let marker: google.maps.marker.AdvancedMarkerElement | null = null
    let circle: google.maps.Circle | null = null
    let circleClickListener: google.maps.MapsEventListener | null = null
    let markerClickListener: google.maps.MapsEventListener | null = null
    let isMounted = true

    const createOverlay = async () => {
      try {
        const mapsLibrary = await importMapsLibrary()
        const markerLibrary = await importMarkerLibrary()
        const AdvancedMarkerElement = markerLibrary.AdvancedMarkerElement

        if (!isMounted) {
          return
        }

        if (event.radiusMeters && event.radiusMeters > 0) {
          const color =
            CATEGORY_COLORS[event.category as keyof typeof CATEGORY_COLORS] ?? "rgba(15, 23, 42, 1)"

          const circleConfig: google.maps.CircleOptions = {
            map,
            center: event.location,
            radius: event.radiusMeters,
            strokeColor: color,
            strokeOpacity: 0.65,
            strokeWeight: 2,
            fillColor: color,
            fillOpacity: 0.2,
          }

          circle = new google.maps.Circle(circleConfig)
          circleClickListener = circle.addListener("click", () => {
            onSelect?.(event)
          })
        }

        if (AdvancedMarkerElement) {
          const iconWrapper = document.createElement("div")
          iconWrapper.style.width = "44px"
          iconWrapper.style.height = "44px"
          iconWrapper.style.borderRadius = "50%"
          iconWrapper.style.display = "flex"
          iconWrapper.style.alignItems = "center"
          iconWrapper.style.justifyContent = "center"
          iconWrapper.style.color = "#0f172a"
          iconWrapper.style.fontSize = "20px"
          iconWrapper.style.fontWeight = "600"
          iconWrapper.style.boxShadow = "0 8px 16px rgba(15, 23, 42, 0.25)"
          iconWrapper.style.backgroundColor =
            CATEGORY_COLORS[event.category as keyof typeof CATEGORY_COLORS] ?? "#fde68a"
          iconWrapper.textContent = CATEGORY_ICONS[event.category as keyof typeof CATEGORY_ICONS] ?? "📍"

          marker = new AdvancedMarkerElement({
            map,
            position: event.location,
            title: event.title,
            content: iconWrapper,
          })

          markerClickListener = marker.addListener("click", () => {
            onSelect?.(event)
          })
        } else {
          marker = new mapsLibrary.Marker({
            map,
            position: event.location,
            title: event.title,
          }) as unknown as google.maps.marker.AdvancedMarkerElement

          markerClickListener = marker.addListener("click", () => {
            onSelect?.(event)
          })
        }
      } catch (error) {
        console.error("Failed to render event marker:", error)
      }
    }

    createOverlay()

    return () => {
      isMounted = false
      if (marker) {
        marker.map = null
      }
      if (circle) {
        circle.setMap(null)
      }
      if (circleClickListener) {
        circleClickListener.remove()
      }
      if (markerClickListener) {
        markerClickListener.remove()
      }
    }
  }, [event, map])

  return null
}
