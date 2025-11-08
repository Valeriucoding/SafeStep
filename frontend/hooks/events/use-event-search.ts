import { useCallback, useEffect, useRef, useState } from "react"

import { supabase } from "@/lib/supabase-client"
import { mapEventRowToEvent, type EventRow } from "@/lib/event-transformer"
import type { Event } from "@/types"

interface UseEventSearchOptions {
  debounceMs?: number
  maxResults?: number
}

interface UseEventSearchReturn {
  query: string
  setQuery: (value: string) => void
  results: Event[]
  isLoading: boolean
  error: string | null
  isDropdownOpen: boolean
  clear: () => void
  closeDropdown: () => void
}

const DEFAULT_DEBOUNCE = 300
const DEFAULT_MAX_RESULTS = 8

export function useEventSearch(options: UseEventSearchOptions = {}): UseEventSearchReturn {
  const { debounceMs = DEFAULT_DEBOUNCE, maxResults = DEFAULT_MAX_RESULTS } = options

  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const activeRequestId = useRef(0)

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    const trimmedQuery = query.trim()

    if (!trimmedQuery) {
      setResults([])
      setIsLoading(false)
      setError(null)
      setIsDropdownOpen(false)
      return
    }

    setIsLoading(true)
    setError(null)

    debounceTimerRef.current = setTimeout(async () => {
      const currentRequestId = ++activeRequestId.current

      try {
        const wildcardQuery = `%${trimmedQuery.replace(/\s+/g, "%")}%`
        const { data, error: fetchError } = await supabase
          .from("events")
          .select("*")
          .or(
            [
              `title.ilike.${wildcardQuery}`,
              `description.ilike.${wildcardQuery}`,
              `address.ilike.${wildcardQuery}`,
            ].join(","),
          )
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(maxResults)

        if (activeRequestId.current !== currentRequestId) {
          return
        }

        if (fetchError) {
          console.error("[use-event-search] Failed to search events:", fetchError)
          setError("We couldn't complete the search. Please try again.")
          setResults([])
          setIsDropdownOpen(true)
          return
        }

        const rows = (data ?? []) as EventRow[]
        const mapped = rows.map((row) => mapEventRowToEvent(row))

        setResults(mapped)
        setIsDropdownOpen(true)
      } catch (caughtError) {
        if (activeRequestId.current !== currentRequestId) {
          return
        }

        console.error("[use-event-search] Unexpected error:", caughtError)
        setError("Something went wrong. Please try again.")
        setResults([])
        setIsDropdownOpen(true)
      } finally {
        if (activeRequestId.current === currentRequestId) {
          setIsLoading(false)
        }
      }
    }, debounceMs)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
        debounceTimerRef.current = null
      }
    }
  }, [query, debounceMs, maxResults])

  const clear = useCallback(() => {
    setQuery("")
    setResults([])
    setError(null)
    setIsDropdownOpen(false)
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }
  }, [])

  const closeDropdown = useCallback(() => {
    setIsDropdownOpen(false)
  }, [])

  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
    isDropdownOpen,
    clear,
    closeDropdown,
  }
}


