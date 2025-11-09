"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Navigation, Filter, BotMessageSquare } from "lucide-react"
import { CATEGORIES, CATEGORY_LABELS } from "@/lib/constants"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Category } from "@/types"

interface MapControlsProps {
  selectedCategory: Category | null
  onCategoryChange: (category: Category | null) => void
  onLocationRequest: () => void
  hasLocation: boolean
}

export function MapControls({ selectedCategory, onCategoryChange, onLocationRequest, hasLocation }: MapControlsProps) {
  return (
    <>
      {/* Top right controls */}
      <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
        <Button
          size="icon"
          variant={hasLocation ? "default" : "secondary"}
          onClick={onLocationRequest}
          className="h-12 w-12 rounded-full shadow-lg"
        >
          <Navigation className="h-5 w-5" />
        </Button>

            <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant={selectedCategory ? "default" : "secondary"}
              className="h-12 w-12 rounded-full shadow-lg"
            >
              <Filter className="h-5 w-5" />
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

        <Link href="/ai-chat" className="inline-flex">
          <Button
            className="h-12 w-12 rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600"
            aria-label="Open AI chat"
          >
            <BotMessageSquare className="h-5 w-5" />
          </Button>
        </Link>
      </div>

      {/* Category legend */}
      {selectedCategory && (
        <Card className="absolute bottom-24 left-4 p-3 shadow-lg">
          <div className="text-sm font-medium">Filtering: {CATEGORY_LABELS[selectedCategory]}</div>
        </Card>
      )}
    </>
  )
}
