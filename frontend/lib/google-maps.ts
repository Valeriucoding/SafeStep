import { importLibrary, setOptions, type APIOptions } from "@googlemaps/js-api-loader"

let isConfigured = false

function ensureConfigured(options?: Partial<APIOptions>) {
  if (isConfigured) {
    return
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    throw new Error("Google Maps API key is missing. Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.")
  }

  setOptions({
    key: apiKey,
    v: "weekly",
    ...options,
  })

  isConfigured = true
}

export async function importMapsLibrary(options?: Partial<APIOptions>) {
  ensureConfigured(options)
  return (await importLibrary("maps")) as google.maps.MapsLibrary
}

export async function importMarkerLibrary(options?: Partial<APIOptions>) {
  ensureConfigured(options)
  return (await importLibrary("marker")) as google.maps.MarkerLibrary
}

