"use client"

import { useEffect, useMemo, useRef } from "react"
import { CATEGORY_COLORS } from "@/lib/constants"
import type { PickpocketCluster } from "@/lib/utils/geospatial"
import { importMarkerLibrary } from "@/lib/google-maps"

interface PickpocketClusterOverlayProps {
  cluster: PickpocketCluster
  map?: google.maps.Map
}

export function PickpocketClusterOverlay({ cluster, map }: PickpocketClusterOverlayProps) {
  const circleRef = useRef<google.maps.Circle | null>(null)
  const advancedMarkerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null)
  const markerRef = useRef<google.maps.Marker | null>(null)

  const clusterSignature = useMemo(
    () => ({
      center: { lat: cluster.center.lat, lng: cluster.center.lng },
      radiusMeters: cluster.radiusMeters,
      count: cluster.events.length,
    }),
    [cluster],
  )

  useEffect(() => {
    if (!map) {
      return
    }

    let isMounted = true

    const cleanup = () => {
      if (circleRef.current) {
        circleRef.current.setMap(null)
        circleRef.current = null
      }
      if (advancedMarkerRef.current) {
        advancedMarkerRef.current.map = null
        advancedMarkerRef.current = null
      }
      if (markerRef.current) {
        markerRef.current.setMap(null)
        markerRef.current = null
      }
    }

    const renderOverlay = async () => {
      if (!isMounted) {
        return
      }

      cleanup()

      const markerLibrary = await importMarkerLibrary()
      const AdvancedMarkerElement = markerLibrary.AdvancedMarkerElement
      const highlightColor = CATEGORY_COLORS["crime-alert"] ?? "#ef4444"

      const circle = new google.maps.Circle({
        map,
        center: clusterSignature.center,
        radius: clusterSignature.radiusMeters,
        strokeColor: highlightColor,
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: highlightColor,
        fillOpacity: 0.18,
        zIndex: 5,
      })

      circleRef.current = circle

      const labelContent = createOverlayLabel(clusterSignature.count)

      if (AdvancedMarkerElement) {
        const marker = new AdvancedMarkerElement({
          map,
          position: clusterSignature.center,
          content: labelContent,
          zIndex: 6,
        })

        advancedMarkerRef.current = marker
      } else {
        const fallbackMarker = new google.maps.Marker({
          map,
          position: clusterSignature.center,
          label: {
            text: `⚠️ ${clusterSignature.count}`,
            color: "#1f2937",
            fontSize: "14px",
            fontWeight: "600",
          },
          zIndex: 6,
        })

        markerRef.current = fallbackMarker
      }
    }

    renderOverlay().catch((error) => {
      console.error("Failed to render pickpocket hotspot overlay:", error)
    })

    return () => {
      isMounted = false
      cleanup()
    }
  }, [clusterSignature, map])

  return null
}

function createOverlayLabel(count: number) {
  const element = document.createElement("div")
  element.style.display = "flex"
  element.style.flexDirection = "column"
  element.style.alignItems = "center"
  element.style.justifyContent = "center"
  element.style.padding = "2px 6px"
  element.style.borderRadius = "999px"
  element.style.backgroundColor = "rgba(255, 255, 255, 0.92)"
  element.style.boxShadow = "0 6px 14px rgba(15, 23, 42, 0.2)"
  element.style.fontFamily = "inherit"
  element.style.fontSize = "11px"
  element.style.fontWeight = "600"
  element.style.color = "#b91c1c"
  element.style.pointerEvents = "none"
  element.textContent = `⚠️ ${count} pickpockets reported in last 24h`
  return element
}

