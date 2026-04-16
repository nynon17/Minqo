import { useState } from "react";
import {
  Dimensions,
  FurnitureItem,
  FurnitureType,
  RoomPlannerController,
  RoomPlannerState,
  ViewMode,
  WallObjectItem,
  WallObjectType,
  WallId,
} from "./types";
import {
  createInitialPlannerState,
  DEFAULT_COLORS,
  DEFAULT_ROOM,
  DEFAULT_VIEW_MODE,
  FURNITURE_PRESETS,
  VIEW_MODES,
  WALL_OBJECT_PRESETS,
  WALL_IDS,
} from "./defaults";
import { clampWallObjectToRoom } from "./wallObjectPlacement";
import { getVisibleWalls } from "./wallVisibility";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function sameWalls(a: WallId[], b: WallId[]) {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function isWallId(value: unknown): value is WallId {
  return typeof value === "string" && WALL_IDS.includes(value as WallId);
}

function isViewMode(value: unknown): value is ViewMode {
  return typeof value === "string" && VIEW_MODES.includes(value as ViewMode);
}
function isWallObjectType(value: unknown): value is WallObjectType {
  return value === "window" || value === "door";
}

function createImportedFurnitureId(index: number): string {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `imported-${index + 1}`;
}

function createImportedWallObjectId(index: number): string {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `imported-wall-object-${index + 1}`;
}

function chooseDefaultWall(hiddenWalls: WallId[]): WallId | null {
  return getVisibleWalls(hiddenWalls)[0] ?? null;
}

function clampFurnitureToRoom(room: Dimensions, item: FurnitureItem): FurnitureItem {
  const [xSize, ySize, zSize] = item.size;
  const maxX = room.width / 2 - xSize / 2 - 0.05;
  const maxZ = room.length / 2 - zSize / 2 - 0.05;

  return {
    ...item,
    position: [
      clamp(item.position[0], -maxX, maxX),
      Math.max(ySize / 2, item.position[1]),
      clamp(item.position[2], -maxZ, maxZ),
    ],
  };
}

function sanitizeImportedState(importedState: RoomPlannerState): RoomPlannerState {
  const room = {
    width: clamp(
      Number.isFinite(importedState.room.width) ? importedState.room.width : DEFAULT_ROOM.width,
      1,
      20,
    ),
    length: clamp(
      Number.isFinite(importedState.room.length) ? importedState.room.length : DEFAULT_ROOM.length,
      1,
      20,
    ),
    height: clamp(
      Number.isFinite(importedState.room.height) ? importedState.room.height : DEFAULT_ROOM.height,
      1,
      20,
    ),
  };

  const walls: Record<WallId, string> = { ...DEFAULT_COLORS.walls };
  WALL_IDS.forEach((wall) => {
    const wallColor = importedState.colors?.walls?.[wall];
    if (typeof wallColor === "string" && wallColor.trim() !== "") {
      walls[wall] = wallColor;
    }
  });

  const floorColor =
    typeof importedState.colors?.floor === "string" && importedState.colors.floor.trim() !== ""
      ? importedState.colors.floor
      : DEFAULT_COLORS.floor;

  const hiddenWalls = importedState.hiddenWalls.filter(
    (wall, index, source) => isWallId(wall) && source.indexOf(wall) === index,
  );
  const viewMode = isViewMode(importedState.viewMode) ? importedState.viewMode : DEFAULT_VIEW_MODE;

  const furniture = importedState.furniture
    .map((item, index) => {
      const preset = FURNITURE_PRESETS[item.type];
      if (!preset) {
        return null;
      }

      const size: [number, number, number] = [
        clamp(Number.isFinite(item.size[0]) ? item.size[0] : preset.size[0], 0.1, 10),
        clamp(Number.isFinite(item.size[1]) ? item.size[1] : preset.size[1], 0.1, 10),
        clamp(Number.isFinite(item.size[2]) ? item.size[2] : preset.size[2], 0.1, 10),
      ];

      const position: [number, number, number] = [
        Number.isFinite(item.position[0]) ? item.position[0] : 0,
        Number.isFinite(item.position[1]) ? item.position[1] : size[1] / 2,
        Number.isFinite(item.position[2]) ? item.position[2] : 0,
      ];

      return clampFurnitureToRoom(room, {
        id:
          typeof item.id === "string" && item.id.trim() !== ""
            ? item.id
            : createImportedFurnitureId(index),
        type: item.type,
        size,
        color: typeof item.color === "string" && item.color.trim() !== "" ? item.color : preset.color,
        position,
        rotationY: Number.isFinite(item.rotationY) ? item.rotationY : 0,
        visible: item.visible !== false,
      });
    })
    .filter((item): item is FurnitureItem => item !== null);

  const wallObjects = (importedState.wallObjects ?? [])
    .map((item, index) => {
      if (!isWallObjectType(item?.type)) {
        return null;
      }

      const wallId = isWallId(item.wallId) ? item.wallId : "front";
      const preset = WALL_OBJECT_PRESETS[item.type];
      return clampWallObjectToRoom(room, {
        id:
          typeof item.id === "string" && item.id.trim() !== ""
            ? item.id
            : createImportedWallObjectId(index),
        type: item.type,
        wallId,
        width: Number.isFinite(item.width) ? item.width : preset.width,
        height: Number.isFinite(item.height) ? item.height : preset.height,
        depth: Number.isFinite(item.depth) ? item.depth : preset.depth,
        offsetX: Number.isFinite(item.offsetX) ? item.offsetX : 0,
        bottom: Number.isFinite(item.bottom) ? item.bottom : preset.bottom,
        color: typeof item.color === "string" && item.color.trim() !== "" ? item.color : preset.color,
        metadata: item.metadata,
        visible: item.visible !== false,
      });
    })
    .filter((item): item is WallObjectItem => item !== null);

  return {
    room,
    colors: {
      floor: floorColor,
      walls,
    },
    viewMode,
    hiddenWalls,
    furniture,
    wallObjects,
  };
}

export function useRoomPlanner(): RoomPlannerController {
  const [history, setHistory] = useState<{
    past: RoomPlannerState[];
    present: RoomPlannerState;
    future: RoomPlannerState[];
  }>({
    past: [],
    present: createInitialPlannerState(),
    future: [],
  });
  const state = history.present;

  const applyStateChange = (updater: (previous: RoomPlannerState) => RoomPlannerState) => {
    setHistory((previousHistory) => {
      const nextPresent = updater(previousHistory.present);

      if (nextPresent === previousHistory.present) {
        return previousHistory;
      }

      return {
        past: [...previousHistory.past, previousHistory.present],
        present: nextPresent,
        future: [],
      };
    });
  };

  const undo: RoomPlannerController["undo"] = () => {
    setHistory((previousHistory) => {
      if (previousHistory.past.length === 0) {
        return previousHistory;
      }

      const previousPresent = previousHistory.past[previousHistory.past.length - 1];
      return {
        past: previousHistory.past.slice(0, -1),
        present: previousPresent,
        future: [previousHistory.present, ...previousHistory.future],
      };
    });
  };

  const redo: RoomPlannerController["redo"] = () => {
    setHistory((previousHistory) => {
      if (previousHistory.future.length === 0) {
        return previousHistory;
      }

      const nextPresent = previousHistory.future[0];
      return {
        past: [...previousHistory.past, previousHistory.present],
        present: nextPresent,
        future: previousHistory.future.slice(1),
      };
    });
  };

  const setDimension: RoomPlannerController["setDimension"] = (key, rawValue) => {
    const value = Number.isFinite(rawValue) ? clamp(rawValue, 1, 20) : 1;
    applyStateChange((previous) => {
      const nextRoom = { ...previous.room, [key]: value };
      return {
        ...previous,
        room: nextRoom,
        furniture: previous.furniture.map((item) => clampFurnitureToRoom(nextRoom, item)),
        wallObjects: previous.wallObjects.map((item) => clampWallObjectToRoom(nextRoom, item)),
      };
    });
  };

  const setWallColor: RoomPlannerController["setWallColor"] = (wall, color) => {
    applyStateChange((previous) => ({
      ...previous,
      colors: {
        ...previous.colors,
        walls: {
          ...previous.colors.walls,
          [wall]: color,
        },
      },
    }));
  };

  const setAllWallsColor: RoomPlannerController["setAllWallsColor"] = (color) => {
    applyStateChange((previous) => ({
      ...previous,
      colors: {
        ...previous.colors,
        walls: {
          front: color,
          back: color,
          left: color,
          right: color,
        },
      },
    }));
  };

  const setFloorColor: RoomPlannerController["setFloorColor"] = (color) => {
    applyStateChange((previous) => ({
      ...previous,
      colors: {
        ...previous.colors,
        floor: color,
      },
    }));
  };

  const setViewMode: RoomPlannerController["setViewMode"] = (mode) => {
    applyStateChange((previous) => ({ ...previous, viewMode: mode }));
  };

  const setHiddenWalls: RoomPlannerController["setHiddenWalls"] = (walls) => {
    applyStateChange((previous) => {
      if (sameWalls(previous.hiddenWalls, walls)) {
        return previous;
      }
      return { ...previous, hiddenWalls: walls };
    });
  };

  const setFurniturePosition: RoomPlannerController["setFurniturePosition"] = (id, position) => {
    applyStateChange((previous) => {
      let changed = false;

      const nextFurniture = previous.furniture.map((item) => {
        if (item.id !== id) {
          return item;
        }

        const clamped = clampFurnitureToRoom(previous.room, {
          ...item,
          position,
        });

        const samePosition =
          item.position[0] === clamped.position[0] &&
          item.position[1] === clamped.position[1] &&
          item.position[2] === clamped.position[2];

        if (samePosition) {
          return item;
        }

        changed = true;
        return clamped;
      });

      if (!changed) {
        return previous;
      }

      return {
        ...previous,
        furniture: nextFurniture,
      };
    });
  };

  const setFurnitureVisibility: RoomPlannerController["setFurnitureVisibility"] = (id, visible) => {
    applyStateChange((previous) => {
      let changed = false;

      const nextFurniture = previous.furniture.map((item) => {
        if (item.id !== id) {
          return item;
        }

        if (item.visible === visible) {
          return item;
        }

        changed = true;
        return { ...item, visible };
      });

      if (!changed) {
        return previous;
      }

      return {
        ...previous,
        furniture: nextFurniture,
      };
    });
  };

  const removeFurniture: RoomPlannerController["removeFurniture"] = (id) => {
    applyStateChange((previous) => {
      const nextFurniture = previous.furniture.filter((item) => item.id !== id);

      if (nextFurniture.length === previous.furniture.length) {
        return previous;
      }

      return {
        ...previous,
        furniture: nextFurniture,
      };
    });
  };

  const addFurniture: RoomPlannerController["addFurniture"] = (type) => {
    applyStateChange((previous) => {
      const preset = FURNITURE_PRESETS[type];
      const index = previous.furniture.length;
      const column = index % 3;
      const row = Math.floor(index / 3);

      const tentative: FurnitureItem = {
        id: crypto.randomUUID(),
        type,
        size: preset.size,
        color: preset.color,
        position: [(column - 1) * 1.05, preset.size[1] / 2, (row - 1) * 0.95],
        rotationY: 0,
        visible: true,
      };

      const clamped = clampFurnitureToRoom(previous.room, tentative);

      return {
        ...previous,
        furniture: [...previous.furniture, clamped],
      };
    });
  };

  const clearFurniture: RoomPlannerController["clearFurniture"] = () => {
    applyStateChange((previous) => ({ ...previous, furniture: [] }));
  };

  const addWallObject: RoomPlannerController["addWallObject"] = (type, requestedWallId) => {
    const interactiveWalls = getVisibleWalls(state.hiddenWalls);
    const hasValidRequestedWall =
      typeof requestedWallId === "string" && interactiveWalls.includes(requestedWallId);
    if (!hasValidRequestedWall && interactiveWalls.length === 0) {
      return false;
    }
    applyStateChange((previous) => {
      const wallId =
        requestedWallId && isWallId(requestedWallId) && !previous.hiddenWalls.includes(requestedWallId)
          ? requestedWallId
          : chooseDefaultWall(previous.hiddenWalls);
      if (!wallId) {
        return previous;
      }
      const preset = WALL_OBJECT_PRESETS[type];
      const countOnWall = previous.wallObjects.filter((item) => item.wallId === wallId).length;
      const offsetX = ((countOnWall % 4) - 1.5) * (preset.width + 0.2);

      const nextItem = clampWallObjectToRoom(previous.room, {
        id: crypto.randomUUID(),
        type,
        wallId,
        width: preset.width,
        height: preset.height,
        depth: preset.depth,
        offsetX,
        bottom: preset.bottom,
        color: preset.color,
        visible: true,
      });

      return {
        ...previous,
        wallObjects: [...previous.wallObjects, nextItem],
      };
    });
    return true;
  };

  const setWallObjectPlacement: RoomPlannerController["setWallObjectPlacement"] = (id, updates) => {
    applyStateChange((previous) => {
      let changed = false;

      const nextWallObjects = previous.wallObjects.map((item) => {
        if (item.id !== id) {
          return item;
        }

        const nextWallId = updates.wallId && isWallId(updates.wallId) ? updates.wallId : item.wallId;
        const clamped = clampWallObjectToRoom(previous.room, {
          ...item,
          wallId: nextWallId,
          offsetX: updates.offsetX ?? item.offsetX,
          bottom: updates.bottom ?? item.bottom,
        });

        const isSame =
          item.wallId === clamped.wallId &&
          item.offsetX === clamped.offsetX &&
          item.bottom === clamped.bottom;
        if (isSame) {
          return item;
        }

        changed = true;
        return clamped;
      });

      if (!changed) {
        return previous;
      }

      return {
        ...previous,
        wallObjects: nextWallObjects,
      };
    });
  };

  const setWallObjectVisibility: RoomPlannerController["setWallObjectVisibility"] = (id, visible) => {
    applyStateChange((previous) => {
      let changed = false;

      const nextWallObjects = previous.wallObjects.map((item) => {
        if (item.id !== id) {
          return item;
        }

        if (item.visible === visible) {
          return item;
        }

        changed = true;
        return { ...item, visible };
      });

      if (!changed) {
        return previous;
      }

      return {
        ...previous,
        wallObjects: nextWallObjects,
      };
    });
  };

  const removeWallObject: RoomPlannerController["removeWallObject"] = (id) => {
    applyStateChange((previous) => {
      const nextWallObjects = previous.wallObjects.filter((item) => item.id !== id);
      if (nextWallObjects.length === previous.wallObjects.length) {
        return previous;
      }

      return {
        ...previous,
        wallObjects: nextWallObjects,
      };
    });
  };

  const clearWallObjects: RoomPlannerController["clearWallObjects"] = () => {
    applyStateChange((previous) => {
      if (previous.wallObjects.length === 0) {
        return previous;
      }

      return {
        ...previous,
        wallObjects: [],
      };
    });
  };

  const applyImportedProject: RoomPlannerController["applyImportedProject"] = (importedState) => {
    applyStateChange(() => sanitizeImportedState(importedState));
  };

  return {
    state,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    undo,
    redo,
    setDimension,
    setWallColor,
    setAllWallsColor,
    setFloorColor,
    setViewMode,
    setHiddenWalls,
    setFurniturePosition,
    setFurnitureVisibility,
    removeFurniture,
    addFurniture,
    clearFurniture,
    addWallObject,
    setWallObjectPlacement,
    setWallObjectVisibility,
    removeWallObject,
    clearWallObjects,
    applyImportedProject,
  };
}
