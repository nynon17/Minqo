import { useState } from "react";
import {
  Dimensions,
  FurnitureItem,
  FurnitureType,
  RoomPlannerController,
  RoomPlannerState,
  WallId,
} from "./types";

const DEFAULT_ROOM: Dimensions = { width: 4, length: 3.5, height: 2.8 };

const FURNITURE_PRESETS: Record<FurnitureType, { size: [number, number, number]; color: string }> = {
  chair: { size: [0.6, 0.85, 0.6], color: "#b89473" },
  table: { size: [1.2, 0.75, 0.8], color: "#9f7652" },
  sofa: { size: [1.8, 0.9, 0.85], color: "#d7c6b0" },
  lamp: { size: [0.3, 1.5, 0.3], color: "#f2e7d7" },
  bed: { size: [2.0, 0.65, 1.5], color: "#c8b6a1" },
  plant: { size: [0.45, 0.9, 0.45], color: "#81966e" },
};

const INITIAL_STATE: RoomPlannerState = {
  room: DEFAULT_ROOM,
  colors: {
    floor: "#cda97f",
    walls: {
      front: "#f5eee5",
      back: "#f5eee5",
      left: "#efe7dc",
      right: "#efe7dc",
    },
  },
  viewMode: "perspective",
  hiddenWalls: [],
  furniture: [],
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function sameWalls(a: WallId[], b: WallId[]) {
  return a.length === b.length && a.every((value, index) => value === b[index]);
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

export function useRoomPlanner(): RoomPlannerController {
  const [history, setHistory] = useState<{
    past: RoomPlannerState[];
    present: RoomPlannerState;
    future: RoomPlannerState[];
  }>({
    past: [],
    present: INITIAL_STATE,
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
    removeFurniture,
    addFurniture,
    clearFurniture,
  };
}
