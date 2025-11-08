"use client"

import { useEffect, useState } from "react"
import type { Incident } from "@/types"
import type { google } from "googlemaps"

interface IncidentMarkerProps {
  incident: Incident
}

export function IncidentMarker({ incident }: IncidentMarkerProps) {
  const [marker, setMarker] = useState<google.maps.Marker | null>(null)

  useEffect(() => {
    // This component will be enhanced later to actually create markers
    // For now, it's a placeholder structure
    console.log("Incident marker:", incident)
  }, [incident])

  return null
}
