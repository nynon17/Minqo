import { ViewMode } from "@/features/room-planner/types";

export type Units = "cm" | "m";
export type AppTheme = "light" | "warm" | "dark";
export type MeasurementStyle = "labels-only" | "lines-and-labels";
export type MeasureFrom = "object-edges" | "object-center";
export type MeasurementRounding = "whole-cm" | "half-cm" | "one-decimal";

export type AppSettings = {
  general: {
    units: Units;
    theme: AppTheme;
    autoSave: boolean;
  };
  view: {
    defaultStartupView: ViewMode;
    smoothCameraTransitions: boolean;
    autoHideWalls: boolean;
    showGrid: boolean;
  };
  editing: {
    snap: boolean;
    centerSnap: boolean;
    collisionPrevention: boolean;
  };
  measurements: {
    showMeasurements: boolean;
    measurementStyle: MeasurementStyle;
    measureFrom: MeasureFrom;
    rounding: MeasurementRounding;
  };
};
