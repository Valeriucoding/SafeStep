export interface Location {
  lat: number
  lng: number
}

export interface Incident {
  id: string
  title: string
  description: string
  category: string
  location: Location
  address: string
  createdAt: Date
  userId: string
  imageUrl?: string
  verificationCount: number
  isActive: boolean
}

export interface NewIncident {
  title: string
  description: string
  category: string
  location: Location
  address: string
  userId: string
  imageUrl?: string
}
