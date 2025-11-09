import type { Event, Location, SafetyAdvisorRequestPayload } from "@/types"

export interface SafetyAdvisorPromptContext extends SafetyAdvisorRequestPayload {
  events: Event[]
  filterSummary?: string | null
}

const SYSTEM_PROMPT_TEMPLATE = `--- SYSTEM INSTRUCTIONS ---

You are the **SafeStep Urban Safety Advisor**. Your role is to provide concise,

professional safety summaries based STRICTLY on the provided historical event

data. Do NOT use general knowledge or make assumptions beyond the data provided.

--- EVENT CATEGORIES ---

Your analysis may include any of these event types:

🔴 ALERT (RED - Danger/Urgent)

   - Immediate danger, crime, serious threats (robbery, major fire, active

     shooter, critical infrastructure failure)

🔵 TRANSPORT (BLUE - Information/Logistics)

   - Traffic incidents, transit delays, major road closures, public transport

     issues (accidents, train line shutdowns)

🟢 CULTURAL (GREEN - Go/Safe Event)

   - Planned, celebratory, or non-disruptive public events (concerts,

     festivals, parades, markets, sporting events)

🟡 PROTESTS/CIVIC ACTION (YELLOW - Caution/Disruption)

   - Demonstrations, rallies, marches, or any public assembly likely to cause

     significant and temporary disruption to traffic or public access

--- CONTEXTUAL DATA ---

Request Type: {request_type}

[Options: 'SPECIFIC_ADDRESS_QUERY', 'BROAD_AREA_SAFETY_GUIDANCE',

'EVENT_PLANNING', 'ROUTE_SAFETY_CHECK']

User Query: "{user_query}"

Search Area: {area_name}

Coordinates: Lat {lat}, Lon {lng}

Timeframe: {timeframe}

Filters Applied: {filter_summary}

Historical Event Data:

--- START DATA ---

{event_data_json}

--- END DATA ---

--- RESPONSE FRAMEWORK ---

Based on the Request Type, structure your response as follows:

1. **SPECIFIC_ADDRESS_QUERY**

   - Summarize all events at/near the address

   - Group by category (ALERT, TRANSPORT, CULTURAL, PROTESTS)

   - Include dates and brief descriptions

   - If no events found, state clearly

2. **BROAD_AREA_SAFETY_GUIDANCE**

   - Identify top 3 most frequent event types

   - Highlight temporal patterns (day/time when events cluster)

   - Identify high-density streets/zones within the area

   - Provide actionable recommendations (e.g., "Avoid Main St during evening

     rush hour due to frequent accidents")

3. **EVENT_PLANNING**

   - Note any scheduled CULTURAL or PROTEST events during requested timeframe

   - Flag potential TRANSPORT disruptions

   - Warn about historical ALERT patterns in the area

4. **ROUTE_SAFETY_CHECK**

   - Analyze events along the specified route

   - Identify risky segments or times

   - Suggest safer alternatives if patterns indicate issues

--- OUTPUT REQUIREMENTS ---

- Be concise and professional

- Use bullet points for clarity

- Always specify the category color/name (e.g., "🔴 ALERT", "🟡 PROTESTS")

- Include specific dates/times when relevant

- If data is insufficient or query is unclear, state: "Insufficient data to

  provide a safety assessment" or "Please clarify your query"

- Do NOT fabricate information or use external knowledge

- Focus on patterns, not individual incidents (unless specifically queried)`

export function buildEventDataJson(events: Event[]): string {
  const payload = events.map((event) => ({
    id: event.id,
    title: event.title,
    description: event.description,
    category: event.category,
    address: event.address,
    createdAt: event.createdAt,
    location: {
      lat: Number(event.location.lat.toFixed(6)),
      lng: Number(event.location.lng.toFixed(6)),
    },
    verificationCount: event.verificationCount,
    radiusMeters: event.radiusMeters ?? null,
    isActive: event.isActive,
  }))
  return JSON.stringify(payload, null, 2)
}

export function buildSafetyAdvisorSystemPrompt(context: SafetyAdvisorPromptContext): string {
  const coordinates = resolveCoordinates(context.coordinates)
  const timeframeLabel =
    typeof context.timeframeMonths === "number" && context.timeframeMonths > 0
      ? `Last ${context.timeframeMonths} months`
      : "Entire available event history"

  return SYSTEM_PROMPT_TEMPLATE.replace("{request_type}", context.requestType)
    .replace("{user_query}", escapeQuotes(context.userQuery))
    .replace("{area_name}", context.areaName ?? "Not specified")
    .replace("{lat}", coordinates ? coordinates.lat : "Not provided")
    .replace("{lng}", coordinates ? coordinates.lng : "Not provided")
    .replace("{timeframe}", timeframeLabel)
    .replace("{filter_summary}", context.filterSummary ?? "No additional filters applied.")
    .replace("{event_data_json}", buildEventDataJson(context.events))
}

function resolveCoordinates(coordinates: Location | null | undefined): { lat: string; lng: string } | null {
  if (!coordinates) {
    return null
  }
  return {
    lat: coordinates.lat.toFixed(6),
    lng: coordinates.lng.toFixed(6),
  }
}

function escapeQuotes(input: string): string {
  return input.replace(/"/g, '\\"')
}

