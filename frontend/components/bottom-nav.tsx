"use client"

import { Button } from "@/components/ui/button"
import { Map as MapIcon, List, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface BottomNavProps {
  currentView: "map" | "feed"
  onViewChange: (view: "map" | "feed") => void
}

export function BottomNav({ currentView, onViewChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-around px-4 py-2 safe-area-inset-bottom">
        <Button
          variant="ghost"
          size="sm"
          className={cn("flex-col h-auto py-2 gap-1", currentView === "map" && "text-primary")}
          onClick={() => onViewChange("map")}
        >
          <MapIcon className="h-5 w-5" />
          <span className="text-xs">Map</span>
        </Button>

        <Link href="/report" className="relative -mt-8">
          <div className="h-14 w-14 rounded-full bg-primary shadow-lg flex items-center justify-center hover:scale-105 transition-transform">
            <Plus className="h-6 w-6 text-primary-foreground" />
          </div>
        </Link>

        <Button
          variant="ghost"
          size="sm"
          className={cn("flex-col h-auto py-2 gap-1", currentView === "feed" && "text-primary")}
          onClick={() => onViewChange("feed")}
        >
          <List className="h-5 w-5" />
          <span className="text-xs">Feed</span>
        </Button>
      </div>
    </nav>
  )
}
