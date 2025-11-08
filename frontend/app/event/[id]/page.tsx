"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { EventDetail } from "@/components/event-detail"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useEventsStore } from "@/store/events-store"

interface EventPageProps {
  params: {
    id: string
  }
}

export default function EventPage({ params }: EventPageProps) {
  const { id } = params
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
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 px-4 text-center">
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
    <div className="min-h-screen bg-background pb-6">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-4 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Event Details</h1>
        </div>
      </header>

      <EventDetail event={event} onVerify={handleVerify} hasVerified={hasVerified || isVerifying} />
    </div>
  )
}
