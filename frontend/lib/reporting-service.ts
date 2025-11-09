import type { SupabaseClient } from "@supabase/supabase-js"
import type { EventRow } from "@/lib/event-transformer"
import type { EventStatus } from "@/types"

const STATUS_POINTS: Record<EventStatus, number> = {
  pending: 0,
  valid: 1,
  spam: -1,
  false: -1,
}

const INVALID_STATUSES = new Set<EventStatus>(["spam", "false"])
const DAY_IN_MS = 24 * 60 * 60 * 1000
const BAN_DURATIONS_DAYS = [1, 2, 7]

type ProfileMetricsRow = {
  id: string
  report_score: number | null
  report_level: number | null
  total_valid_reports: number | null
  total_invalid_reports: number | null
  report_ban_until: string | null
  report_ban_tier: number | null
  premium_until: string | null
}

const ensureProfileRow = async (
  supabase: SupabaseClient,
  profileId: string,
): Promise<ProfileMetricsRow> => {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, report_score, report_level, total_valid_reports, total_invalid_reports, report_ban_until, report_ban_tier, premium_until",
    )
    .eq("id", profileId)
    .maybeSingle()

  if (error && error.code !== "PGRST116") {
    console.error("[reporting-service] Failed to load profile metrics:", error)
    throw new Error("Failed to load profile metrics.")
  }

  if (data) {
    return data as ProfileMetricsRow
  }

  const { data: inserted, error: insertError } = await supabase
    .from("profiles")
    .insert({ id: profileId })
    .select(
      "id, report_score, report_level, total_valid_reports, total_invalid_reports, report_ban_until, report_ban_tier, premium_until",
    )
    .single()

  if (insertError || !inserted) {
    console.error("[reporting-service] Failed to create profile metrics row:", insertError)
    throw new Error("Failed to initialize profile metrics.")
  }

  return inserted as ProfileMetricsRow
}

const calculateBanUntil = (
  previousTier: number,
  nextTier: number,
  currentBanUntil: string | null,
): { tier: number; banUntil: string | null } => {
  const now = new Date()
  const existingBanUntil = currentBanUntil ? new Date(currentBanUntil) : null

  if (nextTier > previousTier) {
    const scheduleIndex = Math.min(nextTier, BAN_DURATIONS_DAYS.length) - 1
    const durationDays =
      BAN_DURATIONS_DAYS[scheduleIndex] ?? BAN_DURATIONS_DAYS[BAN_DURATIONS_DAYS.length - 1]
    const base = existingBanUntil && existingBanUntil > now ? existingBanUntil : now
    const banUntil = new Date(base.getTime() + durationDays * DAY_IN_MS)
    return { tier: nextTier, banUntil: banUntil.toISOString() }
  }

  if (nextTier <= 0) {
    return { tier: 0, banUntil: null }
  }

  return {
    tier: nextTier,
    banUntil: currentBanUntil,
  }
}

const extendPremium = (
  previousLevel: number,
  nextLevel: number,
  currentPremiumUntil: string | null,
): string | null => {
  const levelsGained = Math.max(0, nextLevel - previousLevel)
  if (levelsGained === 0) {
    return currentPremiumUntil
  }

  const now = new Date()
  const existing = currentPremiumUntil ? new Date(currentPremiumUntil) : null
  const base = existing && existing > now ? existing : now
  const extensionMs = levelsGained * 7 * DAY_IN_MS
  return new Date(base.getTime() + extensionMs).toISOString()
}

const clampNonNegative = (value: number) => (value < 0 ? 0 : value)

const coerceStatus = (status: unknown): EventStatus => {
  if (status === "valid" || status === "spam" || status === "false" || status === "pending") {
    return status
  }
  return "pending"
}

const applyReporterMetrics = async (
  supabase: SupabaseClient,
  reporterId: string,
  previousStatus: EventStatus,
  nextStatus: EventStatus,
) => {
  const profile = await ensureProfileRow(supabase, reporterId)

  const currentScore = profile.report_score ?? 0
  const currentLevel = profile.report_level ?? 0
  const currentValid = profile.total_valid_reports ?? 0
  const currentInvalid = profile.total_invalid_reports ?? 0
  const currentBanTier = profile.report_ban_tier ?? 0

  const scoreDelta = STATUS_POINTS[nextStatus] - STATUS_POINTS[previousStatus]
  const validDelta = (nextStatus === "valid" ? 1 : 0) - (previousStatus === "valid" ? 1 : 0)
  const invalidDelta =
    (INVALID_STATUSES.has(nextStatus) ? 1 : 0) - (INVALID_STATUSES.has(previousStatus) ? 1 : 0)

  const nextScore = currentScore + scoreDelta
  const nextValid = clampNonNegative(currentValid + validDelta)
  const nextInvalid = clampNonNegative(currentInvalid + invalidDelta)
  const nextLevel = clampNonNegative(Math.floor(Math.max(nextScore, 0) / 20))

  const { tier: nextBanTier, banUntil } = calculateBanUntil(
    currentBanTier,
    Math.floor(nextInvalid / 3),
    profile.report_ban_until,
  )

  const premiumUntil = extendPremium(currentLevel, nextLevel, profile.premium_until)

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      report_score: nextScore,
      report_level: nextLevel,
      total_valid_reports: nextValid,
      total_invalid_reports: nextInvalid,
      report_ban_tier: nextBanTier,
      report_ban_until: banUntil,
      premium_until: premiumUntil,
    })
    .eq("id", reporterId)

  if (updateError) {
    console.error("[reporting-service] Failed to update profile metrics:", updateError)
    throw new Error("Failed to update reporter metrics.")
  }
}

export const applyEventStatusUpdate = async (
  supabase: SupabaseClient,
  eventId: string,
  nextStatus: EventStatus,
): Promise<EventRow> => {
  const { data: currentRow, error: fetchError } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .maybeSingle()

  if (fetchError) {
    console.error("[reporting-service] Failed to load event:", fetchError)
    throw new Error(fetchError.message)
  }

  if (!currentRow) {
    throw new Error("Event not found.")
  }

  const previousStatus = coerceStatus((currentRow as EventRow & { status?: string }).status)

  if (previousStatus === nextStatus) {
    return currentRow as EventRow
  }

  const { data: updatedRows, error: updateError } = await supabase
    .from("events")
    .update({ status: nextStatus })
    .eq("id", eventId)
    .select("*")
    .maybeSingle()

  if (updateError || !updatedRows) {
    console.error("[reporting-service] Failed to update event status:", updateError)
    throw new Error(updateError?.message ?? "Failed to update event status.")
  }

  const reporterId = (currentRow as { reporter_id?: string | null }).reporter_id
  if (reporterId) {
    await applyReporterMetrics(supabase, reporterId, previousStatus, nextStatus)
  }

  return updatedRows as EventRow
}

