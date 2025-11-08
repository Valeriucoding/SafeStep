export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`,
    )
    const data = await response.json()

    if (data.results && data.results.length > 0) {
      return data.results[0].formatted_address
    }

    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`
  } catch (error) {
    console.error("Geocoding error:", error)
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`
  }
}
