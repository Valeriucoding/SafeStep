"use client"

import { useCallback, useEffect, useMemo, useRef, useState, useId } from "react"
import type { KeyboardEvent } from "react"

import { Search, MapPin, X } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { useEventSearch } from "@/hooks/events/use-event-search"
import { cn } from "@/lib/utils"
import type { Event } from "@/types"

interface EventSearchProps {
  onSelect?: (event: Event) => void
  onExpandedChange?: (expanded: boolean) => void
}

export function EventSearch({ onSelect, onExpandedChange }: EventSearchProps) {
  const {
    query,
    setQuery,
    results,
    isLoading,
    error,
    isDropdownOpen,
    closeDropdown,
    clear,
  } = useEventSearch()

  const [activeIndex, setActiveIndex] = useState(0)

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const idBase = useId()
  const [isExpanded, setIsExpanded] = useState(false)

  const inputId = `${idBase}-input`
  const listboxId = `${idBase}-listbox`

  const hasFeedback = isLoading || !!error || results.length > 0
  const showDropdown = isDropdownOpen && hasFeedback
  const activeEventId = showDropdown && results[activeIndex] ? results[activeIndex].id : null
  const activeOptionId = activeEventId ? `${listboxId}-option-${activeEventId}` : undefined

  useEffect(() => {
    const nextLength = results.length
    if (nextLength >= 0) {
      setActiveIndex(0)
    }
  }, [results.length])

  const handleCollapse = useCallback(() => {
    inputRef.current?.blur()
    setIsExpanded(false)
    onExpandedChange?.(false)
    closeDropdown()
  }, [closeDropdown, onExpandedChange])

  const handleExpand = useCallback(() => {
    setIsExpanded(true)
    onExpandedChange?.(true)
    requestAnimationFrame(() => {
      inputRef.current?.focus()
    })
  }, [onExpandedChange])

  useEffect(() => {
    if (!isExpanded && !showDropdown) {
      return
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        handleCollapse()
      }
    }

    window.addEventListener("pointerdown", handlePointerDown, { capture: true })

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown, { capture: true })
    }
  }, [isExpanded, showDropdown, handleCollapse])

  const handleSelect = useCallback(
    (event: Event) => {
      onSelect?.(event)
      handleCollapse()
    },
    [onSelect, handleCollapse],
  )

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (!showDropdown) {
        return
      }

      if (event.key === "ArrowDown") {
        event.preventDefault()
        setActiveIndex((prev) => (prev + 1) % Math.max(results.length, 1))
      }

      if (event.key === "ArrowUp") {
        event.preventDefault()
        setActiveIndex((prev) => (prev - 1 + Math.max(results.length, 1)) % Math.max(results.length, 1))
      }

      if (event.key === "Enter") {
        event.preventDefault()
        const activeEvent = results[activeIndex]
        if (activeEvent) {
          handleSelect(activeEvent)
        }
      }

      if (event.key === "Escape") {
        handleCollapse()
      }
    },
    [showDropdown, results, activeIndex, handleSelect, handleCollapse],
  )

  const handleClear = useCallback(() => {
    clear()
    setActiveIndex(0)
    inputRef.current?.focus()
  }, [clear])

  const dropdownContent = useMemo(() => {
    if (isLoading) {
      return (
        <div className="flex items-center gap-3 px-3 py-4 text-sm text-muted-foreground">
          <Spinner className="size-4" />
          <span>Searching events…</span>
        </div>
      )
    }

    if (error) {
      return <p className="px-3 py-4 text-sm text-destructive">{error}</p>
    }

    if (results.length === 0) {
      return <p className="px-3 py-4 text-sm text-muted-foreground">No events found for that search.</p>
    }

    return (
      <div
        id={listboxId}
        role="listbox"
        aria-label="Event search results"
        className="flex max-h-80 flex-col overflow-y-auto"
      >
        {results.map((event, index) => {
          const isActive = index === activeIndex
          const optionId = `${listboxId}-option-${event.id}`
          return (
            <button
              key={event.id}
              id={optionId}
              type="button"
              role="option"
              aria-selected={isActive}
              onClick={() => handleSelect(event)}
              className={cn(
                "w-full rounded-lg px-3 py-3 text-left text-sm transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                "flex flex-col gap-1",
                isActive ? "bg-muted/80 text-foreground" : "hover:bg-muted",
              )}
            >
              <span className="text-sm font-medium">{event.title}</span>
              <span className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="size-3.5 text-muted-foreground" aria-hidden />
                <span className="line-clamp-1">{event.address || "No address provided"}</span>
              </span>
            </button>
          )
        })}
      </div>
    )
  }, [isLoading, error, results, activeIndex, handleSelect, listboxId])

  return (
    <div
      ref={containerRef}
      className={cn("relative flex h-full min-w-[2.75rem] flex-1 items-center justify-end")}
    >
      <label className="sr-only" htmlFor={inputId}>
        Search active events
      </label>

      <button
        type="button"
        onClick={handleExpand}
        aria-expanded={isExpanded}
        aria-controls={showDropdown ? listboxId : undefined}
        aria-label="Open event search"
        className={cn(
          "inline-flex h-11 w-11 items-center justify-center rounded-full border border-border/60 bg-background/80 text-muted-foreground shadow-sm transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0",
          "hover:text-foreground",
          isExpanded && "pointer-events-none opacity-0",
        )}
      >
        <Search className="size-5" aria-hidden />
      </button>

      <div
        className={cn(
          "absolute inset-y-0 left-0 right-0 z-50 flex origin-right items-center gap-2 overflow-hidden rounded-2xl border border-border bg-background/95 px-3 py-2 shadow-lg backdrop-blur transition-all duration-300 ease-out",
          isExpanded ? "pointer-events-auto scale-x-100 opacity-100" : "pointer-events-none scale-x-0 opacity-0",
        )}
        aria-hidden={!isExpanded}
      >
        <Search className="size-5 text-muted-foreground" aria-hidden />
        <Input
          ref={inputRef}
          id={inputId}
          type="search"
          inputMode="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          placeholder="Search active events"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
          aria-controls={showDropdown ? listboxId : undefined}
          aria-activedescendant={activeOptionId}
          aria-busy={isLoading}
          tabIndex={isExpanded ? 0 : -1}
          className="flex-1 border-0 bg-transparent text-base leading-tight text-foreground shadow-none placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>

      {showDropdown && (
        <div
          className={cn(
            "absolute left-0 right-0 top-full z-40 mt-2 origin-top rounded-2xl border border-border bg-background/98 backdrop-blur",
            "shadow-lg ring-1 ring-border/40",
          )}
        >
          {dropdownContent}
        </div>
      )}
    </div>
  )
}


