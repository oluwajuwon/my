import { generateHandoverSummary } from "./handover";
import { createDemoData } from "../data/demoData";

describe("parent handover", () => {
  it("summarises care, authorship and needs over a preset period", () => {
    const now = new Date("2026-10-02T08:00:00.000Z");
    const summary = generateHandoverSummary(createDemoData(now), "child-maya", "8-hours", now);
    expect(summary.eventCount).toBeGreaterThan(0);
    expect(summary.feeds.count).toBeGreaterThan(0);
    expect(summary.sleep.count).toBeGreaterThan(0);
    expect(summary.nappies.count).toBeGreaterThan(0);
    expect(summary.medicines[0].createdBy).toBe("user-daniel");
    expect(summary.attention.some((item) => item.kind === "supply")).toBe(true);
  });
});
