"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Info, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useUserLocation } from "@/hooks/use-user-location"
import type { Location, SafetyAdvisorRequestType } from "@/types"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  createdAt: string
  isStreaming?: boolean
}

const DEFAULT_REQUEST_TYPE: SafetyAdvisorRequestType = "BROAD_AREA_SAFETY_GUIDANCE"
const DEFAULT_TIMEFRAME_MONTHS: number | null = null

const createMessageId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2)
}

export function SafetyChat() {
  const router = useRouter()
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: createMessageId(),
      role: "assistant",
      content:
        "Hello! I'm your SafeStep Urban Advisor. Share a query about an address, area, event, or route and I'll summarize recent safety activity using verified historical data.",
      createdAt: new Date().toISOString(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const messagesRef = useRef<ChatMessage[]>([])

  const { location, requestLocation } = useUserLocation()

  useEffect(() => {
    requestLocation()
  }, [requestLocation])

  const currentLocation: Location | null = useMemo(() => location ?? null, [location])

  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  const lastMessageId = messages.length > 0 ? messages[messages.length - 1]?.id : null

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      const trimmed = inputValue.trim()
      if (!trimmed || isSubmitting) {
        return
      }
      setError(null)
      setIsSubmitting(true)

      const userMessage: ChatMessage = {
        id: createMessageId(),
        role: "user",
        content: trimmed,
        createdAt: new Date().toISOString(),
      }

      const baseHistory = messagesRef.current
      const optimisticHistory = [...baseHistory, userMessage]

      const placeholderMessage: ChatMessage = {
        id: createMessageId(),
        role: "assistant",
        content: "Working on your safety summary...",
        createdAt: new Date().toISOString(),
        isStreaming: true,
      }

      setMessages((prev) => [...prev, userMessage, placeholderMessage])
      setInputValue("")

      try {
        const response = await fetch("/api/ai-chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            requestType: DEFAULT_REQUEST_TYPE,
            timeframeMonths: DEFAULT_TIMEFRAME_MONTHS,
            userQuery: trimmed,
            coordinates: currentLocation,
            messages: optimisticHistory.map((message) => ({
              role: message.role,
              content: message.content,
            })),
          }),
        })

        if (!response.ok) {
          const errorBody = await response.json().catch(() => null)
          throw new Error(errorBody?.error ?? "Failed to fetch AI response")
        }

        const data = (await response.json()) as { message?: string }

        if (!data?.message) {
          throw new Error("AI response was empty")
        }

        const responseMessage = data.message as string

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === placeholderMessage.id
              ? {
                  ...msg,
                  content: responseMessage,
                  createdAt: new Date().toISOString(),
                  isStreaming: false,
                }
              : msg,
          ),
        )
      } catch (error) {
        console.error("[SafetyChat] Failed to send message", error)
        setError(error instanceof Error ? error.message : "Something went wrong")
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === placeholderMessage.id
              ? {
                  ...msg,
                  content: "Unable to generate a safety summary right now. Please try again shortly.",
                  isStreaming: false,
                }
              : msg,
          ),
        )
      } finally {
        setIsSubmitting(false)
      }
    },
    [currentLocation, inputValue, isSubmitting],
  )

  useEffect(() => {
    if (!scrollContainerRef.current || !lastMessageId) {
      return
    }
    scrollContainerRef.current.scrollTo({
      top: scrollContainerRef.current.scrollHeight,
      behavior: "smooth",
    })
  }, [lastMessageId])

  const handleInputKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault()
        if (formRef.current && !isSubmitting && inputValue.trim()) {
          formRef.current.requestSubmit()
        }
      }
    },
    [inputValue, isSubmitting],
  )

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <header className="flex items-center gap-3 border-b bg-muted/40 px-4 py-3">
        <Button variant="ghost" size="icon" className="h-11 w-11" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex flex-col">
          <span className="text-base font-semibold">SafeStep AI Advisor</span>
          <span className="text-xs text-muted-foreground">AI-powered safety insights powered by historical data</span>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4">
        <Card className="space-y-4 p-4 shadow-sm">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-5 w-5 text-primary" />
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                SafeStep automatically uses your current coordinates and recent local events to provide safety summaries and information on what’s happening nearby. Ask about streets, addresses, safety concerns, or upcoming events and local activities.
              </p>
            </div>
          </div>
        </Card>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border bg-card shadow-sm">
          <div ref={scrollContainerRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    message.role === "assistant"
                      ? "bg-muted text-foreground"
                      : "bg-blue-500 text-white"
                  }`}
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    className="prose prose-invert max-w-none text-sm leading-relaxed [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:mb-2 [&>ol]:mb-2 [&>li]:mt-1"
                  >
                    {message.content}
                  </ReactMarkdown>
                  <span className="mt-2 block text-[11px] text-muted-foreground/70">
                    {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    {message.isStreaming ? " · updating" : ""}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <form ref={formRef} onSubmit={handleSubmit} className="border-t bg-muted/30 p-4">
            {error && <p className="mb-2 text-sm text-destructive">{error}</p>}
            <div className="flex flex-col gap-3">
              <Textarea
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Ask about an address, area, event, or route..."
                rows={3}
                className="resize-none rounded-2xl border bg-background px-4 py-3 text-sm"
              />
              <div className="flex items-center justify-end">
                <Button
                  type="submit"
                  className="h-11 gap-2 rounded-full bg-blue-500 px-6 text-white hover:bg-blue-600"
                  disabled={!inputValue.trim() || isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send"}
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

