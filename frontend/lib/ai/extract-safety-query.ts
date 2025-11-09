import { GoogleGenerativeAI, type GenerationConfig } from "@google/generative-ai"
import { z } from "zod"
import type { Category, Location, SafetyAdvisorRequestPayload } from "@/types"

const CATEGORY_VALUES = ["danger", "blocked-path", "event", "protest", "crime-alert"] as const

const filterSchema = z.object({
  timeframeMonths: z.number().int().positive().max(24).nullable().optional(),
  categories: z.array(z.enum(CATEGORY_VALUES)).max(5).optional(),
  locationKeywords: z.array(z.string().min(2).max(60)).max(6).optional(),
  radiusMeters: z.number().int().positive().max(25000).optional(),
  coordinates: z
    .object({
      lat: z.number().finite(),
      lng: z.number().finite(),
    })
    .optional(),
  summary: z.string().min(1).max(400).optional(),
})

type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

export interface SafetyQueryFilters {
  timeframeMonths: number | null
  categories: Category[]
  locationKeywords: string[]
  radiusMeters: number | null
  coordinates: Location | null
  summary: string
}

interface ExtractFiltersArgs {
  apiKey: string
  model: string
  payload: SafetyAdvisorRequestPayload
  messages: ChatMessage[]
}

const DEFAULT_FILTERS: Readonly<SafetyQueryFilters> = {
  timeframeMonths: null,
  categories: [],
  locationKeywords: [],
  radiusMeters: null,
  coordinates: null,
  summary: "No additional filters were derived; using defaults from the request.",
}

export async function extractSafetyQueryFilters({
  apiKey,
  model,
  payload,
  messages,
}: ExtractFiltersArgs): Promise<SafetyQueryFilters> {
  const fallback: SafetyQueryFilters = {
    ...DEFAULT_FILTERS,
    timeframeMonths: normalizeTimeframe(payload.timeframeMonths),
    coordinates: payload.coordinates ?? null,
    summary:
      payload.timeframeMonths || payload.coordinates
        ? buildFallbackSummary(payload)
        : DEFAULT_FILTERS.summary,
  }

  if (!apiKey) {
    return fallback
  }

  try {
    const client = new GoogleGenerativeAI(apiKey)
    const generativeModel = client.getGenerativeModel({ model })

    const generationConfig: GenerationConfig = {
      responseMimeType: "application/json",
      temperature: 0.2,
    }

    const requestOutline = buildFilterRequestPrompt(payload, messages)

    const result = await generativeModel.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: requestOutline }],
        },
      ],
      generationConfig,
    })

    const textResponse = result.response?.text()
    if (!textResponse) {
      return fallback
    }

    const jsonString = coerceJsonString(textResponse)
    const parsed = filterSchema.safeParse(JSON.parse(jsonString))

    if (!parsed.success) {
      console.warn("[extractSafetyQueryFilters] Schema validation failed", parsed.error.flatten())
      return fallback
    }

    const data = parsed.data

    const timeframeMonths = normalizeTimeframe(
      data.timeframeMonths ?? payload.timeframeMonths ?? null,
    )

    const categories = dedupeCategories(data.categories ?? [])

    const locationKeywords = dedupeStrings([
      ...(data.locationKeywords ?? []),
      ...(payload.areaName ? [payload.areaName] : []),
    ])

    const radiusMeters =
      typeof data.radiusMeters === "number" && Number.isFinite(data.radiusMeters)
        ? Math.max(50, Math.min(data.radiusMeters, 25000))
        : null

    const coordinates = data.coordinates
      ? { lat: data.coordinates.lat, lng: data.coordinates.lng }
      : payload.coordinates ?? null

    return {
      timeframeMonths,
      categories,
      locationKeywords,
      radiusMeters,
      coordinates,
      summary:
        data.summary?.trim() ||
        buildSummaryFromFilters({ timeframeMonths, categories, locationKeywords, radiusMeters }),
    }
  } catch (error) {
    console.error("[extractSafetyQueryFilters] Failed to derive filters", error)
    return fallback
  }
}

function buildFilterRequestPrompt(payload: SafetyAdvisorRequestPayload, messages: ChatMessage[]) {
  const latestUserMessage =
    [...messages]
      .reverse()
      .find((message) => message.role === "user")
      ?.content?.trim() || payload.userQuery

  const systemInstructions = `
You analyze safety-related user questions and return a compact JSON object describing how to filter a database of urban events.

Allowed event categories (lowercase strings): ${CATEGORY_VALUES.join(", ")}.

When you are unsure about a field, omit it.

Respond **only** with JSON matching this TypeScript interface:
{
  "timeframeMonths"?: number | null,
  "categories"?: string[],
  "locationKeywords"?: string[],
  "radiusMeters"?: number,
  "coordinates"?: { "lat": number, "lng": number },
  "summary"?: string
}

Constraints:
- timeframeMonths must be between 1 and 24 when provided.
- radiusMeters should reflect practical walking distances (50m–25000m).
- locationKeywords should be concise neighborhood names, street names, or landmarks (<= 4 words each).
- Prefer the provided coordinates when the user request is about the current location; otherwise, infer from the query if explicit.
- Try to include a short natural-language summary (~1 sentence) describing the derived filters.
`

  return `${systemInstructions}

Request type: ${payload.requestType}
Declared timeframe (months): ${payload.timeframeMonths ?? "unspecified"}
Declared coordinates: ${
    payload.coordinates ? `${payload.coordinates.lat}, ${payload.coordinates.lng}` : "none"
  }

Latest user message:
"""
${latestUserMessage}
"""
`
}

function normalizeTimeframe(timeframe: number | null | undefined): number | null {
  if (typeof timeframe !== "number" || Number.isNaN(timeframe)) {
    return null
  }
  const clamped = Math.max(1, Math.min(Math.round(timeframe), 24))
  return clamped
}

function dedupeCategories(categories: Category[]): Category[] {
  const filtered = categories.filter((category): category is Category =>
    CATEGORY_VALUES.includes(category as (typeof CATEGORY_VALUES)[number]),
  )
  return Array.from(new Set(filtered))
}

function dedupeStrings(values: string[]): string[] {
  return Array.from(
    new Set(
      values
        .map((value) => value?.trim())
        .filter((value): value is string => !!value && value.length >= 2 && value.length <= 60),
    ),
  )
}

function coerceJsonString(raw: string): string {
  const trimmed = raw.trim()
  if (trimmed.startsWith("```")) {
    const withoutFence = trimmed.replace(/^```[a-zA-Z0-9-]*\s*/, "").replace(/```$/, "")
    return withoutFence.trim()
  }
  return trimmed
}

function buildFallbackSummary(payload: SafetyAdvisorRequestPayload): string {
  const parts: string[] = []
  if (payload.timeframeMonths) {
    parts.push(`Timeframe limited to the last ${normalizeTimeframe(payload.timeframeMonths)} months.`)
  }
  if (payload.coordinates) {
    parts.push("Using provided coordinates as the central point.")
  }
  return parts.join(" ") || DEFAULT_FILTERS.summary
}

function buildSummaryFromFilters({
  timeframeMonths,
  categories,
  locationKeywords,
  radiusMeters,
}: {
  timeframeMonths: number | null
  categories: Category[]
  locationKeywords: string[]
  radiusMeters: number | null
}): string {
  const parts: string[] = []

  if (timeframeMonths) {
    parts.push(`Events from the last ${timeframeMonths} month${timeframeMonths > 1 ? "s" : ""}.`)
  }

  if (categories.length > 0) {
    const readable = categories.join(", ")
    parts.push(`Categories: ${readable}.`)
  }

  if (locationKeywords.length > 0) {
    parts.push(`Keyword focus: ${locationKeywords.join(", ")}.`)
  }

  if (radiusMeters) {
    parts.push(`Radius: ~${Math.round(radiusMeters)} meters.`)
  }

  return parts.join(" ") || DEFAULT_FILTERS.summary
}

