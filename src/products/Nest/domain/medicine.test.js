import { createActivity } from "./activity";
import { findRecentMedicineLog } from "./medicine";
import { createDemoData } from "../data/demoData";

describe("Nest medicine safety", () => {
  it("detects a recent configured medicine log", () => {
    const now = new Date("2026-10-02T08:00:00.000Z");
    const data = createDemoData(now);
    expect(findRecentMedicineLog(data.activities, "medicine-vitamin-d", "child-maya", now)).not.toBeNull();
  });

  it("creates a medicine log from the configured dose without inventing guidance", () => {
    const now = new Date("2026-10-02T08:00:00.000Z");
    const data = createDemoData(now);
    const activity = createActivity({ type: "medicine", medicineId: "medicine-vitamin-d" }, data, "child-maya", "user-ama", now);
    expect(activity).toMatchObject({ type: "medicine", metadata: { name: "Vitamin D", dose: 1, unit: "drop" }, createdBy: "user-ama" });
  });
});
