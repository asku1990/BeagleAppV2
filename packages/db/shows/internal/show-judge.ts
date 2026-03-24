export function collapseJudge(
  entries: Array<{ judge: string | null }>,
): string | null {
  let resolvedJudge: string | null | undefined;

  for (const entry of entries) {
    const normalizedJudge = entry.judge?.trim() ?? "";
    if (!normalizedJudge) {
      continue;
    }
    if (resolvedJudge === undefined) {
      resolvedJudge = normalizedJudge;
      continue;
    }
    if (resolvedJudge !== normalizedJudge) {
      return null;
    }
  }

  return resolvedJudge ?? null;
}
