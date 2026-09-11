import type { BeagleTrialSearchWeatherSummary } from "@beagle/contracts";

type WeatherLabels = {
  snow: string;
  bareGround: string;
  varied: string;
};

export function formatTrialWeather(
  value: string | null,
  labels: WeatherLabels,
): string {
  if (value === "L") return labels.snow;
  if (value === "P") return labels.bareGround;
  return value ?? "-";
}

export function formatTrialWeatherSummary(
  value: BeagleTrialSearchWeatherSummary,
  labels: WeatherLabels,
): string {
  if (value.kind === "none") return "-";
  if (value.kind === "varied") return labels.varied;
  return formatTrialWeather(value.value, labels);
}
