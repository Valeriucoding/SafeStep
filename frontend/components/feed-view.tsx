"use client"

import { EventCard } from "@/components/event-card"
import type { Category, Event } from "@/types"
import { CATEGORY_COLORS, CATEGORY_ICONS, CATEGORY_LABELS, CATEGORIES } from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { CSSProperties } from "react"

interface FeedViewProps {
  events: Event[]
  selectedCategory: Category | null
  onCategoryChange: (category: Category | null) => void
}

export function FeedView({ events, selectedCategory, onCategoryChange }: FeedViewProps) {
  return (
    <div className="h-full overflow-y-auto bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-4 py-3 space-y-3">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold">Event Feed</h1>
            <p className="text-sm text-muted-foreground">
              {events.length} active {events.length === 1 ? "event" : "events"}
            </p>
          </div>
          <div className="flex flex-wrap items-start gap-2">
            <CategoryPill
              label="All"
              onClick={() => onCategoryChange(null)}
              active={!selectedCategory}
            />
            {CATEGORIES.map((category) => (
              <CategoryPill
                key={category}
                label={CATEGORY_LABELS[category]}
                icon={CATEGORY_ICONS[category]}
                onClick={() => onCategoryChange(category)}
                active={selectedCategory === category}
                accent={CATEGORY_COLORS[category]}
              />
            ))}
          </div>
        </div>
      </header>

      {/* Feed Content */}
      <div className="p-4 space-y-4">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">No events to display</p>
            <p className="text-sm text-muted-foreground mt-1">
              {selectedCategory ? "Try changing the filter" : "Be the first to report an event"}
            </p>
          </div>
        ) : (
          events.map((event) => <EventCard key={event.id} event={event} />)
        )}
      </div>
    </div>
  )
}

interface CategoryPillProps {
  label: string
  active?: boolean
  icon?: string
  accent?: string
  onClick: () => void
}

function CategoryPill({ label, active, icon, accent, onClick }: CategoryPillProps) {
  const style: CSSProperties | undefined = active && accent ? ({ "--pill-accent": accent } as CSSProperties) : undefined

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex min-h-[44px] select-none items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        active
          ? "border-transparent bg-[color:var(--pill-accent)] text-white shadow-sm"
          : "border-border bg-background text-foreground hover:border-foreground/40",
      )}
      style={style}
    >
      {icon && <span aria-hidden>{icon}</span>}
      <span>{label}</span>
    </button>
  )
}
