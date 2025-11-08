"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CATEGORY_LABELS, CATEGORY_ICONS } from "@/lib/constants"
import { MapPin, Calendar, CheckCircle2, AlertCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Image from "next/image"
import type { Event } from "@/types"
import { EventMap } from "@/components/event-map"

interface EventDetailProps {
  event: Event
  onVerify: () => void
  hasVerified: boolean
}

export function EventDetail({ event, onVerify, hasVerified }: EventDetailProps) {
  const categoryLabel = CATEGORY_LABELS[event.category as keyof typeof CATEGORY_LABELS]
  const categoryIcon = CATEGORY_ICONS[event.category as keyof typeof CATEGORY_ICONS]

  return (
    <div className="mx-auto max-w-2xl p-4 space-y-4">
      {/* Status Badge */}
      <div className="flex items-center justify-between">
        <Badge variant={event.isActive ? "default" : "secondary"}>
          {event.isActive ? (
            <>
              <AlertCircle className="h-3 w-3 mr-1" />
              Active
            </>
          ) : (
            "Resolved"
          )}
        </Badge>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
        </div>
      </div>

      {/* Image */}
      {event.imageUrl && (
        <Card className="overflow-hidden">
          <div className="aspect-video relative">
            <Image src={event.imageUrl || "/placeholder.svg"} alt={event.title} fill className="object-cover" />
          </div>
        </Card>
      )}

      {/* Main Details */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{categoryIcon}</span>
                <Badge variant="outline">{categoryLabel}</Badge>
              </div>
              <CardTitle className="text-2xl">{event.title}</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-foreground leading-relaxed">{event.description}</p>

          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{event.address}</span>
          </div>
        </CardContent>
      </Card>

      {/* Map */}
      <Card className="overflow-hidden">
        <EventMap location={event.location} />
      </Card>

      {/* Verification */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-lg">Community Verification</p>
              <p className="text-sm text-muted-foreground">
                {event.verificationCount} {event.verificationCount === 1 ? "person has" : "people have"} verified this event
              </p>
            </div>
            <Button onClick={onVerify} disabled={hasVerified} size="lg" variant={hasVerified ? "outline" : "default"}>
              {hasVerified ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Verified
                </>
              ) : (
                "Verify"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Safety Tips */}
      {event.isActive && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-2">Safety Tips</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Avoid the area if possible</li>
                  <li>• Stay alert and aware of your surroundings</li>
                  <li>• Follow local authority guidance</li>
                  <li>• Report any updates you observe</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
