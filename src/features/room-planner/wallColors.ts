import { WallId } from "./types";

export const SURFACE_COLOR_PRESETS = [
  "#f5eee5",
  "#efe7dc",
  "#e2d9cb",
  "#d6cab9",
  "#d5dfd2",
  "#c9baa5",
  "#d9cdc0",
  "#f2e9dc",
];

export const WALL_COLOR_PRESETS = SURFACE_COLOR_PRESETS;

export const WALL_LABELS: Record<WallId, string> = {
  front: "Front",
  back: "Back",
  left: "Left",
  right: "Right",
};
