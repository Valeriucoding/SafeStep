"use client"

import { useEffect, useRef } from "react"
import type { Location } from "@/types"
import { importMarkerLibrary } from "@/lib/google-maps"

interface UserLocationMarkerProps {
  location: Location
  accuracy?: number | null
  map?: google.maps.Map
}

const MIN_ACCURACY_RADIUS = 25

export function UserLocationMarker({ map, location, accuracy }: UserLocationMarkerProps) {
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | google.maps.Marker | null>(null)
  const circleRef = useRef<google.maps.Circle | null>(null)
  const markerElementRef = useRef<HTMLDivElement | null>(null)
  const latestLocationRef = useRef<Location>(location)
  const zoomListenerRef = useRef<google.maps.MapsEventListener | null>(null)

  useEffect(() => {
    latestLocationRef.current = location
  }, [location])

  useEffect(() => {
    if (!map) {
      return
    }

    let isMounted = true

    const renderMarker = async () => {
      try {
        const { AdvancedMarkerElement } = await importMarkerLibrary()

        if (!isMounted) {
          return
        }

        if (!markerElementRef.current) {
          const wrapper = document.createElement("div")
          wrapper.setAttribute("aria-hidden", "true")
          wrapper.style.width = "32px"
          wrapper.style.height = "32px"
          wrapper.style.borderRadius = "9999px"
          wrapper.style.background = "rgba(59, 130, 246, 0.25)"
          wrapper.style.display = "flex"
          wrapper.style.alignItems = "center"
          wrapper.style.justifyContent = "center"
          wrapper.style.pointerEvents = "none"

          const innerDot = document.createElement("div")
          innerDot.style.width = "16px"
          innerDot.style.height = "16px"
          innerDot.style.borderRadius = "9999px"
          innerDot.style.background = "#2563EB"
          innerDot.style.boxShadow = "0 0 0 4px rgba(59, 130, 246, 0.35)"
          innerDot.style.border = "2px solid #EFF6FF"

          wrapper.appendChild(innerDot)
          markerElementRef.current = wrapper
        }

        const targetLocation = latestLocationRef.current

        if (AdvancedMarkerElement) {
          markerRef.current = new AdvancedMarkerElement({
            map,
            position: targetLocation,
            content: markerElementRef.current,
            zIndex: 1000,
          })
        } else {
          markerRef.current = new google.maps.Marker({
            map,
            position: targetLocation,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#2563EB",
              fillOpacity: 1,
              strokeWeight: 4,
              strokeColor: "rgba(59, 130, 246, 0.35)",
            },
            zIndex: 1000,
          })
        }
      } catch (error) {
        console.error("Failed to render user location marker:", error)
      }
    }

    renderMarker()

    return () => {
      isMounted = false
      if (markerRef.current) {
        if ("map" in markerRef.current) {
          markerRef.current.map = null
        } else if ("setMap" in markerRef.current) {
          markerRef.current.setMap(null)
        }
        markerRef.current = null
      }
      if (circleRef.current) {
        circleRef.current.setMap(null)
        circleRef.current = null
      }
      if (zoomListenerRef.current) {
        zoomListenerRef.current.remove()
        zoomListenerRef.current = null
      }
    }
  }, [map])

  useEffect(() => {
    const marker = markerRef.current
    if (!marker) {
      return
    }

    if ("position" in marker) {
      marker.position = location
    } else if ("setPosition" in marker) {
      marker.setPosition(location)
    }
  }, [location])

  useEffect(() => {
    if (!map || !markerElementRef.current) {
      return
    }

    const element = markerElementRef.current

    const updateScale = () => {
      if (!map) {
        return
      }
      const zoom = map.getZoom() ?? 0
      const minScale = 0.45
      const maxScale = 1

      if (zoom >= 16) {
        element.style.transform = "scale(1)"
        return
      }

      if (zoom <= 10) {
        element.style.transform = `scale(${minScale})`
        return
      }

      const normalized = (zoom - 10) / (16 - 10)
      const scale = minScale + (maxScale - minScale) * normalized
      element.style.transform = `scale(${scale})`
    }

    updateScale()
    zoomListenerRef.current = map.addListener("zoom_changed", updateScale)

    return () => {
      if (zoomListenerRef.current) {
        zoomListenerRef.current.remove()
        zoomListenerRef.current = null
      }
    }
  }, [map])

  useEffect(() => {
    if (!map) {
      return
    }

    if (!accuracy || accuracy <= 0) {
      if (circleRef.current) {
        circleRef.current.setMap(null)
        circleRef.current = null
      }
      return
    }

    const radius = Math.max(accuracy, MIN_ACCURACY_RADIUS)

    if (!circleRef.current) {
      circleRef.current = new google.maps.Circle({
        map,
        center: location,
        radius,
        strokeColor: "rgba(37, 99, 235, 0.6)",
        strokeOpacity: 0.8,
        strokeWeight: 1,
        fillColor: "rgba(59, 130, 246, 0.2)",
        fillOpacity: 0.35,
        clickable: false,
      })
    } else {
      circleRef.current.setMap(map)
      circleRef.current.setRadius(radius)
      circleRef.current.setCenter(location)
    }
  }, [map, location, accuracy])

  return null
}

