import { WALL_IDS } from "./defaults";
import { WallId } from "./types";

export function getVisibleWalls(hiddenWalls: WallId[]): WallId[] {
  const hiddenWallSet = new Set(hiddenWalls);
  return WALL_IDS.filter((wallId) => !hiddenWallSet.has(wallId));
}

export function isWallInteractive(wallId: WallId, hiddenWalls: WallId[]): boolean {
  return !hiddenWalls.includes(wallId);
}
