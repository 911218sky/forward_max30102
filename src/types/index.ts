export interface SensorData {
  spO2: number;
  hr: number;
  hrQuality: number;
  status: "no_finger" | "measuring";
}

export interface OxygenLevel {
  value: number;
  status: "normal" | "warning" | "danger" | "no_finger" | "measuring";
}

export type OxygenStatus = OxygenLevel["status"];