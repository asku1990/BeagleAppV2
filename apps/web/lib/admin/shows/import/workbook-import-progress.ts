export function formatWorkbookImportElapsedTime(
  elapsedSeconds: number,
): string {
  const wholeSeconds = Math.max(0, Math.floor(elapsedSeconds));
  const minutes = Math.floor(wholeSeconds / 60);
  const seconds = String(wholeSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}
