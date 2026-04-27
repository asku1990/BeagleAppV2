// Orchestrates the AJOK 2005-2011 renderer. Sections are enabled one at a time
// while coordinates are tuned against the template.
import { drawLegacy2005To2011KokeenTiedot } from "./legacy-2005-2011/kokeen-tiedot";
import type { TrialDogPdfRenderContext } from "./types";

export function renderLegacy2005To2011TrialDogPdfFields({
  input,
  page,
  font,
}: TrialDogPdfRenderContext): void {
  drawLegacy2005To2011KokeenTiedot({
    kennelpiiri: input.kennelpiiri,
    kennelpiirinro: input.kennelpiirinro,
    koekunta: input.koekunta,
    koemaasto: input.koemaasto,
    koepaiva: input.koepaiva,
    jarjestaja: input.jarjestaja,
    page,
    font,
  });
}
