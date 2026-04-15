import { describe, expect, it } from "vitest";
import { FurnitureItem, FurnitureType } from "./types";
import { getFurnitureDisplayNames } from "./furnitureNaming";

function createFurnitureItem(id: string, type: FurnitureType): FurnitureItem {
  return {
    id,
    type,
    size: [1, 1, 1],
    color: "#000000",
    position: [0, 0.5, 0],
    rotationY: 0,
  };
}

describe("getFurnitureDisplayNames", () => {
  it("uses separate counters per furniture type", () => {
    const items: FurnitureItem[] = [
      createFurnitureItem("table-1", "table"),
      createFurnitureItem("chair-1", "chair"),
      createFurnitureItem("lamp-1", "lamp"),
      createFurnitureItem("chair-2", "chair"),
      createFurnitureItem("table-2", "table"),
      createFurnitureItem("chair-3", "chair"),
    ];

    const names = getFurnitureDisplayNames(items);
    expect(items.map((item) => names[item.id])).toEqual([
      "Table",
      "Chair",
      "Lamp",
      "Chair 2",
      "Table 2",
      "Chair 3",
    ]);
  });

  it("renumbers remaining items after deletion", () => {
    const allChairs = [
      createFurnitureItem("chair-1", "chair"),
      createFurnitureItem("chair-2", "chair"),
      createFurnitureItem("chair-3", "chair"),
    ];
    const remainingAfterDelete = allChairs.slice(1);

    const names = getFurnitureDisplayNames(remainingAfterDelete);
    expect(remainingAfterDelete.map((item) => names[item.id])).toEqual(["Chair", "Chair 2"]);
  });
});
