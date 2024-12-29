export function determineStatus(
  value: number
): "normal" | "warning" | "danger" {
  if (value >= 95) return "normal";
  if (value >= 90) return "warning";
  return "danger";
}

export const STATUS_COLORS = {
  normal: "#4CAF50",
  warning: "#FFC107",
  danger: "#F44336",
};

export const STATUS_TEXTS = {
  normal: "Stable",
  warning: "Warning",
  danger: "Critical",
};