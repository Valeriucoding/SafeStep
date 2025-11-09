"use client"

import { useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CATEGORY_LABELS, CATEGORY_ICONS } from "@/lib/constants"
import { MapPin, Calendar, CheckCircle2, AlertCircle, Check, Clock, ShieldX } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Image from "next/image"
import type { Event, EventStatus } from "@/types"
import { EventMap } from "@/components/event-map"
import { useAuth } from "@/lib/hooks/use-auth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { updateEventStatus } from "@/lib/api"
import { cn } from "@/lib/utils"

interface EventDetailProps {
  event: Event
  onVerify: () => void
  hasVerified: boolean
}

const STATUS_OPTIONS: Array<{ value: EventStatus; label: string; helper: string }> = [
  { value: "pending", label: "Pending Review", helper: "Awaiting moderator decision" },
  { value: "valid", label: "Valid Report", helper: "Confirmed as accurate and helpful" },
  { value: "spam", label: "Spam", helper: "Misleading, promotional, or irrelevant content" },
  { value: "false", label: "False Report", helper: "Intentionally incorrect or deceptive" },
]

const STATUS_BADGE_VARIANT: Record<EventStatus, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  valid: "default",
  spam: "destructive",
  false: "outline",
}

const STATUS_ICON: Record<EventStatus, ReactNode> = {
  pending: <Clock className="h-3 w-3" />,
  valid: <Check className="h-3 w-3" />,
  spam: <ShieldX className="h-3 w-3" />,
  false: <AlertCircle className="h-3 w-3" />,
}

const resolveStatusOption = (status: EventStatus) =>
  STATUS_OPTIONS.find((option) => option.value === status) ?? STATUS_OPTIONS[0]

export function EventDetail({ event, onVerify, hasVerified }: EventDetailProps) {
  const { user } = useAuth()
  const [status, setStatus] = useState<EventStatus>(event.status)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [statusError, setStatusError] = useState<string | null>(null)

  useEffect(() => {
    setStatus(event.status)
  }, [event.status])

  const userMetadata = (user?.user_metadata ?? {}) as Record<string, unknown>
  const userRole = typeof userMetadata.role === "string" ? userMetadata.role : null
  const canModerate = Boolean(
    user && (user.id === event.reporterId || userRole === "admin" || userRole === "moderator"),
  )

  const categoryLabel = CATEGORY_LABELS[event.category as keyof typeof CATEGORY_LABELS]
  const categoryIcon = CATEGORY_ICONS[event.category as keyof typeof CATEGORY_ICONS]
  const statusOption = useMemo(() => resolveStatusOption(status), [status])

  const handleStatusChange = async (nextStatus: EventStatus) => {
    if (!canModerate || nextStatus === status) {
      return
    }

    setStatusError(null)
    setIsUpdatingStatus(true)
    const previousStatus = status
    setStatus(nextStatus)

    try {
      await updateEventStatus(event.id, nextStatus)
    } catch (error) {
      console.error("[event-detail] Failed to update event status:", error)
      setStatus(previousStatus)
      setStatusError("Failed to update status. Please try again.")
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-1 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-2xl">{categoryIcon}</span>
              <Badge variant="outline">{categoryLabel}</Badge>
              <Badge variant={event.isActive ? "default" : "secondary"}>
                {event.isActive ? (
                  <>
                    <AlertCircle className="mr-1 h-3 w-3" />
                    Active
                  </>
                ) : (
                  "Resolved"
                )}
              </Badge>
              <Badge variant={STATUS_BADGE_VARIANT[status]} className="capitalize">
                <span className="flex items-center gap-1">
                  {STATUS_ICON[status]}
                  {statusOption.label}
                </span>
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
            </div>
          </div>
          <CardTitle className="text-2xl">{event.title}</CardTitle>
          <p className="leading-relaxed text-foreground">{event.description}</p>
        </div>
      </div>

      <div className="flex items-start gap-2 text-sm text-muted-foreground">
        <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
        <span>{event.address}</span>
      </div>

      <EventMap location={event.location} radiusMeters={event.radiusMeters} category={event.category} />

      <div className="space-y-3 rounded-xl border border-border bg-background p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-lg">Report Status</p>
            <p className="text-sm text-muted-foreground">{statusOption.helper}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={STATUS_BADGE_VARIANT[status]} className="capitalize">
              <span className="flex items-center gap-1">
                {STATUS_ICON[status]}
                {statusOption.label}
              </span>
            </Badge>
            {canModerate && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline" disabled={isUpdatingStatus}>
                    {isUpdatingStatus ? "Updating..." : "Update"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {STATUS_OPTIONS.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      disabled={option.value === status || isUpdatingStatus}
                      className={cn(option.value === status && "text-primary")}
                      onClick={() => handleStatusChange(option.value)}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
        {statusError && <p className="text-sm text-destructive">{statusError}</p>}
        {!canModerate && (
          <p className="text-xs text-muted-foreground">
            Status updates are managed by moderators or the original reporter.
          </p>
        )}
      </div>

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
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Verified
            </>
          ) : (
            "Verify"
          )}
        </Button>
      </div>

      {event.imageUrl && (
        <div className="relative aspect-video">
          <Image src={event.imageUrl || "/placeholder.svg"} alt={event.title} fill className="rounded-lg object-cover" />
        </div>
      )}

      {event.isActive && event.category !== "event" && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
              <div>
                <p className="mb-2 font-semibold">Safety Tips</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
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
