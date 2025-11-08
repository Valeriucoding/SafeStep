"use client"

import { use, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { EventDetail } from "@/components/event-detail"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useEventsStore } from "@/store/events-store"

interface EventPageProps {
  params: Promise<{
    id: string
  }>
}

export default function EventPage({ params }: EventPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const events = useEventsStore((state) => state.events)
  const isLoading = useEventsStore((state) => state.isLoading)
  const fetchEvents = useEventsStore((state) => state.fetchEvents)
  const subscribeToRealtime = useEventsStore((state) => state.subscribeToRealtime)
  const unsubscribeFromRealtime = useEventsStore((state) => state.unsubscribeFromRealtime)
  const verifyEvent = useEventsStore((state) => state.verifyEvent)
  const [hasVerified, setHasVerified] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

  const event = useMemo(() => events.find((item) => item.id === id), [events, id])

  useEffect(() => {
    if (!events.length) {
      fetchEvents()
    }
  }, [events.length, fetchEvents])

  useEffect(() => {
    subscribeToRealtime()

    return () => {
      unsubscribeFromRealtime()
    }
  }, [subscribeToRealtime, unsubscribeFromRealtime])

  const handleVerify = async () => {
    if (!event || hasVerified || isVerifying) {
      return
    }

    setIsVerifying(true)
    try {
      await verifyEvent(event.id)
      setHasVerified(true)
    } catch (error) {
      console.error("Failed to verify event:", error)
    } finally {
      setIsVerifying(false)
    }
  }

  if (isLoading && !event) {
    return (
      <div className="flex min-h-[calc(100dvh-3.5rem)] items-center justify-center bg-background sm:min-h-[calc(100dvh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col items-center justify-center gap-4 px-4 text-center sm:min-h-[calc(100dvh-4rem)]">
        <p className="text-muted-foreground">We couldn’t find that event.</p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            Go Back
          </Button>
          <Link href="/">
            <Button>Back to Map</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-3.5rem)] w-full max-w-3xl flex-col gap-4 px-4 pb-10 pt-2 sm:min-h-[calc(100dvh-4rem)] sm:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-11 w-11 rounded-full border border-border bg-background shadow-sm"
          onClick={() => router.back()}
          aria-label="Back to previous page"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex flex-col">
          <h1 className="text-xl font-semibold text-foreground">Event Details</h1>
          <span className="text-sm text-muted-foreground">Verify details or follow updates</span>
        </div>
      </div>

      <EventDetail event={event} onVerify={handleVerify} hasVerified={hasVerified || isVerifying} />
    </div>
  )
}
