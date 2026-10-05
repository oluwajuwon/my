export type Confidence = "low" | "medium" | "high";
export const confidenceFor = (sampleSize: number, activeDays: number, spreadRatio = 0): Confidence => {
  if (sampleSize < 4 || activeDays < 3) return "low";
  if (sampleSize >= 10 && activeDays >= 7 && spreadRatio <= .45) return "high";
  return "medium";
};
export const confidenceLanguage = (confidence: Confidence): string => confidence === "high" ? "We’ve noticed" : confidence === "medium" ? "A pattern may be forming" : "Nest is still learning";
