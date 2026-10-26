export function formatTrialAward(
  award: string | null,
  classCode: string | null,
  huomautus: "LUOPUI" | "SULJETTU" | "KESKEYTETTY" | null,
): string | null {
  const result =
    huomautus === "LUOPUI"
      ? "L"
      : huomautus === "SULJETTU"
        ? "S"
        : huomautus === "KESKEYTETTY" && award
          ? `${award} (K)`
          : huomautus === "KESKEYTETTY"
            ? "K"
            : award;
  if (!result) {
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

  return `${prefix} ${result}`;
}
