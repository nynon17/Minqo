import {
  DEFAULT_COLORS,
  DEFAULT_ROOM,
  DEFAULT_VIEW_MODE,
  FURNITURE_PRESETS,
  VIEW_MODES,
  WALL_OBJECT_PRESETS,
  WALL_IDS,
} from "./defaults";
import {
  FurnitureItem,
  FurnitureType,
  RoomPlannerState,
  ViewMode,
  WallId,
  WallObjectItem,
  WallObjectType,
} from "./types";

type LooseRecord = Record<string, unknown>;

type ProjectFormat = "native" | "external";

type ParsedProjectResult =
  | { ok: true; data: unknown }
  | { ok: false };

type NormalizedProjectResult =
  | {
      ok: true;
      state: RoomPlannerState;
      format: ProjectFormat;
      skippedFurnitureCount: number;
    }
  | { ok: false };

type ValidationResult = { ok: true } | { ok: false };

export type ImportedProjectResult =
  | {
      ok: true;
      state: RoomPlannerState;
      status: "full" | "partial";
      format: ProjectFormat;
      skippedFurnitureCount: number;
    }
  | { ok: false };

const DIMENSION_MIN = 1;
const DIMENSION_MAX = 20;
const FURNITURE_MIN_SIZE = 0.1;
const FURNITURE_MAX_SIZE = 10;

const FURNITURE_TYPE_ALIASES: Record<string, FurnitureType> = {
  chair: "chair",
  armchair: "chair",
  stool: "chair",
  table: "table",
  desk: "table",
  sofa: "sofa",
  couch: "sofa",
  lamp: "lamp",
  light: "lamp",
  bed: "bed",
  plant: "plant",
  flower: "plant",
};

const WALL_OBJECT_TYPE_ALIASES: Record<string, WallObjectType> = {
  window: "window",
  windows: "window",
  opening: "window",
  door: "door",
  doorway: "door",
  entrydoor: "door",
  "entry-door": "door",
};

const ITEM_TYPE_KEYS = ["type", "furnitureType", "objectType", "kind", "name"];

const VIEW_MODE_ALIASES: Record<string, ViewMode> = {
  perspective: "perspective",
  "360": "perspective",
  orbit: "perspective",
  top: "top",
  plan: "top",
  overhead: "top",
  side: "side",
  elevation: "side",
};

const WALL_ALIASES: Record<WallId, string[]> = {
  front: ["front", "north"],
  back: ["back", "south"],
  left: ["left", "west"],
  right: ["right", "east"],
};

const WALL_ID_ALIASES: Record<string, WallId> = {
  front: "front",
  north: "front",
  back: "back",
  south: "back",
  left: "left",
  west: "left",
  right: "right",
  east: "right",
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function isRecord(value: unknown): value is LooseRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asRecord(value: unknown): LooseRecord | undefined {
  return isRecord(value) ? value : undefined;
}

function toFiniteNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value.trim());
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
}

function toBoolean(value: unknown): boolean | undefined {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    if (value === 1) {
      return true;
    }
    if (value === 0) {
      return false;
    }
    return undefined;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "yes", "1", "on"].includes(normalized)) {
      return true;
    }
    if (["false", "no", "0", "off"].includes(normalized)) {
      return false;
    }
  }

  return undefined;
}
function normalizeWallObjectType(value: unknown): WallObjectType | undefined {
  const normalized = normalizeText(value)?.toLowerCase();
  if (!normalized) {
    return undefined;
  }

  if (normalized in WALL_OBJECT_TYPE_ALIASES) {
    return WALL_OBJECT_TYPE_ALIASES[normalized];
  }

  return undefined;
}

function extractItemType(record: LooseRecord): unknown {
  return getFirstDefined(record, ITEM_TYPE_KEYS);
}

function firstFiniteNumber(...values: unknown[]): number | undefined {
  for (const value of values) {
    const numeric = toFiniteNumber(value);
    if (numeric !== undefined) {
      return numeric;
    }
  }
  return undefined;
}

function normalizeText(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function toColor(value: unknown): string | undefined {
  const direct = normalizeText(value);
  if (direct) {
    return direct;
  }

  const record = asRecord(value);
  if (!record) {
    return undefined;
  }

  return normalizeText(record.color);
}

function getFirstDefined(record: LooseRecord | undefined, keys: string[]): unknown {
  if (!record) {
    return undefined;
  }

  for (const key of keys) {
    if (record[key] !== undefined) {
      return record[key];
    }
  }

  return undefined;
}

function getFirstArray(record: LooseRecord | undefined, keys: string[]): unknown[] | undefined {
  if (!record) {
    return undefined;
  }

  for (const key of keys) {
    const value = record[key];
    if (Array.isArray(value)) {
      return value;
    }
  }

  return undefined;
}

function normalizeVisibility(record: LooseRecord): boolean {
  const visible = toBoolean(getFirstDefined(record, ["visible", "isVisible"]));
  if (visible !== undefined) {
    return visible;
  }

  const hidden = toBoolean(getFirstDefined(record, ["hidden", "isHidden"]));
  if (hidden !== undefined) {
    return !hidden;
  }

  return true;
}

function createFurnitureId(type: FurnitureType, index: number): string {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `${type}-${index + 1}`;
}
function createWallObjectId(type: WallObjectType, index: number): string {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `${type}-wall-${index + 1}`;
}

function normalizeFurnitureType(value: unknown): FurnitureType | undefined {
  const normalized = normalizeText(value)?.toLowerCase();
  if (!normalized) {
    return undefined;
  }

  if (normalized in FURNITURE_TYPE_ALIASES) {
    return FURNITURE_TYPE_ALIASES[normalized];
  }

  return undefined;
}

function normalizeWallId(value: unknown): WallId | undefined {
  const normalized = normalizeText(value)?.toLowerCase();
  if (!normalized) {
    return undefined;
  }

  return WALL_ID_ALIASES[normalized];
}

function normalizePosition(value: unknown, fallbackY: number): [number, number, number] {
  const record = asRecord(value);

  const x = firstFiniteNumber(
    Array.isArray(value) ? value[0] : undefined,
    record?.x,
    record?.left,
  );
  const y = firstFiniteNumber(
    Array.isArray(value) ? value[1] : undefined,
    record?.y,
    record?.top,
  );
  const z = firstFiniteNumber(
    Array.isArray(value) ? value[2] : undefined,
    record?.z,
    record?.depth,
  );

  return [x ?? 0, y ?? fallbackY, z ?? 0];
}

function normalizeSize(item: LooseRecord, fallback: [number, number, number]): [number, number, number] {
  const fromSize = asRecord(item.size);
  const fromDimensions = asRecord(item.dimensions);
  const sourceRecord = fromSize ?? fromDimensions;
  const sourceArray = Array.isArray(item.size)
    ? item.size
    : Array.isArray(item.dimensions)
      ? item.dimensions
      : undefined;

  const width = firstFiniteNumber(
    sourceArray?.[0],
    sourceRecord?.width,
    sourceRecord?.x,
    item.width,
  );
  const height = firstFiniteNumber(
    sourceArray?.[1],
    sourceRecord?.height,
    sourceRecord?.y,
    item.height,
  );
  const depth = firstFiniteNumber(
    sourceArray?.[2],
    sourceRecord?.depth,
    sourceRecord?.length,
    sourceRecord?.z,
    item.depth,
    item.length,
  );

  return [
    clamp(width ?? fallback[0], FURNITURE_MIN_SIZE, FURNITURE_MAX_SIZE),
    clamp(height ?? fallback[1], FURNITURE_MIN_SIZE, FURNITURE_MAX_SIZE),
    clamp(depth ?? fallback[2], FURNITURE_MIN_SIZE, FURNITURE_MAX_SIZE),
  ];
}

function normalizeRotationY(item: LooseRecord): number {
  const transform = asRecord(item.transform);
  const rotationRecord = asRecord(item.rotation) ?? asRecord(transform?.rotation);

  const numeric = firstFiniteNumber(
    item.rotationY,
    Array.isArray(item.rotation) ? item.rotation[1] : undefined,
    rotationRecord?.y,
    item.rotation,
  );

  return numeric ?? 0;
}

function normalizeFurnitureItem(item: unknown, index: number): FurnitureItem | null {
  const record = asRecord(item);
  if (!record) {
    return null;
  }
  const type = normalizeFurnitureType(extractItemType(record));
  if (!type) {
    return null;
  }

  const preset = FURNITURE_PRESETS[type];
  const size = normalizeSize(record, preset.size);
  const transform = asRecord(record.transform);
  const position = normalizePosition(
    getFirstDefined(record, ["position", "coords", "coordinates"]) ?? transform?.position,
    size[1] / 2,
  );

  return {
    id: normalizeText(getFirstDefined(record, ["id", "uuid", "key"])) ?? createFurnitureId(type, index),
    type,
    size,
    color:
      toColor(getFirstDefined(record, ["color", "materialColor"])) ??
      toColor(record.material) ??
      preset.color,
    position,
    rotationY: normalizeRotationY(record),
    visible: normalizeVisibility(record),
  };
}

function normalizeFurniture(project: LooseRecord): {
  furniture: FurnitureItem[];
  skippedFurnitureCount: number;
  recognized: boolean;
} {
  const roomRecord = asRecord(project.room);
  const rawItems =
    getFirstArray(project, ["furniture", "items", "objects"]) ??
    getFirstArray(roomRecord, ["furniture", "items", "objects"]);

  if (!rawItems) {
    return { furniture: [], skippedFurnitureCount: 0, recognized: false };
  }

  const furniture: FurnitureItem[] = [];
  let skippedFurnitureCount = 0;

  rawItems.forEach((item, index) => {
    const itemRecord = asRecord(item);
    if (itemRecord) {
      const wallObjectType = normalizeWallObjectType(extractItemType(itemRecord));
      if (wallObjectType) {
        return;
      }
    }
    const normalized = normalizeFurnitureItem(item, index);
    if (!normalized) {
      skippedFurnitureCount += 1;
      return;
    }

    furniture.push(normalized);
  });

  return {
    furniture,
    skippedFurnitureCount,
    recognized: true,
  };
}

function normalizeWallObjectItem(item: unknown, index: number): WallObjectItem | null {
  const record = asRecord(item);
  if (!record) {
    return null;
  }

  const type = normalizeWallObjectType(extractItemType(record));
  if (!type) {
    return null;
  }

  const wallId =
    normalizeWallId(getFirstDefined(record, ["wallId", "wall", "mountWall", "surface", "side"])) ?? "front";
  const preset = WALL_OBJECT_PRESETS[type];
  const sizeRecord = asRecord(record.size) ?? asRecord(record.dimensions);
  const sizeArray = Array.isArray(record.size)
    ? record.size
    : Array.isArray(record.dimensions)
      ? record.dimensions
      : undefined;
  const positionRecord = asRecord(record.position);
  const metadataRecord = asRecord(record.metadata);

  const style = normalizeText(metadataRecord?.style) ?? normalizeText(record.style);
  const material = normalizeText(metadataRecord?.material) ?? normalizeText(record.material);
  const metadata = style || material ? { ...(style ? { style } : {}), ...(material ? { material } : {}) } : undefined;

  return {
    id:
      normalizeText(getFirstDefined(record, ["id", "uuid", "key"])) ??
      createWallObjectId(type, index),
    type,
    wallId,
    width: firstFiniteNumber(
      getFirstDefined(record, ["width", "openingWidth"]),
      sizeArray?.[0],
      sizeRecord?.width,
      sizeRecord?.x,
    ) ?? preset.width,
    height: firstFiniteNumber(
      getFirstDefined(record, ["height", "openingHeight"]),
      sizeArray?.[1],
      sizeRecord?.height,
      sizeRecord?.y,
    ) ?? preset.height,
    depth: firstFiniteNumber(
      getFirstDefined(record, ["depth", "thickness"]),
      sizeArray?.[2],
      sizeRecord?.depth,
      sizeRecord?.z,
    ) ?? preset.depth,
    offsetX: firstFiniteNumber(
      getFirstDefined(record, ["offsetX", "positionAlongWall", "horizontalOffset", "localX"]),
      positionRecord?.x,
      positionRecord?.u,
    ) ?? 0,
    bottom: firstFiniteNumber(
      getFirstDefined(record, ["bottom", "bottomOffset", "heightFromFloor", "sillHeight", "verticalOffset"]),
      positionRecord?.bottom,
      positionRecord?.y,
    ) ?? preset.bottom,
    color:
      toColor(getFirstDefined(record, ["color", "frameColor"])) ??
      toColor(record.material) ??
      preset.color,
    metadata,
    visible: normalizeVisibility(record),
  };
}

function normalizeWallObjects(project: LooseRecord): {
  wallObjects: WallObjectItem[];
  skippedWallObjectCount: number;
  recognized: boolean;
} {
  const roomRecord = asRecord(project.room);
  const dedicatedItems =
    getFirstArray(project, ["wallObjects", "openings", "wallItems"]) ??
    getFirstArray(roomRecord, ["wallObjects", "openings", "wallItems"]);
  const mixedItems =
    getFirstArray(project, ["items", "objects"]) ??
    getFirstArray(roomRecord, ["items", "objects"]);

  if (!dedicatedItems && !mixedItems) {
    return { wallObjects: [], skippedWallObjectCount: 0, recognized: false };
  }

  const wallObjects: WallObjectItem[] = [];
  let skippedWallObjectCount = 0;
  let recognized = false;

  dedicatedItems?.forEach((item, index) => {
    recognized = true;
    const normalized = normalizeWallObjectItem(item, index);
    if (!normalized) {
      skippedWallObjectCount += 1;
      return;
    }

    wallObjects.push(normalized);
  });

  mixedItems?.forEach((item, index) => {
    const record = asRecord(item);
    if (!record) {
      return;
    }
    const type = normalizeWallObjectType(extractItemType(record));
    if (!type) {
      return;
    }

    recognized = true;
    const normalized = normalizeWallObjectItem({ ...record, type }, index);
    if (!normalized) {
      skippedWallObjectCount += 1;
      return;
    }

    wallObjects.push(normalized);
  });

  return {
    wallObjects,
    skippedWallObjectCount,
    recognized,
  };
}

function normalizeRoom(project: LooseRecord): { room: RoomPlannerState["room"]; recognized: boolean } {
  const roomRecord =
    asRecord(getFirstDefined(project, ["room", "roomDimensions", "dimensions"])) ?? project;

  const width = firstFiniteNumber(
    getFirstDefined(roomRecord, ["width", "roomWidth"]),
    getFirstDefined(project, ["width", "roomWidth"]),
  );
  const length = firstFiniteNumber(
    getFirstDefined(roomRecord, ["length", "roomLength", "depth"]),
    getFirstDefined(project, ["length", "roomLength", "depth"]),
  );
  const height = firstFiniteNumber(
    getFirstDefined(roomRecord, ["height", "roomHeight"]),
    getFirstDefined(project, ["height", "roomHeight"]),
  );

  return {
    room: {
      width: clamp(width ?? DEFAULT_ROOM.width, DIMENSION_MIN, DIMENSION_MAX),
      length: clamp(length ?? DEFAULT_ROOM.length, DIMENSION_MIN, DIMENSION_MAX),
      height: clamp(height ?? DEFAULT_ROOM.height, DIMENSION_MIN, DIMENSION_MAX),
    },
    recognized:
      width !== undefined || length !== undefined || height !== undefined || roomRecord !== project,
  };
}

function normalizeWallColors(project: LooseRecord, colorsRecord: LooseRecord | undefined): {
  walls: RoomPlannerState["colors"]["walls"];
  recognized: boolean;
} {
  const wallSource =
    getFirstDefined(colorsRecord, ["walls", "wallColors"]) ??
    getFirstDefined(project, ["walls", "wallColors"]);

  const walls = { ...DEFAULT_COLORS.walls };
  let recognized = wallSource !== undefined;

  if (typeof wallSource === "string") {
    WALL_IDS.forEach((wall) => {
      walls[wall] = wallSource;
    });
    return { walls, recognized: true };
  }

  const wallRecord = asRecord(wallSource);
  if (!wallRecord) {
    return { walls, recognized };
  }

  WALL_IDS.forEach((wall) => {
    for (const alias of WALL_ALIASES[wall]) {
      const color = toColor(wallRecord[alias]);
      if (color) {
        walls[wall] = color;
        recognized = true;
        return;
      }
    }
  });

  return { walls, recognized };
}

function normalizeFloorColor(project: LooseRecord, colorsRecord: LooseRecord | undefined): {
  floor: string;
  recognized: boolean;
} {
  const floorSource =
    getFirstDefined(colorsRecord, ["floor", "floorColor", "floorMaterial"]) ??
    getFirstDefined(project, ["floor", "floorColor", "floorMaterial"]);
  const floorColor = toColor(floorSource);

  return {
    floor: floorColor ?? DEFAULT_COLORS.floor,
    recognized: floorSource !== undefined,
  };
}

function normalizeViewMode(project: LooseRecord): { viewMode: ViewMode; recognized: boolean } {
  const candidate = normalizeText(getFirstDefined(project, ["viewMode", "cameraMode", "view"]));
  const normalized = candidate ? VIEW_MODE_ALIASES[candidate.toLowerCase()] : undefined;

  return {
    viewMode: normalized ?? DEFAULT_VIEW_MODE,
    recognized: candidate !== undefined,
  };
}

function normalizeHiddenWalls(project: LooseRecord): { hiddenWalls: WallId[]; recognized: boolean } {
  const hiddenWallsValue = getFirstDefined(project, ["hiddenWalls", "invisibleWalls"]);
  if (!Array.isArray(hiddenWallsValue)) {
    return { hiddenWalls: [], recognized: hiddenWallsValue !== undefined };
  }

  const deduped: WallId[] = [];
  hiddenWallsValue.forEach((value) => {
    const wall = normalizeWallId(value);
    if (wall && !deduped.includes(wall)) {
      deduped.push(wall);
    }
  });

  return {
    hiddenWalls: deduped,
    recognized: true,
  };
}

function migrateNativeProject(root: LooseRecord, project: LooseRecord): LooseRecord {
  const schemaVersion = firstFiniteNumber(root.schemaVersion, root.version, project.schemaVersion);
  if (schemaVersion === undefined || schemaVersion >= 1) {
    return project;
  }

  if (project.room || !project.roomDimensions) {
    return project;
  }

  return {
    ...project,
    room: project.roomDimensions,
  };
}

function isNativeProject(root: LooseRecord, project: LooseRecord): boolean {
  const schema = normalizeText(root.schema)?.toLowerCase();
  if (schema?.includes("minqo")) {
    return true;
  }

  const format = normalizeText(root.format)?.toLowerCase();
  if (format?.includes("minqo")) {
    return true;
  }

  return project.room !== undefined && project.colors !== undefined && project.furniture !== undefined;
}

function extractProjectRecord(root: LooseRecord): LooseRecord | undefined {
  return asRecord(root.project) ?? asRecord(root.data) ?? root;
}

export function parseImportedProject(rawText: string): ParsedProjectResult {
  try {
    return {
      ok: true,
      data: JSON.parse(rawText),
    };
  } catch {
    return { ok: false };
  }
}

export function normalizeImportedProject(data: unknown): NormalizedProjectResult {
  const root = asRecord(data);
  if (!root) {
    return { ok: false };
  }

  const extracted = extractProjectRecord(root);
  if (!extracted) {
    return { ok: false };
  }

  const format: ProjectFormat = isNativeProject(root, extracted) ? "native" : "external";
  const project = format === "native" ? migrateNativeProject(root, extracted) : extracted;
  const colorsRecord = asRecord(project.colors);

  const roomNormalization = normalizeRoom(project);
  const wallsNormalization = normalizeWallColors(project, colorsRecord);
  const floorNormalization = normalizeFloorColor(project, colorsRecord);
  const viewModeNormalization = normalizeViewMode(project);
  const hiddenWallsNormalization = normalizeHiddenWalls(project);
  const furnitureNormalization = normalizeFurniture(project);
  const wallObjectsNormalization = normalizeWallObjects(project);

  const hasRecognizedContent =
    roomNormalization.recognized ||
    wallsNormalization.recognized ||
    floorNormalization.recognized ||
    viewModeNormalization.recognized ||
    hiddenWallsNormalization.recognized ||
    furnitureNormalization.recognized ||
    wallObjectsNormalization.recognized;

  if (!hasRecognizedContent) {
    return { ok: false };
  }

  return {
    ok: true,
    format,
    skippedFurnitureCount:
      furnitureNormalization.skippedFurnitureCount + wallObjectsNormalization.skippedWallObjectCount,
    state: {
      room: roomNormalization.room,
      colors: {
        floor: floorNormalization.floor,
        walls: wallsNormalization.walls,
      },
      viewMode: viewModeNormalization.viewMode,
      hiddenWalls: hiddenWallsNormalization.hiddenWalls,
      furniture: furnitureNormalization.furniture,
      wallObjects: wallObjectsNormalization.wallObjects,
    },
  };
}

export function validateNormalizedProject(project: RoomPlannerState): ValidationResult {
  const roomValues = [project.room.width, project.room.length, project.room.height];
  if (roomValues.some((value) => !Number.isFinite(value) || value <= 0)) {
    return { ok: false };
  }

  if (!VIEW_MODES.includes(project.viewMode)) {
    return { ok: false };
  }

  if (project.hiddenWalls.some((wall) => !WALL_IDS.includes(wall))) {
    return { ok: false };
  }

  const furnitureValid = project.furniture.every((item) => {
    const preset = FURNITURE_PRESETS[item.type];
    if (!preset) {
      return false;
    }

    return (
      typeof item.id === "string" &&
      item.id.trim() !== "" &&
      typeof item.color === "string" &&
      item.color.trim() !== "" &&
      item.size.every((value) => Number.isFinite(value) && value > 0) &&
      item.position.every((value) => Number.isFinite(value)) &&
      (item.rotationY === undefined || Number.isFinite(item.rotationY)) &&
      typeof item.visible === "boolean"
    );
  });
  const wallObjectsValid = project.wallObjects.every((item) => {
    const preset = WALL_OBJECT_PRESETS[item.type];
    if (!preset) {
      return false;
    }

    return (
      typeof item.id === "string" &&
      item.id.trim() !== "" &&
      WALL_IDS.includes(item.wallId) &&
      Number.isFinite(item.width) &&
      item.width > 0 &&
      Number.isFinite(item.height) &&
      item.height > 0 &&
      Number.isFinite(item.depth) &&
      item.depth > 0 &&
      Number.isFinite(item.offsetX) &&
      Number.isFinite(item.bottom) &&
      typeof item.color === "string" &&
      item.color.trim() !== "" &&
      typeof item.visible === "boolean"
    );
  });

  return furnitureValid && wallObjectsValid ? { ok: true } : { ok: false };
  return furnitureValid ? { ok: true } : { ok: false };
}

export function importProjectFromJsonText(rawText: string): ImportedProjectResult {
  const parsed = parseImportedProject(rawText);
  if (!parsed.ok) {
    return { ok: false };
  }

  const normalized = normalizeImportedProject(parsed.data);
  if (!normalized.ok) {
    return { ok: false };
  }

  const validation = validateNormalizedProject(normalized.state);
  if (!validation.ok) {
    return { ok: false };
  }

  return {
    ok: true,
    state: normalized.state,
    status: normalized.skippedFurnitureCount > 0 ? "partial" : "full",
    format: normalized.format,
    skippedFurnitureCount: normalized.skippedFurnitureCount,
  };
}
