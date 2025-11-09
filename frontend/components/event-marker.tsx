"use client"

import { useEffect, useRef } from "react"
import type { Event } from "@/types"
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/constants"
import { importMapsLibrary, importMarkerLibrary } from "@/lib/google-maps"

interface EventMarkerProps {
  event: Event
  map?: google.maps.Map
  onSelect?: (event: Event) => void
}

export function EventMarker({ event, map, onSelect }: EventMarkerProps) {
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null)
  const circleRef = useRef<google.maps.Circle | null>(null)
  const circleClickListenerRef = useRef<google.maps.MapsEventListener | null>(null)
  const markerClickListenerRef = useRef<google.maps.MapsEventListener | null>(null)
  const prevEventDataRef = useRef<string>("")
  const prevMapRef = useRef<google.maps.Map | null>(null)

  useEffect(() => {
    if (!map) {
      return
    }

    // Create a stable key from event properties that affect the overlay
    const eventKey = `${event.id}-${event.location.lat}-${event.location.lng}-${event.radiusMeters}-${event.category}-${event.title}`
    
    // Check if map changed - if so, we need to recreate on the new map
    const mapChanged = prevMapRef.current !== map
    
    // Only recreate if the actual event data changed or map changed, not just the object reference
    // Check if marker exists and if circle exists (when radiusMeters > 0)
    const hasMarker = !!markerRef.current
    const shouldHaveCircle = event.radiusMeters && event.radiusMeters > 0
    const hasCircle = !!circleRef.current
    
    if (!mapChanged && prevEventDataRef.current === eventKey && hasMarker && (shouldHaveCircle === hasCircle)) {
      return
    }
    
    prevMapRef.current = map

    prevEventDataRef.current = eventKey

    let marker: google.maps.marker.AdvancedMarkerElement | null = null
    let circle: google.maps.Circle | null = null
    let circleClickListener: google.maps.MapsEventListener | null = null
    let markerClickListener: google.maps.MapsEventListener | null = null
    let isMounted = true

    const createOverlay = async () => {
      try {
        // Clean up existing overlays first
        if (markerRef.current) {
          markerRef.current.map = null
          markerRef.current = null
        }
        if (circleRef.current) {
          circleRef.current.setMap(null)
          circleRef.current = null
        }
        if (circleClickListenerRef.current) {
          circleClickListenerRef.current.remove()
          circleClickListenerRef.current = null
        }
        if (markerClickListenerRef.current) {
          markerClickListenerRef.current.remove()
          markerClickListenerRef.current = null
        }

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
          circleRef.current = circle
          circleClickListenerRef.current = circleClickListener
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
          markerRef.current = marker
          markerClickListenerRef.current = markerClickListener
        } else {
          marker = new mapsLibrary.Marker({
            map,
            position: event.location,
            title: event.title,
          }) as unknown as google.maps.marker.AdvancedMarkerElement

          markerClickListener = marker.addListener("click", () => {
            onSelect?.(event)
          })
          markerRef.current = marker
          markerClickListenerRef.current = markerClickListener
        }
      } catch (error) {
        console.error("Failed to render event marker:", error)
      }
    }

    createOverlay()

    return () => {
      isMounted = false
      if (markerRef.current) {
        markerRef.current.map = null
        markerRef.current = null
      }
      if (circleRef.current) {
        circleRef.current.setMap(null)
        circleRef.current = null
      }
      if (circleClickListenerRef.current) {
        circleClickListenerRef.current.remove()
        circleClickListenerRef.current = null
      }
      if (markerClickListenerRef.current) {
        markerClickListenerRef.current.remove()
        markerClickListenerRef.current = null
      }
    }
  }, [event.id, event.location.lat, event.location.lng, event.radiusMeters, event.category, event.title, map, onSelect])

  return null
}
