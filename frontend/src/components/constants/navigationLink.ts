export const NAVIGATION_HEADER_LINK = {
  DASHBOARD: { label: "dashboard", link: "/dashboard" },
  WATCH: { label: "watch", link: "/watch" },
  CALENDAR: { label: "upcoming", link: "/upcoming" },
  SEARCH: { label: "search", link: "/search" }
} as const;

export const NAVIGATION_FOOTER_LINK = {
  LEGAL: { label: "legal", link: "/legal" },
  PRIVACY: { label: "privacy", link: "/privacy" },
  TERMS: { label: "terms", link: "/terms" },
  CREDITS: { label: "credits", link: "/credits" },
  CHANGELOG: { label: "changelog", link: "/changelog" }
} as const;
