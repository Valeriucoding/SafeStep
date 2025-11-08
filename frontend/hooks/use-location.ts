"use client"

import { useState, useEffect } from "react"

interface LocationState {
  latitude: number | null
  longitude: number | null
  error: string | null
  loading: boolean
}

export function useLocation() {
  const [location, setLocation] = useState<LocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: true,
  })

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation({
        latitude: null,
        longitude: null,
        error: "Geolocation is not supported by your browser",
        loading: false,
      })
      return
    }

    const onSuccess = (position: GeolocationPosition) => {
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        error: null,
        loading: false,
      })
    }

    const onError = (error: GeolocationPositionError) => {
      let errorMessage = "Unable to retrieve your location"

      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = "Location permission denied. Please enable location services."
          break
        case error.POSITION_UNAVAILABLE:
          errorMessage = "Location information unavailable"
          break
        case error.TIMEOUT:
          errorMessage = "Location request timed out"
          break
      }

      setLocation({
        latitude: null,
        longitude: null,
        error: errorMessage,
        loading: false,
      })
    }

    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    })

    const watchId = navigator.geolocation.watchPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000,
    })

    return () => {
      navigator.geolocation.clearWatch(watchId)
    }
  }, [])

  return location
}
