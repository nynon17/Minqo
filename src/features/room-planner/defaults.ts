import {
  Dimensions,
  FurnitureType,
  RoomColors,
  RoomPlannerState,
  ViewMode,
  WallId,
  WallObjectType,
} from "./types";

export const WALL_IDS: WallId[] = ["front", "back", "left", "right"];
export const VIEW_MODES: ViewMode[] = ["perspective", "side", "top"];

export const DEFAULT_ROOM: Dimensions = { width: 4, length: 3.5, height: 2.8 };

export const DEFAULT_COLORS: RoomColors = {
  floor: "#cda97f",
  walls: {
    front: "#f5eee5",
    back: "#f5eee5",
    left: "#efe7dc",
    right: "#efe7dc",
  },
};

export const DEFAULT_VIEW_MODE: ViewMode = "perspective";

export const FURNITURE_PRESETS: Record<FurnitureType, { size: [number, number, number]; color: string }> = {
  chair: { size: [0.6, 0.85, 0.6], color: "#b89473" },
  table: { size: [1.2, 0.75, 0.8], color: "#9f7652" },
  sofa: { size: [1.8, 0.9, 0.85], color: "#d7c6b0" },
  lamp: { size: [0.3, 1.5, 0.3], color: "#f2e7d7" },
  bed: { size: [2.0, 0.65, 1.5], color: "#c8b6a1" },
  plant: { size: [0.45, 0.9, 0.45], color: "#81966e" },
};

export const WALL_OBJECT_PRESETS: Record<
  WallObjectType,
  { width: number; height: number; depth: number; bottom: number; color: string }
> = {
  window: { width: 1.2, height: 1, depth: 0.12, bottom: 1, color: "#9ab8cc" },
  door: { width: 0.9, height: 2.05, depth: 0.12, bottom: 0, color: "#8f7256" },
};

export function createInitialPlannerState(): RoomPlannerState {
  return {
    room: { ...DEFAULT_ROOM },
    colors: {
      floor: DEFAULT_COLORS.floor,
      walls: { ...DEFAULT_COLORS.walls },
    },
    viewMode: DEFAULT_VIEW_MODE,
    hiddenWalls: [],
    furniture: [],
    wallObjects: [],
  };
}
