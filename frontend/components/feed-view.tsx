"use client"

import { EventCard } from "@/components/incident-card"
import { Button } from "@/components/ui/button"
import { Filter } from "lucide-react"
import type { Incident } from "@/types"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CATEGORIES, CATEGORY_LABELS } from "@/lib/constants"

interface FeedViewProps {
  incidents: Incident[]
  selectedCategory: string | null
  onCategoryChange: (category: string | null) => void
}

export function FeedView({ incidents, selectedCategory, onCategoryChange }: FeedViewProps) {
  return (
    <div className="h-full overflow-y-auto bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-xl font-semibold">Event Feed</h1>
            <p className="text-sm text-muted-foreground">
              {incidents.length} active {incidents.length === 1 ? "event" : "events"}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={selectedCategory ? "default" : "outline"} size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onCategoryChange(null)}>All Categories</DropdownMenuItem>
              {CATEGORIES.map((category) => (
                <DropdownMenuItem key={category} onClick={() => onCategoryChange(category)}>
                  {CATEGORY_LABELS[category]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Feed Content */}
      <div className="p-4 space-y-4">
        {incidents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">No events to display</p>
            <p className="text-sm text-muted-foreground mt-1">
              {selectedCategory ? "Try changing the filter" : "Be the first to report an event"}
            </p>
          </div>
        ) : (
          incidents.map((incident) => <EventCard key={incident.id} incident={incident} />)
        )}
      </div>
    </div>
  )
}
