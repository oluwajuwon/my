import { applyActivity, createActivity, undoActivity } from "./activity";
import { createDemoData } from "../data/demoData";

describe("Nest activity flow", () => {
  const now = new Date("2026-10-02T08:00:00.000Z");

  it("creates an activity with the selected child and parent", () => {
    const data = createDemoData(now);
    const activity = createActivity({ type: "bottle", amountMl: 120, milk: "formula" }, data, "child-maya", "user-ama", now);
    expect(activity).toMatchObject({ childId: "child-maya", createdBy: "user-ama", type: "bottle", metadata: { amountMl: 120 } });
  });

  it("updates and restores nappy inventory with log and undo", () => {
    const data = createDemoData(now);
    const activity = createActivity({ type: "nappy", kind: "wet" }, data, "child-maya", "user-ama", now);
    const updated = applyActivity(data, activity);
    expect(updated.supplies.find((supply) => supply.category === "nappies").quantity).toBe(17);
    expect(undoActivity(updated, activity).supplies.find((supply) => supply.category === "nappies").quantity).toBe(18);
  });
});
