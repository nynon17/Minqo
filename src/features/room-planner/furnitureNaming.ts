import { FurnitureItem, FurnitureType, WallObjectItem, WallObjectType } from "./types";

const FURNITURE_TYPE_LABELS: Record<FurnitureType, string> = {
  chair: "Chair",
  table: "Table",
  sofa: "Sofa",
  lamp: "Lamp",
  bed: "Bed",
  plant: "Plant",
};

const WALL_OBJECT_TYPE_LABELS: Record<WallObjectType, string> = {
  window: "Window",
  door: "Door",
};

export function getFurnitureTypeLabel(type: FurnitureType): string {
  return FURNITURE_TYPE_LABELS[type];
}

export function getWallObjectTypeLabel(type: WallObjectType): string {
  return WALL_OBJECT_TYPE_LABELS[type];
}

export function getFurnitureDisplayNames(items: FurnitureItem[]): Record<string, string> {
  const perTypeCounters: Partial<Record<FurnitureType, number>> = {};
  const displayNames: Record<string, string> = {};

  for (const item of items) {
    const nextTypeCount = (perTypeCounters[item.type] ?? 0) + 1;
    perTypeCounters[item.type] = nextTypeCount;

    const baseLabel = getFurnitureTypeLabel(item.type);
    displayNames[item.id] = nextTypeCount === 1 ? baseLabel : `${baseLabel} ${nextTypeCount}`;
  }

  return displayNames;
}

export function getWallObjectDisplayNames(items: WallObjectItem[]): Record<string, string> {
  const perTypeCounters: Partial<Record<WallObjectType, number>> = {};
  const displayNames: Record<string, string> = {};

  for (const item of items) {
    const nextTypeCount = (perTypeCounters[item.type] ?? 0) + 1;
    perTypeCounters[item.type] = nextTypeCount;

    const baseLabel = getWallObjectTypeLabel(item.type);
    displayNames[item.id] = nextTypeCount === 1 ? baseLabel : `${baseLabel} ${nextTypeCount}`;
  }

  return displayNames;
}
