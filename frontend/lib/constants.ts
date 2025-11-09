export const CATEGORIES = ["danger", "blocked-path", "event", "protest", "crime-alert"] as const

export const CATEGORY_COLORS = {
  danger: "oklch(0.6 0.26 29)",
  "blocked-path": "oklch(0.67 0.13 250)",
  event: "oklch(0.78 0.17 150)",
  protest: "oklch(0.82 0.11 95)",
  "crime-alert": "oklch(0.55 0.22 29)",
}

export const CATEGORY_ICONS = {
  danger: "🚨",
  "blocked-path": "🚦",
  event: "🎉",
  protest: "✊",
  "crime-alert": "🚔",
}

export const CATEGORY_LABELS = {
  danger: "Danger",
  "blocked-path": "Blocked path",
  event: "Event",
  protest: "Protest",
  "crime-alert": "Crime alert",
}

