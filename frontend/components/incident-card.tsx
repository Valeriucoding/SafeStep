"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CATEGORY_LABELS, CATEGORY_ICONS } from "@/lib/constants"
import { MapPin, Calendar, CheckCircle2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Image from "next/image"
import Link from "next/link"
import type { Incident } from "@/types"

interface EventCardProps {
  incident: Incident
}

export function EventCard({ incident }: EventCardProps) {
  const categoryLabel = CATEGORY_LABELS[incident.category as keyof typeof CATEGORY_LABELS]
  const categoryIcon = CATEGORY_ICONS[incident.category as keyof typeof CATEGORY_ICONS]

  return (
    <Link href={`/incident/${incident.id}`}>
      <Card className="group relative overflow-hidden border-border/70 bg-card/70 backdrop-blur-sm transition-all hover:border-primary/70 hover:shadow-lg">
        <CardContent className="flex flex-col gap-0 p-0 sm:flex-row">
          {/* Image */}
          <div className="relative flex h-40 w-full flex-shrink-0 overflow-hidden bg-muted sm:h-auto sm:w-40">
            {incident.imageUrl ? (
              <Image
                src={incident.imageUrl}
                alt={incident.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-4xl opacity-60">
                {categoryIcon}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex min-w-0 flex-1 flex-col gap-4 p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <span className="text-xl leading-none">{categoryIcon}</span>
                  <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
                    {categoryLabel}
                  </Badge>
                </div>
                <h3 className="line-clamp-2 text-lg font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">
                  {incident.title}
                </h3>
              </div>
              {incident.verificationCount > 0 && (
                <span className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  <CheckCircle2 className="h-3 w-3" />
                  {incident.verificationCount} verified
                </span>
              )}
            </div>

            <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{incident.description}</p>

            <div className="mt-auto flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border/60 pt-4 text-xs text-muted-foreground">
              <div className="flex min-w-0 items-center gap-2">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-primary/80" />
                <span className="truncate">{incident.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 flex-shrink-0 text-primary/80" />
                <span>{formatDistanceToNow(new Date(incident.createdAt), { addSuffix: true })}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
