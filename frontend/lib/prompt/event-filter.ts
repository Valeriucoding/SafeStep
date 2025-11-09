import type { Event } from "@/types"

export interface EventFilterOptions {
  categories?: Event["category"][]
  timeframeHours?: number
  activeOnly?: boolean
}

export function filterEvents(events: Event[], options: EventFilterOptions = {}): Event[] {
  const { categories, timeframeHours, activeOnly } = options
  const normalizedCategories = categories?.filter(Boolean)
  const cutoffTimestamp =
    typeof timeframeHours === "number" && timeframeHours > 0
      ? Date.now() - timeframeHours * 60 * 60 * 1000
      : null

  return events.filter((event) => {
    if (normalizedCategories && normalizedCategories.length > 0) {
      if (!normalizedCategories.includes(event.category)) {
        return false
      }
    }

    if (cutoffTimestamp) {
      const eventTimestamp = new Date(event.createdAt).getTime()
      if (Number.isNaN(eventTimestamp) || eventTimestamp < cutoffTimestamp) {
        return false
      }
    }

    if (activeOnly && !event.isActive) {
      return false
    }

    return true
  })
}

export function groupEventsByCategory(events: Event[]): Record<Event["category"], Event[]> {
  return events.reduce<Record<Event["category"], Event[]>>((accumulator, event) => {
    const existing = accumulator[event.category] ?? []
    accumulator[event.category] = [...existing, event]
    return accumulator
  }, {} as Record<Event["category"], Event[]>)
}

export function sortEventsByRecency(events: Event[]): Event[] {
  return [...events].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}

