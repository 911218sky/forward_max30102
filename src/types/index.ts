export interface SensorData {
  spO2: number;
  hr: number;
  hrQuality: number;
}

export interface OxygenLevel {
  value: number;
  status: "normal" | "warning" | "danger";
}
