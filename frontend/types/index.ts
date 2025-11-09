export type Category = "danger" | "blocked-path" | "event" | "protest" | "crime-alert"

export interface Location {
  lat: number
  lng: number
}

export interface Event {
  id: string
  title: string
  description: string
  category: Category
  location: Location
  address: string
  createdAt: string
  imageUrl?: string
  verificationCount: number
  isActive: boolean
  radiusMeters?: number
}

export interface EventMessage {
  id: string
  eventId: string
  userId: string | null
  userEmail: string | null
  content: string
  createdAt: string
}

export interface NewEvent {
  title: string
  description: string
  category: Category
  location: Location
  address: string
  imageUrl?: string
  radiusMeters?: number
}

export type SafetyAdvisorRequestType =
  | "SPECIFIC_ADDRESS_QUERY"
  | "BROAD_AREA_SAFETY_GUIDANCE"
  | "EVENT_PLANNING"
  | "ROUTE_SAFETY_CHECK"

export interface SafetyAdvisorRequestPayload {
  requestType: SafetyAdvisorRequestType
  userQuery: string
  areaName?: string
  timeframeMonths?: number | null
  coordinates?: Location | null
}
