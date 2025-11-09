import type { Event, Location } from "@/types"

const EARTH_RADIUS_METERS = 6371000

function toRadians(value: number) {
  return (value * Math.PI) / 180
}

export function getDistanceMeters(a: Location, b: Location): number {
  const dLat = toRadians(b.lat - a.lat)
  const dLng = toRadians(b.lng - a.lng)
  const lat1 = toRadians(a.lat)
  const lat2 = toRadians(b.lat)

  const sinDLat = Math.sin(dLat / 2)
  const sinDLng = Math.sin(dLng / 2)

  const haversine =
    sinDLat * sinDLat + sinDLng * sinDLng * Math.cos(lat1) * Math.cos(lat2)

  const c = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))

  return EARTH_RADIUS_METERS * c
}

export interface PickpocketCluster {
  id: string
  center: Location
  radiusMeters: number
  events: Event[]
}

interface PickpocketClusterOptions {
  proximityMeters: number
  minimumEvents: number
  lookbackHours: number
}

const DEFAULT_CLUSTER_OPTIONS: PickpocketClusterOptions = {
  proximityMeters: 500,
  minimumEvents: 3,
  lookbackHours: 24,
}

export function derivePickpocketClusters(
  events: Event[],
  options: Partial<PickpocketClusterOptions> = {},
): PickpocketCluster[] {
  const { proximityMeters, minimumEvents, lookbackHours } = {
    ...DEFAULT_CLUSTER_OPTIONS,
    ...options,
  }

  const cutoffTime = Date.now() - lookbackHours * 60 * 60 * 1000

  const recentReports = events.filter((event) => {
    if (event.category !== "crime-alert" || event.subcategory !== "pickpockets") {
      return false
    }

    const eventTime = new Date(event.createdAt).getTime()
    return !Number.isNaN(eventTime) && eventTime >= cutoffTime
  })

  if (recentReports.length === 0) {
    return []
  }

  const visited = new Set<string>()
  const clusters: PickpocketCluster[] = []

  const findNeighbors = (target: Event) =>
    recentReports.filter(
      (candidate) =>
        candidate.id !== target.id &&
        getDistanceMeters(candidate.location, target.location) <= proximityMeters,
    )

  for (const report of recentReports) {
    if (visited.has(report.id)) {
      continue
    }

    visited.add(report.id)

    const neighbors = findNeighbors(report)

    if (neighbors.length + 1 < minimumEvents) {
      continue
    }

    const clusterMembers = new Set<Event>([report, ...neighbors])

    const queue = [...neighbors]

    while (queue.length > 0) {
      const neighbor = queue.pop()
      if (!neighbor || visited.has(neighbor.id)) {
        continue
      }

      visited.add(neighbor.id)

      const neighborNeighbors = findNeighbors(neighbor)

      if (neighborNeighbors.length + 1 >= minimumEvents) {
        for (const next of neighborNeighbors) {
          if (!clusterMembers.has(next)) {
            clusterMembers.add(next)
            queue.push(next)
          }
        }
      }
    }

    if (clusterMembers.size < minimumEvents) {
      continue
    }

    const members = Array.from(clusterMembers)
    const center = computeAverageLocation(members.map((member) => member.location))
    const radiusMeters = computeCoverRadius(center, members)

    const clusterId = members
      .map((member) => member.id)
      .sort()
      .join("|")

    clusters.push({
      id: clusterId,
      center,
      radiusMeters,
      events: members,
    })
  }

  return clusters
}

function computeAverageLocation(locations: Location[]): Location {
  const total = locations.reduce(
    (acc, location) => {
      acc.lat += location.lat
      acc.lng += location.lng
      return acc
    },
    { lat: 0, lng: 0 },
  )

  return {
    lat: total.lat / locations.length,
    lng: total.lng / locations.length,
  }
}

function computeCoverRadius(center: Location, events: Event[]): number {
  const maxDistance = events.reduce((max, event) => {
    const distance = getDistanceMeters(center, event.location)
    return Math.max(max, distance)
  }, 0)

  const safetyPadding = Math.min(Math.max(maxDistance * 0.2, 75), 250)

  return Math.max(maxDistance + safetyPadding, 200)
}

