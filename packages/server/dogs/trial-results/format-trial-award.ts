export function formatTrialAward(
  award: string | null,
  classCode: string | null,
): string | null {
  if (!award) {
    return null;
  }

  // Legacy rule (koe_tulos.php / beagle.php):
  // LK=A => "Avo ", LK=V => "Voi ", otherwise "Beaj ".
  const normalizedClassCode = classCode?.trim().toUpperCase();
  const prefix =
    normalizedClassCode === "A"
      ? "Avo"
      : normalizedClassCode === "V"
        ? "Voi"
        : "Beaj";

  return `${prefix} ${award}`;
}
