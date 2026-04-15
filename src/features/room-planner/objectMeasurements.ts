import { Dimensions, FurnitureItem, WallObjectItem } from "./types";
import { getWallSpan } from "./wallObjectPlacement";

export type ObjectBounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
  halfX: number;
  halfY: number;
  halfZ: number;
};

export type ObjectMeasurement = {
  label: string;
  distanceMeters: number;
};

const ROUNDING_EPSILON = 1e-4;

function clampDistance(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  if (value < 0 && value > -ROUNDING_EPSILON) {
    return 0;
  }

  return Math.max(0, value);
}

export function getObjectBounds(item: FurnitureItem): ObjectBounds {
  const [width, height, depth] = item.size;
  const halfY = height / 2;
  const angle = item.rotationY ?? 0;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const halfX = (Math.abs(cos) * width + Math.abs(sin) * depth) / 2;
  const halfZ = (Math.abs(sin) * width + Math.abs(cos) * depth) / 2;

  return {
    minX: item.position[0] - halfX,
    maxX: item.position[0] + halfX,
    minY: item.position[1] - halfY,
    maxY: item.position[1] + halfY,
    minZ: item.position[2] - halfZ,
    maxZ: item.position[2] + halfZ,
    halfX,
    halfY,
    halfZ,
  };
}

export function getFloorObjectMeasurements(room: Dimensions, item: FurnitureItem): ObjectMeasurement[] {
  const bounds = getObjectBounds(item);
  const leftDistance = bounds.minX + room.width / 2;
  const rightDistance = room.width / 2 - bounds.maxX;
  const frontDistance = bounds.minZ + room.length / 2;
  const backDistance = room.length / 2 - bounds.maxZ;

  return [
    { label: "Left wall", distanceMeters: clampDistance(leftDistance) },
    { label: "Right wall", distanceMeters: clampDistance(rightDistance) },
    { label: "Front wall", distanceMeters: clampDistance(frontDistance) },
    { label: "Back wall", distanceMeters: clampDistance(backDistance) },
  ];
}

export function getWallObjectMeasurements(room: Dimensions, item: WallObjectItem): ObjectMeasurement[] {
  const span = getWallSpan(room, item.wallId);
  const leftDistance = span / 2 + item.offsetX - item.width / 2;
  const rightDistance = span / 2 - item.offsetX - item.width / 2;
  const floorDistance = item.bottom;
  const ceilingDistance = room.height - (item.bottom + item.height);

  return [
    { label: "Floor", distanceMeters: clampDistance(floorDistance) },
    { label: "Ceiling", distanceMeters: clampDistance(ceilingDistance) },
    { label: "Left edge", distanceMeters: clampDistance(leftDistance) },
    { label: "Right edge", distanceMeters: clampDistance(rightDistance) },
  ];
}

export function formatDistanceCentimeters(distanceMeters: number): string {
  const centimeters = clampDistance(distanceMeters) * 100;
  const rounded = Math.round(centimeters * 10) / 10;
  const isWhole = Math.abs(rounded - Math.round(rounded)) < ROUNDING_EPSILON;

  return isWhole ? `${Math.round(rounded)} cm` : `${rounded.toFixed(1)} cm`;
}
