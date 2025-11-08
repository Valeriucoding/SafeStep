export type Category = "danger" | "blocked_path" | "protest" | "event" | "crime_alert"
export type Urgency = "low" | "medium" | "high"

export interface Location {
  lat: number
  lng: number
  address: string
  distance_km?: number
}

export interface ReportedBy {
  user_id: string
  trust_score: number
}

export interface Verification {
  confirmed_count: number
  last_confirmed: string
  is_active: boolean
}

export interface Incident {
  id: string
  category: Category
  urgency: Urgency
  location: Location
  description: string
  description_translated?: string
  image_url: string
  reported_at: string
  reported_by: ReportedBy
  verification: Verification
  ai_confidence: number
}

export interface DailySummary {
  date: string
  summary: {
    text: string
    high_priority_count: number
    medium_priority_count: number
    low_priority_count: number
  }
  safety_score: number
  top_incidents: Incident[]
  recommendations: string[]
}

export interface CreateIncidentData {
  image: File | null
  category: Category
  urgency: Urgency
  location: Location
  description?: string
}
