import type { Event } from "@/types"
import type { Category } from "@/types"

export interface EventRow {
  id: string
  title: string
  description: string | null
  category: Category
  subcategory: string | null
  lat: number
  lng: number
  address: string | null
  created_at: string
  image_url: string | null
  verification_count: number | null
  is_active: boolean | null
  radius_meters: number | null
}

export const mapEventRowToEvent = (row: EventRow): Event => ({
  id: row.id,
  title: row.title,
  description: row.description ?? "",
  category: row.category,
  subcategory: (row.subcategory as Event["subcategory"]) ?? null,
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
})

