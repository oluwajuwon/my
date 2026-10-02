import { addSupplyToShoppingList, completePurchase, estimateSupplyRunOut, getSupplyStatus } from "./supplies";
import { createDemoData } from "../data/demoData";

describe("Nest supplies and purchases", () => {
  const now = new Date("2026-10-02T08:00:00.000Z");

  it("estimates run-out and gives a labelled status", () => {
    const nappies = createDemoData(now).supplies.find((supply) => supply.id === "supply-nappies");
    expect(estimateSupplyRunOut(nappies)).toBe(2);
    expect(getSupplyStatus(nappies)).toBe("running-low");
  });

  it("adds each tracked supply to the list only once", () => {
    const data = { ...createDemoData(now), shoppingItems: [] };
    const once = addSupplyToShoppingList(data, "supply-formula", now);
    const twice = addSupplyToShoppingList(once, "supply-formula", now);
    expect(twice.shoppingItems).toHaveLength(1);
    expect(twice.shoppingItems[0].supplyId).toBe("supply-formula");
  });

  it("one purchase replenishes supply, completes the item and creates an expense", () => {
    const data = createDemoData(now);
    const purchased = completePurchase(data, { shoppingItemId: "shopping-nappies", quantity: 48, pricePence: 1200 }, now);
    expect(purchased.supplies.find((supply) => supply.id === "supply-nappies").quantity).toBe(66);
    expect(purchased.shoppingItems.find((item) => item.id === "shopping-nappies").completed).toBe(true);
    expect(purchased.expenses[0]).toMatchObject({ amountPence: 1200, description: "Pampers Size 2" });
  });
});
