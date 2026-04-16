import { useEffect, useState } from "react";
import { APP_SETTINGS_STORAGE_KEY, DEFAULT_APP_SETTINGS } from "./defaults";
import { AppSettings } from "./types";

function cloneSettings(settings: AppSettings): AppSettings {
  return {
    general: { ...settings.general },
    view: { ...settings.view },
    editing: { ...settings.editing },
    measurements: { ...settings.measurements },
  };
}

function sanitizeSettings(value: unknown): AppSettings {
  if (!value || typeof value !== "object") {
    return cloneSettings(DEFAULT_APP_SETTINGS);
  }

  const raw = value as Partial<AppSettings>;
  return {
    general: {
      units: raw.general?.units === "cm" ? "cm" : "m",
      theme:
        raw.general?.theme === "light" || raw.general?.theme === "dark" ? raw.general.theme : "warm",
      autoSave: raw.general?.autoSave === true,
    },
    view: {
      defaultStartupView:
        raw.view?.defaultStartupView === "side" || raw.view?.defaultStartupView === "top"
          ? raw.view.defaultStartupView
          : "perspective",
      smoothCameraTransitions: raw.view?.smoothCameraTransitions !== false,
      autoHideWalls: raw.view?.autoHideWalls !== false,
      showGrid: raw.view?.showGrid !== false,
    },
    editing: {
      snap: raw.editing?.snap !== false,
      centerSnap: raw.editing?.centerSnap !== false,
      collisionPrevention: raw.editing?.collisionPrevention !== false,
    },
    measurements: {
      showMeasurements: raw.measurements?.showMeasurements !== false,
      measurementStyle: raw.measurements?.measurementStyle === "labels-only" ? "labels-only" : "lines-and-labels",
      measureFrom: raw.measurements?.measureFrom === "object-center" ? "object-center" : "object-edges",
      rounding:
        raw.measurements?.rounding === "whole-cm" || raw.measurements?.rounding === "half-cm"
          ? raw.measurements.rounding
          : "one-decimal",
    },
  };
}

function loadInitialSettings(): AppSettings {
  if (typeof window === "undefined") {
    return cloneSettings(DEFAULT_APP_SETTINGS);
  }

  try {
    const rawValue = window.localStorage.getItem(APP_SETTINGS_STORAGE_KEY);
    if (!rawValue) {
      return cloneSettings(DEFAULT_APP_SETTINGS);
    }

    return sanitizeSettings(JSON.parse(rawValue));
  } catch {
    return cloneSettings(DEFAULT_APP_SETTINGS);
  }
}

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings>(loadInitialSettings);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(APP_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Ignore storage write failures.
    }
  }, [settings]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    document.documentElement.dataset.theme = settings.general.theme;
  }, [settings.general.theme]);

  const updateSettings = (updater: (previous: AppSettings) => AppSettings) => {
    setSettings((previous) => sanitizeSettings(updater(previous)));
  };

  return {
    settings,
    updateSettings,
  };
}
