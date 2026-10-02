import { calculateChildSummary, formatDuration } from "./insights";
import { estimateSupplyRunOut } from "./supplies";
import { createDemoData } from "../data/demoData";

describe("Nest insights", () => {
  it("derives summaries from the shared activity stream", () => {
    const now = new Date("2026-10-02T12:00:00.000Z");
    const data = createDemoData(now);
    const summary = calculateChildSummary(data.activities, "child-maya", now);
    expect(summary.averageBottleMl).toBeGreaterThan(90);
    expect(summary.nappiesPerDay).toBeGreaterThan(5);
    expect(summary.longestSleepMs).toBeGreaterThan(8 * 60 * 60 * 1000);
  });

  it("formats durations and estimates stock run-out", () => {
    expect(formatDuration(92 * 60000)).toBe("1h 32m");
    expect(estimateSupplyRunOut({ quantity: 19, estimatedDailyUsage: 6.8 })).toBe(2);
  });
});
