import type { TransitVehicle } from "@/types/transit";

export function createVehiclePin(vehicle: TransitVehicle): HTMLButtonElement {
  const root = document.createElement("button");
  root.type = "button";
  root.className = "live-vehicle";
  root.dataset.mode = vehicle.mode;
  const precision =
    vehicle.precision === "wgs84-gps" ? "GPS" : "station report";
  root.title = `${vehicle.lineLabel} ${vehicle.label} · ${precision}`;
  const dot = document.createElement("span");
  dot.className = "live-vehicle-dot";
  const label = document.createElement("span");
  label.className = "live-vehicle-label";
  label.textContent = vehicle.lineLabel;
  root.append(dot, label);
  return root;
}
