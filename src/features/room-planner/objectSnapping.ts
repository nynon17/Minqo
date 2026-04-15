import { Dimensions, WallObjectItem } from "./types";

export const CENTER_SNAP_THRESHOLD_METERS = 0.08;

export type AxisSnapResult = {
  value: number;
  snapped: boolean;
  delta: number;
};

export function applyAxisSnap(
  value: number,
  target: number,
  threshold = CENTER_SNAP_THRESHOLD_METERS,
): AxisSnapResult {
  const delta = value - target;
  if (Math.abs(delta) <= threshold) {
    return {
      value: target,
      snapped: true,
      delta,
    };
  }

  return {
    value,
    snapped: false,
    delta,
  };
}

export function getFloorSnapTargets(): { x: number; z: number } {
  return {
    x: 0,
    z: 0,
  };
}

export function getWallObjectSnapTargets(
  room: Dimensions,
  item: Pick<WallObjectItem, "height">,
): { offsetX: number; bottom: number } {
  return {
    offsetX: 0,
    bottom: room.height / 2 - item.height / 2,
  };
}
