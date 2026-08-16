export const HEADING_STYLE = {
  1: "text-3xl font-bold",
  2: "text-xl font-bold",
  3: "text-lg font-bold",
  4: "text-base font-semibold",
  5: "text-sm font-semibold"
} as const;
export type HeadingLevel = keyof typeof HEADING_STYLE;

export const TEXT_STYLE = {
  base: "text-base",
  muted: "text-sm text-muted-foreground",
  small: "text-sm"
} as const;
export type TextVariant = keyof typeof TEXT_STYLE;

export const ABSOLUTE_STYLE = {
  "right-center": "absolute right-4 top-1/2 z-10 -translate-y-1/2 whitespace-nowrap",
  "left-center": "absolute left-4 top-1/2 z-10 -translate-y-1/2 whitespace-nowrap"
} as const;
export type AbsoluteStyle = keyof typeof ABSOLUTE_STYLE;
