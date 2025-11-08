"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CATEGORY_LABELS, CATEGORY_ICONS } from "@/lib/constants"
import { MapPin, Calendar, CheckCircle2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Image from "next/image"
import Link from "next/link"
import type { Incident } from "@/types"

interface IncidentCardProps {
  incident: Incident
}

export function IncidentCard({ incident }: IncidentCardProps) {
  const categoryLabel = CATEGORY_LABELS[incident.category as keyof typeof CATEGORY_LABELS]
  const categoryIcon = CATEGORY_ICONS[incident.category as keyof typeof CATEGORY_ICONS]

  return (
    <Link href={`/incident/${incident.id}`}>
      <Card className="cursor-pointer transition-all hover:border-primary hover:shadow-md">
        <CardContent className="p-0">
          <div className="flex gap-4 p-4">
            {/* Image */}
            {incident.imageUrl && (
              <div className="relative h-24 w-24 flex-shrink-0 rounded-lg overflow-hidden">
                <Image
                  src={incident.imageUrl || "/placeholder.svg"}
                  alt={incident.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2 mb-2">
                <span className="text-xl flex-shrink-0">{categoryIcon}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base line-clamp-1">{incident.title}</h3>
                  <Badge variant="outline" className="mt-1">
                    {categoryLabel}
                  </Badge>
                </div>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{incident.description}</p>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{incident.address}</span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Calendar className="h-3 w-3" />
                  {formatDistanceToNow(new Date(incident.createdAt), { addSuffix: true })}
                </div>
              </div>

              {incident.verificationCount > 0 && (
                <div className="flex items-center gap-1 mt-2 text-xs text-primary">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>{incident.verificationCount} verified</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
