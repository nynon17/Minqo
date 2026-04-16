import { AppSettings } from "./types";

export const APP_SETTINGS_STORAGE_KEY = "minqo-app-settings";

export const DEFAULT_APP_SETTINGS: AppSettings = {
  general: {
    units: "m",
    theme: "warm",
    autoSave: false,
  },
  view: {
    defaultStartupView: "perspective",
    smoothCameraTransitions: true,
    autoHideWalls: true,
    showGrid: true,
  },
  editing: {
    snap: true,
    centerSnap: true,
    collisionPrevention: true,
  },
  measurements: {
    showMeasurements: true,
    measurementStyle: "lines-and-labels",
    measureFrom: "object-edges",
    rounding: "one-decimal",
  },
};
