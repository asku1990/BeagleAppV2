type WeatherLabels = {
  snow: string;
  bareGround: string;
};

export function formatTrialWeather(
  value: string | null,
  labels: WeatherLabels,
): string {
  if (value === "L") return labels.snow;
  if (value === "P") return labels.bareGround;
  return value ?? "-";
}
