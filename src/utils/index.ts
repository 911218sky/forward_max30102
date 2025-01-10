import type { OxygenStatus } from "../types";

export function determineStatus(value: number): OxygenStatus {
  if (value >= 95) return "normal";
  if (value >= 90) return "warning";
  return "danger";
}

export const STATUS_COLORS: Record<OxygenStatus, string> = {
  normal: "#4CAF50",
  warning: "#FFC107",
  danger: "#F44336",
  no_finger: "#FF0000",
  measuring: "#FFA500",
} as const;

export const STATUS_TEXTS: Record<OxygenStatus, string> = {
  normal: "Stable",
  warning: "Warning",
  danger: "Critical",
  no_finger: "No Finger",
  measuring: "Measuring",
} as const;

export const HEART_RATE_CHART_COLORS = {
  noFinger: "#ff0000",
  measuring: "#ffa500", 
  active: "#00ff00"
} as const;