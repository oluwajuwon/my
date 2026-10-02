import { applyActivity, createActivity } from "./activity";
import { generateChildBrief } from "./brief";
import { createDemoData } from "../data/demoData";

describe("Nest Brief", () => {
  const now = new Date("2026-10-02T08:00:00.000Z");

  it("derives current state, latest events and needs from shared data", () => {
    const data = createDemoData(now);
    const brief = generateChildBrief(data, "child-maya", now);
    expect(brief.currentState).toBe("sleeping");
    expect(brief.lastFeed.label).toContain("120ml");
    expect(brief.lastNappy.label).toBe("Wet");
    expect(brief.attention.some((item) => item.id === "supply-nappies")).toBe(true);
  });

  it("removes the daily medicine reminder immediately after medicine is logged", () => {
    const initial = createDemoData(now);
    const withoutLogs = { ...initial, activities: initial.activities.filter((item) => item.type !== "medicine") };
    expect(generateChildBrief(withoutLogs, "child-maya", now).attention.some((item) => item.id === "medicine-vitamin-d")).toBe(true);
    const log = createActivity({ type: "medicine", medicineId: "medicine-vitamin-d" }, withoutLogs, "child-maya", "user-ama", now);
    expect(generateChildBrief(applyActivity(withoutLogs, log), "child-maya", now).attention.some((item) => item.id === "medicine-vitamin-d")).toBe(false);
  });
});
