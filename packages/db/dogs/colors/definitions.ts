import { DogColorStatus } from "@prisma/client";

export type DogColorDefinition = {
  code: number;
  nameFi: string;
  nameSv: string;
  nameEn: string | null;
  status: DogColorStatus;
};

const official = (
  code: number,
  nameFi: string,
  nameSv: string,
  status: DogColorStatus,
  nameEn: string | null = null,
): DogColorDefinition => ({ code, nameFi, nameSv, nameEn, status });

const unknown = (code: number): DogColorDefinition => ({
  code,
  nameFi: "Tuntematon väri",
  nameSv: "Okänd färg",
  nameEn: "Unknown color",
  status: DogColorStatus.LEGACY_UNKNOWN,
});

// Canonical registration colors plus explicit placeholders for legacy source codes.
export const DOG_COLOR_DEFINITIONS = [
  official(
    886,
    "Hare pied",
    "Hare pied",
    DogColorStatus.SELECTABLE,
    "Hare pied",
  ),
  official(112, "Harmaa", "Grå", DogColorStatus.HIDDEN),
  official(118, "Harmaapäistärikkö", "Gråskimmel", DogColorStatus.HIDDEN),
  official(207, "Kaksivärinen", "Tvåfärgad", DogColorStatus.SELECTABLE),
  official(122, "Keltavalkoinen", "Gul-vit", DogColorStatus.HIDDEN),
  official(121, "Kolmivärinen", "Trefärgad", DogColorStatus.SELECTABLE),
  official(
    312,
    "Lemon roan",
    "Lemon roan",
    DogColorStatus.HIDDEN,
    "Lemon roan",
  ),
  official(
    147,
    "Lemon white",
    "Lemon white",
    DogColorStatus.HIDDEN,
    "Lemon white",
  ),
  official(150, "Maksa-valko-tan", "Lever-vit-tan", DogColorStatus.HIDDEN),
  official(100, "Musta", "Svart", DogColorStatus.HIDDEN),
  official(471, "Mustaruskea", "Svartbrun", DogColorStatus.HIDDEN),
  official(211, "Musta-ruskea", "Svart-brun", DogColorStatus.HIDDEN),
  official(
    706,
    "Musta-ruskea-valkoinen",
    "Svart-brun-vit",
    DogColorStatus.HIDDEN,
  ),
  official(123, "Mustavalkoinen", "Svartvit", DogColorStatus.SELECTABLE),
  official(741, "Musta-valkoinen", "Svart-vit", DogColorStatus.HIDDEN),
  official(
    308,
    "Mustavalkoinen täplikäs",
    "Svartvit fläckig",
    DogColorStatus.HIDDEN,
  ),
  official(
    229,
    "Musta-valkoinen-ruskea",
    "Svart-vit-brun",
    DogColorStatus.HIDDEN,
  ),
  official(119, "Punavalkoinen", "Rödvit", DogColorStatus.HIDDEN),
  official(181, "Rotumääritelmän mukainen", "Standard", DogColorStatus.HIDDEN),
  official(125, "Ruskea-valkoinen", "Brun-vit", DogColorStatus.SELECTABLE),
  official(252, "Sininen", "Blå", DogColorStatus.SELECTABLE),
  official(493, "Tricolour", "Tricolour", DogColorStatus.HIDDEN, "Tricolour"),
  official(750, "Valkoinen", "Vit", DogColorStatus.HIDDEN),
  official(
    539,
    "Valkoinen ruskein laikuin",
    "Vit med bruna fläckar",
    DogColorStatus.SELECTABLE,
  ),
  official(348, "Valkoinen-musta", "Vit-svart", DogColorStatus.HIDDEN),
  official(
    809,
    "Valkoinen-musta-ruskea",
    "Vit-svart-brun",
    DogColorStatus.HIDDEN,
  ),
  official(374, "Valkoinen-ruskea", "Vit-brun", DogColorStatus.HIDDEN),
  official(
    962,
    "Musta-ruskea-valkoinen",
    "Svart-brun-vit",
    DogColorStatus.HIDDEN,
  ),
  ...[
    50, 106, 107, 108, 130, 153, 175, 240, 251, 301, 379, 391, 398, 416, 419,
    422, 511, 512, 617, 624, 647, 751, 767, 784, 858, 891,
  ].map(unknown),
] satisfies DogColorDefinition[];
