import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { getSupabaseServerClient } from "@/lib/supabase-server"
import { mapEventRowToEvent, type EventRow } from "@/lib/event-transformer"
import { buildSafetyAdvisorSystemPrompt } from "@/lib/prompt/safety-advisor"
import type { SafetyAdvisorRequestPayload } from "@/types"

const DEFAULT_MODEL = "gemini-2.0-flash"
const MAX_EVENTS = 1000

interface ChatCompletionMessage {
  role: "user" | "assistant"
  content: string
}

interface ChatRequestBody extends SafetyAdvisorRequestPayload {
  messages: ChatCompletionMessage[]
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "Missing Google AI Studio credentials" }, { status: 500 })
    }

    const body = (await request.json()) as Partial<ChatRequestBody>

    if (!body?.userQuery || !body?.messages || !body.requestType) {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 })
    }

    const timeframeMonths =
      typeof body.timeframeMonths === "number" && !Number.isNaN(body.timeframeMonths) && body.timeframeMonths > 0
        ? body.timeframeMonths
        : null

    if (body.timeframeMonths !== undefined && body.timeframeMonths !== null) {
      const numeric = Number(body.timeframeMonths)
      if (Number.isNaN(numeric) || numeric <= 0) {
        return NextResponse.json({ error: "Invalid timeframe" }, { status: 400 })
      }
    }

    const supabase = getSupabaseServerClient()

    let query = supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false })

    if (timeframeMonths !== null) {
      const sinceDate = new Date()
      sinceDate.setMonth(sinceDate.getMonth() - timeframeMonths)
      query = query.gte("created_at", sinceDate.toISOString())
    }

    if (body.areaName) {
      query = query.ilike("address", `%${body.areaName}%`)
    }

    const { data, error } = await query.limit(MAX_EVENTS)

    if (error) {
      console.error("[ai-chat] Supabase query failed", error)
      return NextResponse.json({ error: "Failed to load events" }, { status: 500 })
    }

    const events = (data ?? []).map((row) => mapEventRowToEvent(row as EventRow))

    const systemPrompt = buildSafetyAdvisorSystemPrompt({
      requestType: body.requestType,
      userQuery: body.userQuery,
      areaName: body.areaName,
      timeframeMonths,
      coordinates: body.coordinates ?? null,
      events,
    })

    const formattedConversation = body.messages
      .map((message) => `${message.role === "user" ? "User" : "Assistant"}:\n${message.content}`)
      .join("\n\n")

    const prompt = `${systemPrompt}

--- CONVERSATION ---
${formattedConversation}

Assistant:`

    const client = new GoogleGenerativeAI(apiKey)
    const model = client.getGenerativeModel({ model: process.env.GOOGLE_AI_MODEL ?? DEFAULT_MODEL })
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    })

    const assistantMessage = result.response?.text()?.trim()

    if (!assistantMessage) {
      return NextResponse.json({ error: "AI did not return a response" }, { status: 500 })
    }

    return NextResponse.json({
      message: assistantMessage,
    })
  } catch (error) {
    console.error("[ai-chat] Unexpected error", error)
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 })
  }
}

