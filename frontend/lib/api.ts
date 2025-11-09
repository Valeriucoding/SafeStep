"use server"

import { getSupabaseServerClient } from "@/lib/supabase-server"
import { mapEventRowToEvent, type EventRow } from "@/lib/event-transformer"
import type { Event, EventStatus, NewEvent } from "@/types"
import { applyEventStatusUpdate } from "@/lib/reporting-service"

export async function getAllEvents(): Promise<Event[]> {
  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[api] Failed to load events:", error)
    throw new Error(error.message)
  }

  const rows = (data ?? []) as EventRow[]
  return rows.map((row) => mapEventRowToEvent(row))
}

export async function getEventById(id: string): Promise<Event | null> {
  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase.from("events").select("*").eq("id", id).maybeSingle()

  if (error) {
    console.error(`[api] Failed to load event ${id}:`, error)
    throw new Error(error.message)
  }

  if (!data) {
    return null
  }

  return mapEventRowToEvent(data as EventRow)
}

export async function createEvent(event: NewEvent): Promise<Event> {
  const supabase = getSupabaseServerClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    console.error("[api] Failed to read authenticated user when creating event:", userError)
    throw new Error("You must be signed in to submit a report.")
  }

  const newId =
    typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Date.now().toString()

  const insertPayload = {
    id: newId,
    title: event.title,
    description: event.description ?? "",
    category: event.category,
    lat: event.location.lat,
    lng: event.location.lng,
    address: event.address,
    created_at: new Date().toISOString(),
    image_url: event.imageUrl ?? null,
    verification_count: 0,
    is_active: true,
    radius_meters: event.radiusMeters ?? null,
    reporter_id: user.id,
    status: "pending",
  }

  const { data, error } = await supabase.from("events").insert(insertPayload).select("*").single()

  if (error) {
    console.error("[api] Failed to create event:", error)
    throw new Error(error.message)
  }

  return mapEventRowToEvent(data as EventRow)
}

export async function verifyEvent(id: string): Promise<void> {
  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase
    .from("events")
    .select("verification_count")
    .eq("id", id)
    .maybeSingle()

  if (error) {
    console.error("[api] Failed to read verification count:", error)
    throw new Error(error.message)
  }

  if (!data) {
    throw new Error("Event not found")
  }

  const currentCount = ((data as Pick<EventRow, "verification_count">).verification_count ?? 0) + 1
  const { error: updateError } = await supabase
    .from("events")
    .update({ verification_count: currentCount })
    .eq("id", id)

  if (updateError) {
    console.error("[api] Failed to update verification count:", updateError)
    throw new Error(updateError.message)
  }
}

export async function updateEventStatus(eventId: string, status: EventStatus): Promise<Event> {
  const supabase = getSupabaseServerClient()
  const updatedEvent = await applyEventStatusUpdate(supabase, eventId, status)
  return mapEventRowToEvent(updatedEvent)
}
