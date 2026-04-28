// Orchestrates the AJOK 2005-2011 renderer. Sections are enabled one at a time
// while coordinates are tuned against the template.
import type { TrialDogPdfRenderContext } from "../types";
import { drawLegacy2005To2011AjoajanPisteytys } from "./ajoajan-pisteytys";
import { drawLegacy2005To2011Ansiopisteet } from "./ansiopisteet";
import { drawLegacy2005To2011KoiranTausta } from "./koiran-tausta";
import { drawLegacy2005To2011KoiranTiedot } from "./koiran-tiedot";
import { drawLegacy2005To2011KokeenTiedot } from "./kokeen-tiedot";

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

  drawLegacy2005To2011KoiranTiedot({
    registrationNo: input.registrationNo,
    dogName: input.dogName,
    dogSex: input.dogSex,
    page,
    font,
  });

  drawLegacy2005To2011KoiranTausta({
    sireName: input.sireName,
    sireRegistrationNo: input.sireRegistrationNo,
    damName: input.damName,
    damRegistrationNo: input.damRegistrationNo,
    omistaja: input.omistaja,
    omistajanKotikunta: input.omistajanKotikunta,
    page,
    font,
  });

  drawLegacy2005To2011AjoajanPisteytys({
    era1Alkoi: input.era1Alkoi,
    era2Alkoi: input.era2Alkoi,
    hakuMin1: input.hakuMin1,
    hakuMin2: input.hakuMin2,
    ajoMin1: input.ajoMin1,
    ajoMin2: input.ajoMin2,
    hyvaksytytAjominuutit: input.hyvaksytytAjominuutit,
    ajoajanPisteet: input.ajoajanPisteet,
    page,
    font,
  });

  drawLegacy2005To2011Ansiopisteet({
    hakuEra1: input.hakuEra1,
    hakuEra2: input.hakuEra2,
    hakuKeskiarvo: input.hakuKeskiarvo,
    haukkuEra1: input.haukkuEra1,
    haukkuEra2: input.haukkuEra2,
    haukkuKeskiarvo: input.haukkuKeskiarvo,
    ajotaitoEra1: input.ajotaitoEra1,
    ajotaitoEra2: input.ajotaitoEra2,
    ajotaitoKeskiarvo: input.ajotaitoKeskiarvo,
    ansiopisteetYhteensa: input.ansiopisteetYhteensa,
    page,
    font,
  });
}
