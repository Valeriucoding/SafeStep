"use client"

import type { FormEvent } from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Loader2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/lib/hooks/use-auth"
import type { EventMessage } from "@/types"

interface EventChatProps {
  eventId: string
}

type EventMessageRow = {
  id: string
  event_id: string
  user_id: string | null
  user_email: string | null
  content: string
  created_at: string
}

export function EventChat({ eventId }: EventChatProps) {
  const { supabase, user } = useAuth()
  const [messages, setMessages] = useState<EventMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const hasMessages = messages.length > 0

  useEffect(() => {
    let isMounted = true

    const loadMessages = async () => {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("event_messages")
        .select("*")
        .eq("event_id", eventId)
        .order("created_at", { ascending: true })

      if (!isMounted) {
        return
      }

      if (error) {
        console.error("[event-chat] Failed to load messages", error)
        setError("We couldn’t load the chat right now. Please try again.")
        setIsLoading(false)
        return
      }

      const rows = (data ?? []) as EventMessageRow[]
      const parsedMessages: EventMessage[] = rows.map((row) => ({
        id: row.id,
        eventId: row.event_id,
        userId: row.user_id,
        userEmail: row.user_email,
        content: row.content,
        createdAt: row.created_at,
      }))

      setMessages(parsedMessages)
      setIsLoading(false)
      setError(null)
    }

    loadMessages()

    return () => {
      isMounted = false
    }
  }, [eventId, supabase])

  useEffect(() => {
    const channel = supabase
      .channel(`event-messages-${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "event_messages",
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          const row = payload.new as EventMessageRow
          const nextMessage: EventMessage = {
            id: row.id,
            eventId: row.event_id,
            userId: row.user_id,
            userEmail: row.user_email,
            content: row.content,
            createdAt: row.created_at,
          }

          setMessages((previous) => {
            if (previous.some((message) => message.id === nextMessage.id)) {
              return previous
            }
            return [...previous, nextMessage]
          })
        },
      )

    channel.subscribe((status) => {
      if (status === "CHANNEL_ERROR") {
        console.error("[event-chat] Realtime channel error")
      }
    })

    return () => {
      const result = channel.unsubscribe()
      if (result instanceof Promise) {
        result.catch((unsubscribeError) => {
          console.error("[event-chat] Failed to unsubscribe from messages", unsubscribeError)
        })
      }
    }
  }, [eventId, supabase])

  const messageCount = messages.length

  useEffect(() => {
    if (messageCount === 0) {
      return
    }
    const timeout = window.setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 150)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [messageCount])

  const handleSendMessage = async () => {
    if (!input.trim() || isSending) {
      return
    }

    setIsSending(true)
    setError(null)

    const trimmed = input.trim()

    const { error: sendError } = await supabase.from("event_messages").insert({
      event_id: eventId,
      user_id: user?.id ?? null,
      user_email: user?.email ?? null,
      content: trimmed,
    })

    if (sendError) {
      console.error("[event-chat] Failed to send message", sendError)
      setError("We couldn’t send your message. Please try again.")
    } else {
      setInput("")
    }

    setIsSending(false)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void handleSendMessage()
  }

  const sortedMessages = useMemo(() => {
    return [...messages].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    )
  }, [messages])

  const renderMessageMeta = (message: EventMessage) => {
    const isOwn = message.userId && user?.id === message.userId
    const displayName = isOwn
      ? "You"
      : message.userEmail?.split("@")[0] ?? "Community member"

    return (
      <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground/80">
        <span>{displayName}</span>
        <span suppressHydrationWarning>
          {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
        </span>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col bg-background">
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : hasMessages ? (
          <div className="flex flex-col gap-3">
            {sortedMessages.map((message) => {
              const isOwn = message.userId && user?.id === message.userId

              return (
                <div key={message.id} className={`flex w-full ${isOwn ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                      isOwn
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                    {renderMessageMeta(message)}
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
            <p>No messages yet. Start the conversation to help others stay informed.</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-border/70 bg-background px-4 py-3">
        <div className="flex items-end gap-3">
          <Textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Share what you’re seeing or ask a question..."
            className="min-h-[44px] flex-1 resize-none rounded-2xl bg-muted/60 px-4 py-3 text-sm leading-relaxed focus-visible:ring-1"
            rows={2}
            maxLength={500}
            aria-label="Event chat message"
          />
          <Button
            type="submit"
            disabled={!input.trim() || isSending}
            className="h-11 min-w-[44px] rounded-full"
          >
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      </form>
    </div>
  )
}


