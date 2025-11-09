"use client"

import { useState, useCallback } from "react"
import type { Location } from "@/types"

export function useUserLocation() {
  const [location, setLocation] = useState<Location | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [accuracy, setAccuracy] = useState<number | null>(null)

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
        setAccuracy(Number.isFinite(position.coords.accuracy) ? position.coords.accuracy : null)
        setIsLoading(false)
      },
      (error) => {
        setError("Unable to retrieve your location")
        setIsLoading(false)
        setAccuracy(null)
        console.error("Geolocation error:", error)
      },
    )
  }, [])

  return { location, accuracy, error, isLoading, requestLocation }
}
