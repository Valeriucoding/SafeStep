"use client"

import { CATEGORIES, CATEGORY_LABELS, CATEGORY_ICONS } from "@/lib/constants"
import type { Category } from "@/types"
import { cn } from "@/lib/utils"

interface CategorySelectProps {
  value?: Category
  onChange: (value: Category) => void
}

export function CategorySelect({ value, onChange }: CategorySelectProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {CATEGORIES.map((category) => (
        <button
          key={category}
          type="button"
          className={cn(
            "min-h-[56px] w-full rounded-lg border-2 transition-all duration-200",
            "flex items-center gap-3 px-4 py-3 text-left",
            "hover:border-primary/50 hover:bg-muted/50",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
            value === category
              ? "border-primary bg-primary/10 shadow-sm"
              : "border-border bg-background",
          )}
          onClick={() => onChange(category)}
        >
          <span className="text-2xl flex-shrink-0">{CATEGORY_ICONS[category]}</span>
          <span className="text-sm font-medium text-foreground">{CATEGORY_LABELS[category]}</span>
        </button>
      ))}
    </div>
  )
}
