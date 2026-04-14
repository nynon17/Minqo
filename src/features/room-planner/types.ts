export type ViewMode = "perspective" | "side" | "top";
export type WallId = "front" | "back" | "left" | "right";
export type FurnitureType = "chair" | "table" | "sofa" | "lamp" | "bed" | "plant";
export type SurfaceSelection = { kind: "wall"; wall: WallId } | { kind: "floor" } | null;

export type Dimensions = {
  width: number;
  length: number;
  height: number;
};

export type RoomColors = {
  floor: string;
  walls: Record<WallId, string>;
};

export interface FurnitureItem {
  id: string;
  type: FurnitureType;
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  rotationY?: number;
}

export interface RoomPlannerState {
  room: Dimensions;
  colors: RoomColors;
  viewMode: ViewMode;
  hiddenWalls: WallId[];
  furniture: FurnitureItem[];
}

export interface RoomPlannerController {
  state: RoomPlannerState;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  setDimension: (key: keyof Dimensions, value: number) => void;
  setWallColor: (wall: WallId, color: string) => void;
  setAllWallsColor: (color: string) => void;
  setFloorColor: (color: string) => void;
  setViewMode: (mode: ViewMode) => void;
  setHiddenWalls: (walls: WallId[]) => void;
  setFurniturePosition: (id: string, position: [number, number, number]) => void;
  removeFurniture: (id: string) => void;
  addFurniture: (type: FurnitureType) => void;
  clearFurniture: () => void;
}
