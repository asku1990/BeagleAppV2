export type AdminTrialEntryWriteDataDb = {
  entry: {
    koemaasto: string | null;
    koemuoto: string | null;
    koetyyppi: "NORMAL" | "KOKOKAUDENKOE" | "PITKAKOE";
    ke: string | null;
    lk: string | null;
    award: string | null;
    rank: string | null;
    points: number | null;
    koiriaLuokassa: number | null;
    hyvaksytytAjominuutit: number | null;
    ajoajanPisteet: number | null;
    haku: number | null;
    hauk: number | null;
    yva: number | null;
    hlo: number | null;
    alo: number | null;
    tja: number | null;
    pin: number | null;
    ansiopisteetYhteensa: number | null;
    tappiopisteetYhteensa: number | null;
    judge: string | null;
    huomautus: "LUOPUI" | "SULJETTU" | "KESKEYTETTY" | null;
    huomautusTeksti: string | null;
    ylituomariNumeroSnapshot: string | null;
    ryhmatuomariNimi: string | null;
    palkintotuomariNimi: string | null;
    omistajaSnapshot: string | null;
    omistajanKotikuntaSnapshot: string | null;
  };
  eras: Array<{
    era: number;
    alkoi: string | null;
    hakumin: number | null;
    ajomin: number | null;
    haku: number | null;
    hauk: number | null;
    yva: number | null;
    hlo: number | null;
    alo: number | null;
    tja: number | null;
    pin: number | null;
    huomautusTeksti: string | null;
  }>;
  lisatiedotByEra: Array<{
    era: number;
    replaceKeys: Array<{
      koodi: string;
      osa: string;
    }>;
    items: Array<{
      koodi: string;
      osa: string;
      arvo: string;
      nimi: string | null;
      jarjestys: number | null;
    }>;
  }>;
};
