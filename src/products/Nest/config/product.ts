export const productConfig = {
  name: "Nest",
  tagline: "Care, shared.",
  description: "A shared operating system for raising your child.",
  currency: "GBP",
  currencySymbol: "£",
  units: { bottle: "ml", temperature: "°C", weight: "kg" },
  theme: {
    sage: "#667c6a",
    terracotta: "#b76e54",
    cream: "#f7f3eb",
    charcoal: "#28312d",
  },
} as const;

export const NEST_BASE_PATH = "/nest";
