import { formatMeasurementDistance } from "@/features/settings/formatting";
import { MeasureFrom, MeasurementRounding, Units } from "@/features/settings/types";
import { Dimensions, FurnitureItem, WallId, WallObjectItem } from "./types";
import { getObjectBounds } from "./objectMeasurements";
import { getWallDragPlane, getWallSpan } from "./wallObjectPlacement";

export type MeasurementGuide = {
  id: string;
  start: [number, number, number];
  end: [number, number, number];
  labelPosition: [number, number, number];
  label: string;
};

const LABEL_HEIGHT_OFFSET = 0.06;
const WALL_GUIDE_INSET = 0.02;
const FLOOR_GUIDE_Y_OFFSET = 0.03;
const MIN_DISTANCE_EPSILON = 1e-4;

function midpoint(a: [number, number, number], b: [number, number, number]): [number, number, number] {
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
}

function addOffset(
  point: [number, number, number],
  offset: [number, number, number],
): [number, number, number] {
  return [point[0] + offset[0], point[1] + offset[1], point[2] + offset[2]];
}

function createGuide(
  id: string,
  start: [number, number, number],
  end: [number, number, number],
  distanceMeters: number,
  units: Units,
  rounding: MeasurementRounding,
  labelOffset: [number, number, number] = [0, LABEL_HEIGHT_OFFSET, 0],
): MeasurementGuide {
  const clampedDistance = Math.max(0, distanceMeters);
  const midpointPosition = midpoint(start, end);

  return {
    id,
    start,
    end,
    labelPosition: addOffset(midpointPosition, labelOffset),
    label: formatMeasurementDistance(clampedDistance, units, rounding),
  };
}

function getWallInsetDirection(wallId: WallId): [number, number, number] {
  switch (wallId) {
    case "front":
      return [0, 0, 1];
    case "back":
      return [0, 0, -1];
    case "left":
      return [1, 0, 0];
    case "right":
      return [-1, 0, 0];
  }
}

function getWallHorizontalLabelOffset(wallId: WallId, magnitude = 0.06): [number, number, number] {
  if (wallId === "front" || wallId === "back") {
    return [magnitude, LABEL_HEIGHT_OFFSET * 0.45, 0];
  }

  return [0, LABEL_HEIGHT_OFFSET * 0.45, magnitude];
}

function wallLocalToWorldPoint(
  room: Dimensions,
  wallId: WallId,
  depth: number,
  horizontal: number,
  vertical: number,
): [number, number, number] {
  const plane = getWallDragPlane(room, wallId, depth);
  const insetDirection = getWallInsetDirection(wallId);
  const insetX = insetDirection[0] * WALL_GUIDE_INSET;
  const insetZ = insetDirection[2] * WALL_GUIDE_INSET;

  if (wallId === "front" || wallId === "back") {
    return [horizontal, vertical, plane.value + insetZ];
  }

  return [plane.value + insetX, vertical, horizontal];
}

export function getFloorObjectMeasurementGuides(
  room: Dimensions,
  item: FurnitureItem,
  measureFrom: MeasureFrom,
  units: Units,
  rounding: MeasurementRounding,
): MeasurementGuide[] {
  const bounds = getObjectBounds(item);
  const anchorY = Math.max(FLOOR_GUIDE_Y_OFFSET, bounds.minY + FLOOR_GUIDE_Y_OFFSET);
  const anchorX = measureFrom === "object-center" ? item.position[0] : (bounds.minX + bounds.maxX) / 2;
  const anchorZ = measureFrom === "object-center" ? item.position[2] : (bounds.minZ + bounds.maxZ) / 2;
  const sourceLeftX = measureFrom === "object-center" ? item.position[0] : bounds.minX;
  const sourceRightX = measureFrom === "object-center" ? item.position[0] : bounds.maxX;
  const sourceFrontZ = measureFrom === "object-center" ? item.position[2] : bounds.minZ;
  const sourceBackZ = measureFrom === "object-center" ? item.position[2] : bounds.maxZ;
  const roomMinX = -room.width / 2;
  const roomMaxX = room.width / 2;
  const roomMinZ = -room.length / 2;
  const roomMaxZ = room.length / 2;

  const leftStart: [number, number, number] = [sourceLeftX, anchorY, anchorZ];
  const leftEnd: [number, number, number] = [roomMinX, anchorY, anchorZ];
  const rightStart: [number, number, number] = [sourceRightX, anchorY, anchorZ];
  const rightEnd: [number, number, number] = [roomMaxX, anchorY, anchorZ];
  const frontStart: [number, number, number] = [anchorX, anchorY, sourceFrontZ];
  const frontEnd: [number, number, number] = [anchorX, anchorY, roomMinZ];
  const backStart: [number, number, number] = [anchorX, anchorY, sourceBackZ];
  const backEnd: [number, number, number] = [anchorX, anchorY, roomMaxZ];

  const leftDistance = sourceLeftX - roomMinX;
  const rightDistance = roomMaxX - sourceRightX;
  const frontDistance = sourceFrontZ - roomMinZ;
  const backDistance = roomMaxZ - sourceBackZ;

  return [
    createGuide("left", leftStart, leftEnd, leftDistance, units, rounding),
    createGuide("right", rightStart, rightEnd, rightDistance, units, rounding),
    createGuide("front", frontStart, frontEnd, frontDistance, units, rounding),
    createGuide("back", backStart, backEnd, backDistance, units, rounding),
  ].filter((guide) => Number.isFinite(guide.start[0]) && Number.isFinite(guide.end[0]));
}

export function getWallObjectMeasurementGuides(
  room: Dimensions,
  item: WallObjectItem,
  measureFrom: MeasureFrom,
  units: Units,
  rounding: MeasurementRounding,
): MeasurementGuide[] {
  const span = getWallSpan(room, item.wallId);
  const wallMin = -span / 2;
  const wallMax = span / 2;
  const objectLeft = item.offsetX - item.width / 2;
  const objectRight = item.offsetX + item.width / 2;
  const objectBottom = item.bottom;
  const objectTop = item.bottom + item.height;
  const objectCenterY = item.bottom + item.height / 2;
  const sourceHorizontal = item.offsetX;
  const sourceVertical = measureFrom === "object-center" ? objectCenterY : objectBottom;
  const sourceTopVertical = measureFrom === "object-center" ? objectCenterY : objectTop;
  const sourceLeftHorizontal = measureFrom === "object-center" ? sourceHorizontal : objectLeft;
  const sourceRightHorizontal = measureFrom === "object-center" ? sourceHorizontal : objectRight;

  const leftDistance = sourceLeftHorizontal - wallMin;
  const rightDistance = wallMax - sourceRightHorizontal;
  const floorDistance = sourceVertical;
  const ceilingDistance = room.height - sourceTopVertical;

  const leftStart = wallLocalToWorldPoint(room, item.wallId, item.depth, sourceLeftHorizontal, objectCenterY);
  const leftEnd = wallLocalToWorldPoint(room, item.wallId, item.depth, wallMin, objectCenterY);
  const rightStart = wallLocalToWorldPoint(room, item.wallId, item.depth, sourceRightHorizontal, objectCenterY);
  const rightEnd = wallLocalToWorldPoint(room, item.wallId, item.depth, wallMax, objectCenterY);
  const floorStart = wallLocalToWorldPoint(room, item.wallId, item.depth, sourceHorizontal, sourceVertical);
  const floorEnd = wallLocalToWorldPoint(room, item.wallId, item.depth, sourceHorizontal, 0);
  const ceilingStart = wallLocalToWorldPoint(room, item.wallId, item.depth, sourceHorizontal, sourceTopVertical);
  const ceilingEnd = wallLocalToWorldPoint(room, item.wallId, item.depth, sourceHorizontal, room.height);

  const verticalLabelOffset = getWallHorizontalLabelOffset(item.wallId);

  return [
    createGuide("left-edge", leftStart, leftEnd, leftDistance, units, rounding),
    createGuide("right-edge", rightStart, rightEnd, rightDistance, units, rounding),
    createGuide("floor", floorStart, floorEnd, floorDistance, units, rounding, verticalLabelOffset),
    createGuide("ceiling", ceilingStart, ceilingEnd, ceilingDistance, units, rounding, verticalLabelOffset),
  ].filter((guide) => {
    const dx = guide.start[0] - guide.end[0];
    const dy = guide.start[1] - guide.end[1];
    const dz = guide.start[2] - guide.end[2];
    const length = Math.hypot(dx, dy, dz);
    return length > MIN_DISTANCE_EPSILON || guide.label.startsWith("0");
  });
}
