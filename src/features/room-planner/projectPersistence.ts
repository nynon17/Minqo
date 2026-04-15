import { importProjectFromJsonText, ImportedProjectResult } from "./projectImport";
import { RoomPlannerState } from "./types";

export const MINQO_PROJECT_STORAGE_KEY = "minqo-project";
export const MINQO_PROJECT_FILE_NAME = "minqo-project.json";
export const MINQO_PROJECT_SCHEMA = "minqo-project" as const;
export const MINQO_PROJECT_VERSION = 1;

export type MinqoProjectData = {
  schema: typeof MINQO_PROJECT_SCHEMA;
  version: number;
  project: RoomPlannerState;
};

type SaveProjectOptions = {
  storage?: Storage;
  storageKey?: string;
};

type ExportProjectOptions = {
  filename?: string;
};

function cloneRoomPlannerState(state: RoomPlannerState): RoomPlannerState {
  return {
    room: { ...state.room },
    colors: {
      floor: state.colors.floor,
      walls: { ...state.colors.walls },
    },
    viewMode: state.viewMode,
    hiddenWalls: [...state.hiddenWalls],
    furniture: state.furniture.map((item) => ({
      ...item,
      position: [...item.position] as [number, number, number],
      size: [...item.size] as [number, number, number],
    })),
    wallObjects: state.wallObjects.map((item) => ({
      ...item,
      metadata: item.metadata ? { ...item.metadata } : undefined,
    })),
  };
}

function resolveStorage(storage?: Storage): Storage | undefined {
  if (storage) {
    return storage;
  }

  if (typeof window !== "undefined") {
    return window.localStorage;
  }

  return undefined;
}

function isLikelyJsonFile(file: File): boolean {
  const fileName = file.name.toLowerCase();
  const fileType = file.type.toLowerCase();

  if (fileName.endsWith(".json")) {
    return true;
  }

  return fileType === "application/json" || fileType === "text/json" || fileType === "application/x-json";
}

export function getProjectData(state: RoomPlannerState): MinqoProjectData {
  return {
    schema: MINQO_PROJECT_SCHEMA,
    version: MINQO_PROJECT_VERSION,
    project: cloneRoomPlannerState(state),
  };
}

export function serializeProjectData(state: RoomPlannerState): string {
  return JSON.stringify(getProjectData(state), null, 2);
}

export function applyProjectData(
  data: RoomPlannerState,
  applyProjectState: (state: RoomPlannerState) => void,
): void {
  applyProjectState(cloneRoomPlannerState(data));
}

export function saveProjectToLocalStorage(
  state: RoomPlannerState,
  options: SaveProjectOptions = {},
): boolean {
  const storage = resolveStorage(options.storage);
  if (!storage) {
    return false;
  }

  try {
    storage.setItem(options.storageKey ?? MINQO_PROJECT_STORAGE_KEY, serializeProjectData(state));
    return true;
  } catch {
    return false;
  }
}

export function exportProjectAsJson(
  state: RoomPlannerState,
  options: ExportProjectOptions = {},
): boolean {
  if (
    typeof document === "undefined" ||
    typeof window === "undefined" ||
    typeof window.URL?.createObjectURL !== "function"
  ) {
    return false;
  }

  try {
    const blob = new Blob([serializeProjectData(state)], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = options.filename ?? MINQO_PROJECT_FILE_NAME;
    anchor.rel = "noopener";
    anchor.style.display = "none";

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(url);

    return true;
  } catch {
    return false;
  }
}

export async function importProjectFromJson(file: File): Promise<ImportedProjectResult> {
  if (!isLikelyJsonFile(file)) {
    return { ok: false };
  }

  try {
    const rawText = await file.text();
    return importProjectFromJsonText(rawText);
  } catch {
    return { ok: false };
  }
}
