export type Category = "danger" | "blocked-path" | "protest" | "event" | "crime-alert"

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

export interface NewEvent {
  title: string
  description: string
  category: Category
  location: Location
  address: string
  imageUrl?: string
}
