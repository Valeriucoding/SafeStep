"use client"

import { useState, useCallback } from "react"
import type { Location } from "@/types"

export function useUserLocation() {
  const [location, setLocation] = useState<Location | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser")
      return
    }

    setIsLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
        setIsLoading(false)
      },
      (error) => {
        setError("Unable to retrieve your location")
        setIsLoading(false)
        console.error("Geolocation error:", error)
      },
    )
  }, [])

  return { location, error, isLoading, requestLocation }
}
