export const CATEGORIES = ["danger", "blocked-path", "protest", "event", "crime-alert"] as const

export const CATEGORY_COLORS = {
  danger: "oklch(0.58 0.22 25)",
  "blocked-path": "oklch(0.7 0.15 60)",
  protest: "oklch(0.7 0.15 60)",
  event: "oklch(0.55 0.17 250)",
  "crime-alert": "oklch(0.35 0.15 25)",
}

export const CATEGORY_ICONS = {
  danger: "⚠️",
  "blocked-path": "🚧",
  protest: "📢",
  event: "📅",
  "crime-alert": "🚨",
}

export const CATEGORY_LABELS = {
  danger: "Danger",
  "blocked-path": "Blocked Path",
  protest: "Protest",
  event: "Event",
  "crime-alert": "Crime Alert",
}

