import { describe, expect, it } from "vitest";
import { importProjectFromJsonText } from "./projectImport";

describe("importProjectFromJsonText", () => {
  it("imports native Minqo project files without marking partial import", () => {
    const result = importProjectFromJsonText(
      JSON.stringify({
        schema: "minqo-project",
        version: 1,
        project: {
          room: { width: 5.2, length: 4.1, height: 2.9 },
          colors: {
            floor: "#aabbcc",
            walls: {
              front: "#111111",
              back: "#222222",
              left: "#333333",
              right: "#444444",
            },
          },
          viewMode: "top",
          hiddenWalls: ["left"],
          furniture: [
            {
              id: "lamp-1",
              type: "lamp",
              size: [0.3, 1.4, 0.3],
              color: "#cccccc",
              position: [0.5, 0.7, -0.4],
              rotationY: 0.25,
              visible: false,
            },
          ],
          wallObjects: [
            {
              id: "window-1",
              type: "window",
              wallId: "back",
              width: 1.3,
              height: 1.1,
              depth: 0.12,
              offsetX: 0.4,
              bottom: 1,
              color: "#c3d4df",
              visible: true,
            },
          ],
        },
      }),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.status).toBe("full");
    expect(result.state.room).toEqual({ width: 5.2, length: 4.1, height: 2.9 });
    expect(result.state.viewMode).toBe("top");
    expect(result.state.hiddenWalls).toEqual(["left"]);
    expect(result.state.furniture).toHaveLength(1);
    expect(result.state.furniture[0].type).toBe("lamp");
    expect(result.state.furniture[0].visible).toBe(false);
    expect(result.state.wallObjects).toHaveLength(1);
    expect(result.state.wallObjects[0].wallId).toBe("back");
    expect(result.state.wallObjects[0].visible).toBe(true);
  });

  it("normalizes compatible external aliases into Minqo schema", () => {
    const result = importProjectFromJsonText(
      JSON.stringify({
        roomWidth: 6,
        depth: "4.5",
        roomHeight: 3,
        wallColors: {
          north: "#121212",
          south: "#343434",
          west: "#565656",
          east: "#787878",
        },
        floorMaterial: "#999999",
        objects: [
          {
            kind: "couch",
            dimensions: { width: 2, depth: 0.9, height: 1 },
            position: { x: 1.25, z: -0.75 },
            color: "#b0b0b0",
          },
        ],
        openings: [
          {
            type: "window",
            wall: "east",
            openingWidth: 1.4,
            openingHeight: 1.1,
            thickness: 0.12,
            positionAlongWall: 0.4,
            heightFromFloor: 1.2,
            hidden: true,
          },
        ],
      }),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.status).toBe("full");
    expect(result.state.room).toEqual({ width: 6, length: 4.5, height: 3 });
    expect(result.state.colors.floor).toBe("#999999");
    expect(result.state.colors.walls.front).toBe("#121212");
    expect(result.state.colors.walls.back).toBe("#343434");
    expect(result.state.furniture).toHaveLength(1);
    expect(result.state.furniture[0].type).toBe("sofa");
    expect(result.state.furniture[0].position[1]).toBe(0.5);
    expect(result.state.furniture[0].visible).toBe(true);
    expect(result.state.wallObjects).toHaveLength(1);
    expect(result.state.wallObjects[0].type).toBe("window");
    expect(result.state.wallObjects[0].wallId).toBe("right");
    expect(result.state.wallObjects[0].bottom).toBe(1.2);
    expect(result.state.wallObjects[0].visible).toBe(false);
  });

  it("returns partial import when unsupported furniture entries are skipped", () => {
    const result = importProjectFromJsonText(
      JSON.stringify({
        dimensions: { width: 5, length: 4, height: 3 },
        items: [
          { type: "chair", color: "#aaaaaa" },
          { type: "piano", position: [1, 0, 2] },
          { foo: "bar" },
        ],
      }),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.status).toBe("partial");
    expect(result.skippedFurnitureCount).toBe(2);
    expect(result.state.furniture).toHaveLength(1);
    expect(result.state.furniture[0].type).toBe("chair");
    expect(result.state.furniture[0].position).toEqual([0, 0.425, 0]);
    expect(result.state.furniture[0].rotationY).toBe(0);
    expect(result.state.furniture[0].visible).toBe(true);
  });

  it("fails for clearly unsupported project structures", () => {
    const result = importProjectFromJsonText(JSON.stringify({ foo: "bar" }));
    expect(result.ok).toBe(false);
  });

  it("fails for invalid JSON text", () => {
    const result = importProjectFromJsonText("{not-json");
    expect(result.ok).toBe(false);
  });
});
