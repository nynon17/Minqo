import { MeasurementRounding, Units } from "./types";

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

export function formatDimensionValue(distanceMeters: number, units: Units): string {
  if (units === "cm") {
    return `${Math.round(distanceMeters * 100)} cm`;
  }

  return `${distanceMeters.toFixed(1)} m`;
}

export function formatMeasurementDistance(
  distanceMeters: number,
  units: Units,
  rounding: MeasurementRounding,
): string {
  const clamped = clampDistance(distanceMeters);
  if (units === "m") {
    const roundedMeters = Math.round(clamped * 100) / 100;
    return `${roundedMeters.toFixed(2)} m`;
  }

  const centimeters = clamped * 100;
  if (rounding === "whole-cm") {
    return `${Math.round(centimeters)} cm`;
  }
  if (rounding === "half-cm") {
    const roundedHalf = Math.round(centimeters * 2) / 2;
    const isWhole = Math.abs(roundedHalf - Math.round(roundedHalf)) < ROUNDING_EPSILON;
    return isWhole ? `${Math.round(roundedHalf)} cm` : `${roundedHalf.toFixed(1)} cm`;
  }

  return `${(Math.round(centimeters * 10) / 10).toFixed(1)} cm`;
}

