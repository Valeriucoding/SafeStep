import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { getSupabaseServerClient } from "@/lib/supabase-server"
import { mapEventRowToEvent, type EventRow } from "@/lib/event-transformer"
import { buildSafetyAdvisorSystemPrompt } from "@/lib/prompt/safety-advisor"
import type { SafetyAdvisorRequestPayload } from "@/types"
import { extractSafetyQueryFilters } from "@/lib/ai/extract-safety-query"

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

    const supabase = getSupabaseServerClient()

    const baseTimeframeMonths =
      typeof body.timeframeMonths === "number" && !Number.isNaN(body.timeframeMonths) && body.timeframeMonths > 0
        ? Math.round(body.timeframeMonths)
        : null

    if (body.timeframeMonths !== undefined && body.timeframeMonths !== null) {
      const numeric = Number(body.timeframeMonths)
      if (Number.isNaN(numeric) || numeric <= 0) {
        return NextResponse.json({ error: "Invalid timeframe" }, { status: 400 })
      }
    }

    const derivedFilters = await extractSafetyQueryFilters({
      apiKey,
      model: process.env.GOOGLE_AI_MODEL ?? DEFAULT_MODEL,
      payload: {
        requestType: body.requestType,
        userQuery: body.userQuery,
        areaName: body.areaName,
        timeframeMonths: baseTimeframeMonths,
        coordinates: body.coordinates ?? null,
      },
      messages: body.messages,
    })

    const effectiveTimeframe = derivedFilters.timeframeMonths ?? baseTimeframeMonths
    const effectiveCoordinates = derivedFilters.coordinates ?? body.coordinates ?? null
    const effectiveCategories = derivedFilters.categories
    const effectiveKeywords = derivedFilters.locationKeywords
    const effectiveRadius = derivedFilters.radiusMeters

    let query = supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false })

    if (effectiveTimeframe !== null) {
      const sinceDate = new Date()
      sinceDate.setMonth(sinceDate.getMonth() - effectiveTimeframe)
      query = query.gte("created_at", sinceDate.toISOString())
    }

    if (effectiveCategories.length > 0) {
      query = query.in("category", effectiveCategories)
    }

    const keywordFilters = buildKeywordOrFilter(effectiveKeywords)
    if (keywordFilters) {
      query = query.or(keywordFilters)
    }

    if (effectiveRadius && effectiveCoordinates) {
      const { minLat, maxLat, minLng, maxLng } = buildBoundingBox(effectiveCoordinates, effectiveRadius)
      query = query
        .gte("lat", minLat)
        .lte("lat", maxLat)
        .gte("lng", minLng)
        .lte("lng", maxLng)
    }

    const { data, error } = await query.limit(MAX_EVENTS)

    if (error) {
      console.error("[ai-chat] Supabase query failed", error)
      return NextResponse.json({ error: "Failed to load events" }, { status: 500 })
    }

    const events = (data ?? []).map((row) => mapEventRowToEvent(row as EventRow))

    const filterSummaryForPrompt =
      events.length > 0
        ? derivedFilters.summary
        : `${derivedFilters.summary} No matching historical events were found for this request.`

    console.info("[ai-chat] Filters applied", {
      timeframeMonths: effectiveTimeframe,
      categories: effectiveCategories,
      keywords: effectiveKeywords,
      radiusMeters: effectiveRadius,
      coordinates: effectiveCoordinates,
      resultCount: events.length,
    })

    const systemPrompt = buildSafetyAdvisorSystemPrompt({
      requestType: body.requestType,
      userQuery: body.userQuery,
      areaName: body.areaName,
      timeframeMonths: effectiveTimeframe,
      coordinates: effectiveCoordinates,
      events,
      filterSummary: filterSummaryForPrompt,
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

function buildKeywordOrFilter(keywords: string[]): string | null {
  if (!keywords.length) {
    return null
  }

  const sanitized = keywords
    .map((keyword) => keyword.trim())
    .filter((keyword) => keyword.length > 1)
    .map((keyword) => {
      const escaped = keyword.replace(/%/g, "\\%").replace(/_/g, "\\_")
      return [`address.ilike.%${escaped}%`, `title.ilike.%${escaped}%`, `description.ilike.%${escaped}%`]
    })
    .flat()

  if (!sanitized.length) {
    return null
  }

  return sanitized.join(",")
}

function buildBoundingBox(coordinates: { lat: number; lng: number }, radiusMeters: number) {
  const earthRadiusLat = 111_320 // meters per degree latitude
  const latDelta = radiusMeters / earthRadiusLat

  const latitudeRadians = (coordinates.lat * Math.PI) / 180
  const metersPerDegreeLng = Math.cos(latitudeRadians) * 111_320
  const lngDelta = metersPerDegreeLng > 0 ? radiusMeters / metersPerDegreeLng : 0.01

  return {
    minLat: coordinates.lat - latDelta,
    maxLat: coordinates.lat + latDelta,
    minLng: coordinates.lng - lngDelta,
    maxLng: coordinates.lng + lngDelta,
  }
}

