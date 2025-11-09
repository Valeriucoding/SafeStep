import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CATEGORY_ICONS, CATEGORY_LABELS } from "@/lib/constants"
import type { Event } from "@/types"
import { Calendar, CheckCircle2, MapPin, MessageCircle, X } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

interface MapEventPreviewProps {
  event: Event
  onDismiss: () => void
}

export function MapEventPreview({ event, onDismiss }: MapEventPreviewProps) {
  const categoryLabel = CATEGORY_LABELS[event.category as keyof typeof CATEGORY_LABELS] ?? event.category
  const categoryIcon = CATEGORY_ICONS[event.category as keyof typeof CATEGORY_ICONS] ?? "📍"

  return (
    <div className="pointer-events-auto relative">
      <div className="absolute left-[calc(theme(spacing.3)-2px)] top-[-16px] z-20 transform">
        <Button
          asChild
          size="icon"
          variant="secondary"
          className="h-12 w-12 rounded-full bg-background/90 shadow-lg backdrop-blur transition-colors hover:bg-background"
        >
          <Link href={`/event/${event.id}/chat`} aria-label="Open event chat">
            <MessageCircle className="h-5 w-5 text-primary" />
          </Link>
        </Button>
      </div>
      <Card className="relative mx-auto w-[min(92%,420px)] overflow-hidden rounded-3xl border border-border/70 bg-background shadow-lg">
        <div className="absolute right-2 top-2 z-10">
          <Button
            size="icon"
            variant="ghost"
            className="h-11 w-11 rounded-full bg-background/90 backdrop-blur transition-colors hover:bg-background"
            onClick={onDismiss}
            aria-label="Dismiss event preview"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <Link href={`/event/${event.id}`} className="block">
          <CardContent className="flex flex-col gap-4 px-5 py-5">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-xl">
                {categoryIcon}
              </span>
              <div className="flex flex-1 flex-col gap-1 overflow-hidden">
                <Badge variant="secondary" className="w-fit rounded-full px-3 py-1 text-xs">
                  {categoryLabel}
                </Badge>
                <h3 className="line-clamp-2 text-base font-semibold text-foreground">{event.title}</h3>
              </div>
              {event.verificationCount > 0 && (
                <span className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {event.verificationCount}
                </span>
              )}
            </div>

            <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{event.description}</p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
              <span className="flex min-w-0 items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-primary/80" />
                <span className="truncate">{event.address}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-primary/80" />
                <span>{formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}</span>
              </span>
            </div>
          </CardContent>
        </Link>
      </Card>
    </div>
  )
}