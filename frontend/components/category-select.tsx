"use client"

import { CATEGORIES, CATEGORY_LABELS, CATEGORY_ICONS } from "@/lib/constants"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface CategorySelectProps {
  value?: string
  onChange: (value: string) => void
}

export function CategorySelect({ value, onChange }: CategorySelectProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {CATEGORIES.map((category) => (
        <Card
          key={category}
          className={cn(
            "cursor-pointer transition-all hover:border-primary",
            value === category && "border-primary bg-primary/5",
          )}
          onClick={() => onChange(category)}
        >
          <div className="p-4 flex items-center gap-3">
            <span className="text-2xl">{CATEGORY_ICONS[category]}</span>
            <span className="text-sm font-medium">{CATEGORY_LABELS[category]}</span>
          </div>
        </Card>
      ))}
    </div>
  )
}
