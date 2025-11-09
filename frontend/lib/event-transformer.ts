import type { Event, EventStatus } from "@/types"
import type { Category } from "@/types"

export interface EventRow {
  id: string
  title: string
  description: string | null
  category: Category
  lat: number
  lng: number
  address: string | null
  created_at: string
  image_url: string | null
  verification_count: number | null
  is_active: boolean | null
  radius_meters: number | null
  status: EventStatus | null
  reporter_id: string | null
}

export const mapEventRowToEvent = (row: EventRow): Event => ({
  id: row.id,
  title: row.title,
  description: row.description ?? "",
  category: row.category,
  location: {
    lat: row.lat,
    lng: row.lng,
  },
  address: row.address ?? "",
  createdAt: row.created_at,
  imageUrl: row.image_url ?? undefined,
  verificationCount: row.verification_count ?? 0,
  isActive: row.is_active ?? true,
  radiusMeters: row.radius_meters ?? undefined,
  status: (row.status ?? "pending") as EventStatus,
  reporterId: row.reporter_id ?? null,
})

