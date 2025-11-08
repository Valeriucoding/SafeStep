export type Category = "danger" | "blocked-path" | "protest" | "event" | "crime-alert"

export interface Location {
  lat: number
  lng: number
}

export interface Incident {
  id: string
  title: string
  description: string
  category: Category
  location: Location
  address: string
  createdAt: Date
  userId: string
  imageUrl?: string
  verificationCount: number
  isActive: boolean
  radiusMeters?: number
}

export interface NewIncident {
  title: string
  description: string
  category: Category
  location: Location
  address: string
  userId: string
  imageUrl?: string
}
