import { Vector3 } from "three";
import { ViewMode, WallId } from "./types";

const CORNER_THRESHOLD = 0.34;
const EPSILON = 1e-5;
const OVERHEAD_RATIO_THRESHOLD = 1.45;

export function getHiddenWalls(cameraPosition: Vector3, viewMode: ViewMode): WallId[] {

  const horizontalLength = Math.hypot(cameraPosition.x, cameraPosition.z);
  if (horizontalLength < EPSILON) {
    return [];
  }
  const cameraHeightRatio = Math.abs(cameraPosition.y) / horizontalLength;
  if (viewMode === "top" && cameraHeightRatio >= OVERHEAD_RATIO_THRESHOLD * 0.5) {
    return [];
  }
  if (cameraHeightRatio >= OVERHEAD_RATIO_THRESHOLD) {
    return [];
  }

  const nx = cameraPosition.x / horizontalLength;
  const nz = cameraPosition.z / horizontalLength;

  const nearestXWall: WallId = nx >= 0 ? "right" : "left";
  const nearestZWall: WallId = nz >= 0 ? "back" : "front";

  const isCornerAngle = Math.abs(nx) > CORNER_THRESHOLD && Math.abs(nz) > CORNER_THRESHOLD;
  if (isCornerAngle) {
    return [nearestXWall, nearestZWall];
  }

  return Math.abs(nx) >= Math.abs(nz) ? [nearestXWall] : [nearestZWall];
}
