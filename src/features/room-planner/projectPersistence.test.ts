import { describe, expect, it, vi } from "vitest";
import { createInitialPlannerState } from "./defaults";
import {
  exportProjectAsJson,
  getProjectData,
  importProjectFromJson,
  MINQO_PROJECT_SCHEMA,
  MINQO_PROJECT_STORAGE_KEY,
  MINQO_PROJECT_VERSION,
  saveProjectToLocalStorage,
  serializeProjectData,
} from "./projectPersistence";
import { RoomPlannerState } from "./types";

function createSampleState(): RoomPlannerState {
  const state = createInitialPlannerState();
  return {
    ...state,
    room: { width: 5.1, length: 4.2, height: 3.0 },
    viewMode: "top",
    hiddenWalls: ["left"],
    colors: {
      floor: "#bbbbbb",
      walls: {
        front: "#111111",
        back: "#222222",
        left: "#333333",
        right: "#444444",
      },
    },
    furniture: [
      {
        id: "chair-1",
        type: "chair",
        size: [0.6, 0.85, 0.6],
        color: "#aaaaaa",
        position: [0.5, 0.425, -0.5],
        rotationY: 0.2,
        visible: true,
      },
    ],
    wallObjects: [
      {
        id: "window-1",
        type: "window",
        wallId: "front",
        width: 1.2,
        height: 1,
        depth: 0.12,
        offsetX: 0.3,
        bottom: 1.1,
        color: "#b8cad8",
        metadata: { style: "frame", material: "wood" },
        visible: true,
      },
    ],
  };
}

describe("projectPersistence", () => {
  it("returns versioned project data using a stable schema wrapper", () => {
    const result = getProjectData(createSampleState());

    expect(result.schema).toBe(MINQO_PROJECT_SCHEMA);
    expect(result.version).toBe(MINQO_PROJECT_VERSION);
    expect(result.project.room).toEqual({ width: 5.1, length: 4.2, height: 3.0 });
    expect(result.project.furniture).toHaveLength(1);
    expect(result.project.wallObjects).toHaveLength(1);
  });

  it("saves project data to localStorage with the default key", () => {
    const state = createSampleState();
    const memory = new Map<string, string>();
    const storage: Storage = {
      get length() {
        return memory.size;
      },
      clear() {
        memory.clear();
      },
      getItem(key: string) {
        return memory.get(key) ?? null;
      },
      key(index: number) {
        return Array.from(memory.keys())[index] ?? null;
      },
      removeItem(key: string) {
        memory.delete(key);
      },
      setItem(key: string, value: string) {
        memory.set(key, value);
      },
    };

    const saved = saveProjectToLocalStorage(state, { storage });
    expect(saved).toBe(true);
    const rawStored = storage.getItem(MINQO_PROJECT_STORAGE_KEY);
    expect(rawStored).not.toBeNull();

    const parsed = JSON.parse(rawStored ?? "{}");
    expect(parsed.version).toBe(MINQO_PROJECT_VERSION);
    expect(parsed.project.room.width).toBe(5.1);
    expect(parsed.project.wallObjects[0].wallId).toBe("front");
    expect(parsed.project.furniture[0].visible).toBe(true);
  });

  it("exports project data by creating a JSON download", () => {
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    const createObjectURL = vi.fn(() => "blob:minqo-project");
    const revokeObjectURL = vi.fn();

    const originalCreateObjectURL = window.URL.createObjectURL;
    const originalRevokeObjectURL = window.URL.revokeObjectURL;
    Object.defineProperty(window.URL, "createObjectURL", {
      configurable: true,
      value: createObjectURL,
    });
    Object.defineProperty(window.URL, "revokeObjectURL", {
      configurable: true,
      value: revokeObjectURL,
    });

    const exported = exportProjectAsJson(createSampleState(), { filename: "custom-project.json" });
    expect(exported).toBe(true);
    expect(createObjectURL).toHaveBeenCalledOnce();
    expect(clickSpy).toHaveBeenCalledOnce();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:minqo-project");

    Object.defineProperty(window.URL, "createObjectURL", {
      configurable: true,
      value: originalCreateObjectURL,
    });
    Object.defineProperty(window.URL, "revokeObjectURL", {
      configurable: true,
      value: originalRevokeObjectURL,
    });
    clickSpy.mockRestore();
  });

  it("imports a valid json project file", async () => {
    const sampleState = createSampleState();
    const file = new File([serializeProjectData(sampleState)], "minqo-project.json", {
      type: "application/json",
    });

    const result = await importProjectFromJson(file);
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.status).toBe("full");
    expect(result.state.room.width).toBe(sampleState.room.width);
    expect(result.state.furniture[0].rotationY).toBe(0.2);
    expect(result.state.furniture[0].visible).toBe(true);
    expect(result.state.wallObjects[0].type).toBe("window");
    expect(result.state.wallObjects[0].visible).toBe(true);
  });

  it("rejects non-json files before parsing", async () => {
    const file = new File([serializeProjectData(createSampleState())], "minqo-project.txt", {
      type: "text/plain",
    });

    const result = await importProjectFromJson(file);
    expect(result.ok).toBe(false);
  });
});
