import { Dimensions, WallId, WallObjectItem } from "./types";

const WALL_EDGE_PADDING = 0.05;
const WALL_FLUSH_OFFSET = 0.01;
const MIN_WALL_OBJECT_SIZE = 0.2;
const MAX_WALL_OBJECT_DEPTH = 0.5;
const MIN_WALL_OBJECT_DEPTH = 0.05;

type WallAxis = "x" | "z";

type WallAttachment = {
  axis: WallAxis;
  coordinate: number;
  rotationY: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function toFiniteNumber(value: number, fallback: number): number {
  return Number.isFinite(value) ? value : fallback;
}

export function getWallSpan(room: Dimensions, wallId: WallId): number {
  if (wallId === "front" || wallId === "back") {
    return room.width;
  }

  return room.length;
}

function getWallAttachment(room: Dimensions, wallId: WallId, depth: number): WallAttachment {
  const inset = depth / 2 + WALL_FLUSH_OFFSET;

  switch (wallId) {
    case "front":
      return {
        axis: "z",
        coordinate: -room.length / 2 + inset,
        rotationY: 0,
      };
    case "back":
      return {
        axis: "z",
        coordinate: room.length / 2 - inset,
        rotationY: Math.PI,
      };
    case "left":
      return {
        axis: "x",
        coordinate: -room.width / 2 + inset,
        rotationY: Math.PI / 2,
      };
    case "right":
      return {
        axis: "x",
        coordinate: room.width / 2 - inset,
        rotationY: -Math.PI / 2,
      };
  }
}

export function clampWallObjectToRoom(room: Dimensions, item: WallObjectItem): WallObjectItem {
  const span = getWallSpan(room, item.wallId);
  const width = clamp(
    toFiniteNumber(item.width, MIN_WALL_OBJECT_SIZE),
    MIN_WALL_OBJECT_SIZE,
    Math.max(MIN_WALL_OBJECT_SIZE, span - WALL_EDGE_PADDING * 2),
  );
  const height = clamp(
    toFiniteNumber(item.height, MIN_WALL_OBJECT_SIZE),
    MIN_WALL_OBJECT_SIZE,
    Math.max(MIN_WALL_OBJECT_SIZE, room.height - WALL_EDGE_PADDING),
  );
  const depth = clamp(
    toFiniteNumber(item.depth, MIN_WALL_OBJECT_DEPTH),
    MIN_WALL_OBJECT_DEPTH,
    MAX_WALL_OBJECT_DEPTH,
  );

  const maxOffsetX = Math.max(0, span / 2 - width / 2 - WALL_EDGE_PADDING);
  const maxBottom = Math.max(0, room.height - height - WALL_EDGE_PADDING);

  return {
    ...item,
    width,
    height,
    depth,
    offsetX: clamp(toFiniteNumber(item.offsetX, 0), -maxOffsetX, maxOffsetX),
    bottom: clamp(toFiniteNumber(item.bottom, 0), 0, maxBottom),
  };
}

export function getWallObjectWorldTransform(
  room: Dimensions,
  item: WallObjectItem,
): {
  position: [number, number, number];
  rotationY: number;
} {
  const clamped = clampWallObjectToRoom(room, item);
  const attachment = getWallAttachment(room, clamped.wallId, clamped.depth);
  const centerY = clamped.bottom + clamped.height / 2;

  if (attachment.axis === "z") {
    return {
      position: [clamped.offsetX, centerY, attachment.coordinate],
      rotationY: attachment.rotationY,
    };
  }

  return {
    position: [attachment.coordinate, centerY, clamped.offsetX],
    rotationY: attachment.rotationY,
  };
}

export function getWallDragPlane(
  room: Dimensions,
  wallId: WallId,
  depth: number,
): { axis: WallAxis; value: number } {
  const attachment = getWallAttachment(room, wallId, depth);
  return {
    axis: attachment.axis,
    value: attachment.coordinate,
  };
}

export function worldPointToWallPlacement(
  room: Dimensions,
  wallId: WallId,
  itemSize: { width: number; height: number; depth: number },
  point: { x: number; y: number; z: number },
): { offsetX: number; bottom: number } {
  const offsetX = wallId === "front" || wallId === "back" ? point.x : point.z;
  const bottom = point.y - itemSize.height / 2;

  const clamped = clampWallObjectToRoom(room, {
    id: "tmp",
    type: "window",
    wallId,
    width: itemSize.width,
    height: itemSize.height,
    depth: itemSize.depth,
    offsetX,
    bottom,
    color: "#000000",
  });
  return {
    offsetX: clamped.offsetX,
    bottom: clamped.bottom,
  };
}
