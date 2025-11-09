"use client"

import { use, useEffect, useMemo } from "react"
import { ArrowLeft, MessageCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { EventChat } from "@/components/event-chat"
import { Button } from "@/components/ui/button"
import { useEventsStore } from "@/store/events-store"

interface EventChatPageProps {
  params: Promise<{
    id: string
  }>
}

export default function EventChatPage({ params }: EventChatPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const events = useEventsStore((state) => state.events)
  const isLoading = useEventsStore((state) => state.isLoading)
  const fetchEvents = useEventsStore((state) => state.fetchEvents)
  const subscribeToRealtime = useEventsStore((state) => state.subscribeToRealtime)
  const unsubscribeFromRealtime = useEventsStore((state) => state.unsubscribeFromRealtime)

  useEffect(() => {
    if (!events.length) {
      fetchEvents().catch((error) => {
        console.error("[event-chat-page] Failed to fetch events", error)
      })
    }
  }, [events.length, fetchEvents])

  useEffect(() => {
    subscribeToRealtime().catch((error) => {
      console.error("[event-chat-page] Failed to subscribe to events realtime updates", error)
    })

    return () => {
      unsubscribeFromRealtime().catch((error) => {
        console.error("[event-chat-page] Failed to unsubscribe from events realtime updates", error)
      })
    }
  }, [subscribeToRealtime, unsubscribeFromRealtime])

  const event = useMemo(() => events.find((item) => item.id === id), [events, id])

  if (isLoading && !event) {
    return (
      <div className="flex min-h-[calc(100dvh-3.5rem)] items-center justify-center bg-background sm:min-h-[calc(100dvh-4rem)]">
        <MessageCircle className="h-8 w-8 animate-pulse text-primary" />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col items-center justify-center gap-4 px-4 text-center sm:min-h-[calc(100dvh-4rem)]">
        <p className="text-muted-foreground">We couldn’t find that event chat.</p>
        <div className="flex flex-wrap items-center justify-center gap-2">
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
    <div className="mx-auto flex min-h-[calc(100dvh-3.5rem)] w-full max-w-3xl flex-col bg-background sm:min-h-[calc(100dvh-4rem)]">
      <div className="flex items-start gap-3 border-b border-border/70 px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-11 w-11 rounded-full border border-border bg-background shadow-sm"
          onClick={() => router.back()}
          aria-label="Back to previous page"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex flex-1 flex-col gap-1">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold text-foreground">Event Chat</h1>
          </div>
          <p className="text-sm text-muted-foreground">{event.title}</p>
        </div>
        <Link href={`/event/${event.id}`}>
          <Button variant="outline" className="rounded-full px-4 py-2 text-sm">
            View event
          </Button>
        </Link>
      </div>
      <EventChat eventId={event.id} />
    </div>
  )
}


