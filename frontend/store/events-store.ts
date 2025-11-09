"use client"

import { create } from "zustand"
import type { Event } from "@/types"
import { supabase } from "@/lib/supabase-client"
import { mapEventRowToEvent, type EventRow } from "@/lib/event-transformer"
import type { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js"

type SubscribeStatus = Parameters<RealtimeChannel["subscribe"]>[0] extends (status: infer T) => unknown ? T : string

interface EventsState {
  events: Event[]
  isLoading: boolean
  error: string | null
  hasRealtimeSubscription: boolean
  fetchEvents: () => Promise<void>
  subscribeToRealtime: () => Promise<void>
  unsubscribeFromRealtime: () => Promise<void>
  upsertEvent: (event: Event) => void
  removeEvent: (id: string) => void
  verifyEvent: (id: string) => Promise<void>
}

let eventsChannel: RealtimeChannel | null = null
let retryTimeout: ReturnType<typeof setTimeout> | null = null
let retryAttempt = 0
let shouldRetry = false

const BASE_RETRY_DELAY_MS = 1000
const MAX_RETRY_DELAY_MS = 30000

export const useEventsStore = create<EventsState>((set, get) => ({
  events: [],
  isLoading: false,
  error: null,
  hasRealtimeSubscription: false,
  async fetchEvents() {
    set({ isLoading: true, error: null })
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[events-store] Failed to fetch events:", error)
      set({ error: error.message, isLoading: false })
      return
    }

    const rows = (data ?? []) as EventRow[]
    const events = rows.map((row) => mapEventRowToEvent(row))
    set({ events, isLoading: false })
  },
  async subscribeToRealtime() {
    const clearRetryTimer = () => {
      if (retryTimeout) {
        clearTimeout(retryTimeout)
        retryTimeout = null
      }
    }

    const scheduleRetry = () => {
      if (!shouldRetry) {
        return
      }

      const delay = Math.min(MAX_RETRY_DELAY_MS, BASE_RETRY_DELAY_MS * 2 ** retryAttempt)
      retryAttempt += 1

      clearRetryTimer()
      retryTimeout = setTimeout(() => {
        retryTimeout = null

        if (!shouldRetry || eventsChannel) {
          return
        }

        initializeChannel()
      }, delay)
    }

    const teardownChannel = async () => {
      if (!eventsChannel) {
        return
      }

      const channel = eventsChannel
      eventsChannel = null
      try {
        await channel.unsubscribe()
      } catch (error) {
        console.warn("[events-store] Failed to unsubscribe from realtime channel during teardown", error)
      }
    }

    const initializeChannel = () => {
      if (eventsChannel) {
        return
      }

      const channel = supabase
        .channel("events-feed")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "events" },
          (payload: RealtimePostgresChangesPayload<EventRow>) => {
            const event = mapEventRowToEvent(payload.new as EventRow)
            get().upsertEvent(event)
          },
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "events" },
          (payload: RealtimePostgresChangesPayload<EventRow>) => {
            const event = mapEventRowToEvent(payload.new as EventRow)
            get().upsertEvent(event)
          },
        )
        .on(
          "postgres_changes",
          { event: "DELETE", schema: "public", table: "events" },
          (payload: RealtimePostgresChangesPayload<EventRow>) => {
            const id = (payload.old as Partial<EventRow> | null)?.id
            if (id) {
              get().removeEvent(id)
            }
          },
        )

      channel.subscribe((status: SubscribeStatus) => {
        if (status === "SUBSCRIBED") {
          retryAttempt = 0
          clearRetryTimer()
          set({ hasRealtimeSubscription: true })
          return
        }

        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          console.warn(`[events-store] Realtime channel status: ${status}`)
          set({ hasRealtimeSubscription: false })
          void teardownChannel()
          scheduleRetry()
          return
        }

        if (status === "CLOSED") {
          set({ hasRealtimeSubscription: false })
          void teardownChannel()

          if (shouldRetry) {
            scheduleRetry()
          }
        }
      })

      eventsChannel = channel
    }

    if (get().hasRealtimeSubscription) {
      return
    }

    if (eventsChannel) {
      shouldRetry = true
      return
    }

    shouldRetry = true
    retryAttempt = 0
    initializeChannel()
  },
  async unsubscribeFromRealtime() {
    const clearRetryTimer = () => {
      if (retryTimeout) {
        clearTimeout(retryTimeout)
        retryTimeout = null
      }
    }

    const teardownChannel = async () => {
      if (!eventsChannel) {
        return
      }

      const channel = eventsChannel
      eventsChannel = null
      try {
        await channel.unsubscribe()
      } catch (error) {
        console.warn("[events-store] Failed to unsubscribe from realtime channel", error)
      }
    }

    if (!eventsChannel) {
      shouldRetry = false
      clearRetryTimer()
      return
    }

    shouldRetry = false
    retryAttempt = 0
    clearRetryTimer()
    await teardownChannel()
    set({ hasRealtimeSubscription: false })
  },
  upsertEvent(event) {
    set((state) => {
      const index = state.events.findIndex((existing) => existing.id === event.id)
      if (index === -1) {
        const events = [event, ...state.events]
        events.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        return { events }
      }

      const events = [...state.events]
      events[index] = event
      events.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      return { events }
    })
  },
  removeEvent(id) {
    set((state) => ({
      events: state.events.filter((event) => event.id !== id),
    }))
  },
  async verifyEvent(id) {
    const currentEvent = get().events.find((event) => event.id === id)
    const nextCount = (currentEvent?.verificationCount ?? 0) + 1

    if (!currentEvent) {
      return
    }

    set({ error: null })

    set((state) => ({
      events: state.events.map((event) =>
        event.id === id ? { ...event, verificationCount: nextCount } : event,
      ),
    }))

    const { error } = await supabase
      .from("events")
      .update({ verification_count: nextCount })
      .eq("id", id)

    if (error) {
      console.error("[events-store] Failed to verify event:", error)
      set((state) => ({
        events: state.events.map((event) =>
          event.id === id ? { ...event, verificationCount: nextCount - 1 } : event,
        ),
        error: "Failed to verify event. Please try again.",
      }))
    }
  },
}))

