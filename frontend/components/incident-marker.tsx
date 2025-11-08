"use client"

import { useEffect } from "react"
import type { Incident } from "@/types"
import { CATEGORY_COLORS, CATEGORY_ICONS, CATEGORY_LABELS } from "@/lib/constants"
import { importMapsLibrary, importMarkerLibrary } from "@/lib/google-maps"

interface IncidentMarkerProps {
  incident: Incident
  map?: google.maps.Map
}

export function IncidentMarker({ incident, map }: IncidentMarkerProps) {
  useEffect(() => {
    if (!map) {
      return
    }

    let marker: google.maps.marker.AdvancedMarkerElement | null = null
    let circle: google.maps.Circle | null = null
    let infoWindow: google.maps.InfoWindow | null = null
    let circleClickListener: google.maps.MapsEventListener | null = null
    let markerClickListener: google.maps.MapsEventListener | null = null
    let isMounted = true

    const createOverlay = async () => {
      try {
        const mapsLibrary = await importMapsLibrary()
        const { InfoWindow } = mapsLibrary

        let AdvancedMarkerElement: typeof google.maps.marker.AdvancedMarkerElement | undefined
        if (!incident.radiusMeters || incident.radiusMeters <= 0) {
          const markerLibrary = await importMarkerLibrary()
          AdvancedMarkerElement = markerLibrary.AdvancedMarkerElement
        }

        if (!isMounted) {
          return
        }

        const content = document.createElement("div")
        content.style.minWidth = "200px"
        content.style.fontFamily = "Inter, system-ui, sans-serif"
        content.style.display = "flex"
        content.style.flexDirection = "column"
        content.style.gap = "4px"

        const titleEl = document.createElement("h3")
        titleEl.style.margin = "0"
        titleEl.style.fontSize = "14px"
        titleEl.style.fontWeight = "600"
        titleEl.style.color = "#0f172a"
        titleEl.textContent = incident.title

        const categoryEl = document.createElement("span")
        categoryEl.style.fontSize = "12px"
        categoryEl.style.color = "#475569"
        categoryEl.textContent =
          CATEGORY_LABELS[incident.category as keyof typeof CATEGORY_LABELS] ?? incident.category

        const addressEl = document.createElement("p")
        addressEl.style.margin = "0"
        addressEl.style.fontSize = "12px"
        addressEl.style.color = "#475569"
        addressEl.textContent = incident.address

        content.appendChild(titleEl)
        content.appendChild(categoryEl)
        content.appendChild(addressEl)

        if (incident.radiusMeters && incident.radiusMeters > 0) {
          const radiusEl = document.createElement("span")
          radiusEl.style.fontSize = "12px"
          radiusEl.style.color = "#64748b"
          radiusEl.textContent = `Impact radius: ${Math.round(incident.radiusMeters)} m`
          content.appendChild(radiusEl)
        }

        infoWindow = new InfoWindow({
          content,
          ariaLabel: incident.title,
        })

        if (incident.radiusMeters && incident.radiusMeters > 0) {
          const color =
            CATEGORY_COLORS[incident.category as keyof typeof CATEGORY_COLORS] ?? "rgba(15, 23, 42, 1)"

          const circleConfig: google.maps.CircleOptions = {
            map,
            center: incident.location,
            radius: incident.radiusMeters,
            strokeColor: color,
            strokeOpacity: 0.65,
            strokeWeight: 2,
            fillColor: color,
            fillOpacity: 0.2,
          }

          circle = new google.maps.Circle(circleConfig)
          circleClickListener = circle.addListener("click", () => {
            if (!infoWindow) {
              return
            }

            infoWindow.setPosition(incident.location)
            infoWindow.open({
              map,
              position: incident.location,
            })
          })
        } else if (AdvancedMarkerElement) {
          const iconWrapper = document.createElement("div")
          iconWrapper.style.width = "40px"
          iconWrapper.style.height = "40px"
          iconWrapper.style.borderRadius = "50%"
          iconWrapper.style.display = "flex"
          iconWrapper.style.alignItems = "center"
          iconWrapper.style.justifyContent = "center"
          iconWrapper.style.color = "#0f172a"
          iconWrapper.style.fontSize = "20px"
          iconWrapper.style.fontWeight = "600"
          iconWrapper.style.boxShadow = "0 8px 16px rgba(15, 23, 42, 0.25)"
          iconWrapper.style.backgroundColor =
            CATEGORY_COLORS[incident.category as keyof typeof CATEGORY_COLORS] ?? "#fde68a"
          iconWrapper.textContent =
            CATEGORY_ICONS[incident.category as keyof typeof CATEGORY_ICONS] ?? "📍"

          marker = new AdvancedMarkerElement({
            map,
            position: incident.location,
            title: incident.title,
            content: iconWrapper,
          })

          markerClickListener = marker.addListener("click", () => {
            if (!infoWindow || !marker) {
              return
            }
            infoWindow.open({
              anchor: marker,
              map,
            })
          })
        }
      } catch (error) {
        console.error("Failed to render incident marker:", error)
      }
    }

    createOverlay()

    return () => {
      isMounted = false
      if (infoWindow) {
        infoWindow.close()
      }
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
  }, [incident, map])

  return null
}
