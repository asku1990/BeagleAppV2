export const fiAdminDogsCommonMessages = {
  "admin.dogs.title": "Yllapito: koirat",
  "admin.dogs.create.button": "Luo koira",
  "admin.dogs.create.success": "Koira luotu",
  "admin.dogs.edit.success": "Koiran tiedot paivitetty",
  "admin.dogs.management.title": "Koirahallinta",
  "admin.dogs.management.countPrefix": "Hakutulokset",
  "admin.dogs.loading": "Ladataan koiria...",
  "admin.dogs.error": "Koirien lataaminen epäonnistui.",
  "admin.dogs.filters.searchPlaceholder":
    "Hae nimellä, rekisterinumerolla, kasvattajalla, omistajalla, uroksella, emällä tai EK-numerolla",
  "admin.dogs.filters.searchAria": "Hae koiria",
  "admin.dogs.filters.sexAria": "Suodata koirat sukupuolen mukaan",
  "admin.dogs.filters.sex.all": "Kaikki",
  "admin.dogs.sex.male": "Uros",
  "admin.dogs.sex.female": "Narttu",
  "admin.dogs.sex.unknown": "Tuntematon",
  "admin.dogs.mutation.errorDefault": "Koiran tallennus epäonnistui.",
  "admin.dogs.mutation.errorInvalidDogId": "Virheellinen koiran tunniste.",
  "admin.dogs.mutation.errorInvalidName": "Koiran nimi on pakollinen.",
  "admin.dogs.mutation.errorNameTooLong":
    "Koiran nimi on liian pitkä (max 120 merkkiä).",
  "admin.dogs.mutation.errorInvalidSex": "Virheellinen sukupuoli.",
  "admin.dogs.mutation.errorInvalidBirthDate":
    "Syntymäajan muoto on virheellinen.",
  "admin.dogs.mutation.errorInvalidEkNo":
    "EK-numero tulee olla positiivinen kokonaisluku.",
  "admin.dogs.mutation.errorRegistrationTooLong":
    "Rekisterinumero on liian pitkä (max 40 merkkiä).",
  "admin.dogs.mutation.errorNoteTooLong":
    "Muistiinpano on liian pitkä (max 500 merkkiä).",
  "admin.dogs.mutation.errorInvalidSireRegistration":
    "Uroksen rekisterinumeroa ei löytynyt.",
  "admin.dogs.mutation.errorInvalidDamRegistration":
    "Emän rekisterinumeroa ei löytynyt.",
  "admin.dogs.mutation.errorInvalidParentCombination":
    "Uros ja emä eivät voi olla sama koira.",
  "admin.dogs.mutation.errorInvalidSelfParent":
    "Koira ei voi olla oma vanhempansa.",
  "admin.dogs.mutation.errorInvalidSireSex":
    "Valitun uroksen sukupuoli ei ole uros.",
  "admin.dogs.mutation.errorInvalidDamSex":
    "Valitun emän sukupuoli ei ole narttu.",
  "admin.dogs.mutation.errorDuplicateDog":
    "Koira samalla EK-numerolla tai rekisterinumerolla on jo olemassa.",
  "admin.dogs.mutation.errorDogNotFound": "Koiraa ei löytynyt.",
} as const;

export const svAdminDogsCommonMessages = {
  "admin.dogs.title": "Admin: hundar",
  "admin.dogs.create.button": "Skapa hund",
  "admin.dogs.create.success": "Hund skapad",
  "admin.dogs.edit.success": "Hunduppgifter uppdaterade",
  "admin.dogs.management.title": "Hundhantering",
  "admin.dogs.management.countPrefix": "Sokresultat",
  "admin.dogs.loading": "Laddar hundar...",
  "admin.dogs.error": "Kunde inte ladda hundar.",
  "admin.dogs.filters.searchPlaceholder":
    "Sök på namn, registreringsnummer, uppfödare, ägare, hane, tik eller EK-nummer",
  "admin.dogs.filters.searchAria": "Sok hundar",
  "admin.dogs.filters.sexAria": "Filtrera hundar efter kon",
  "admin.dogs.filters.sex.all": "Alla",
  "admin.dogs.sex.male": "Hane",
  "admin.dogs.sex.female": "Tik",
  "admin.dogs.sex.unknown": "Okant",
  "admin.dogs.mutation.errorDefault": "Det gick inte att spara hunden.",
  "admin.dogs.mutation.errorInvalidDogId": "Ogiltigt hund-ID.",
  "admin.dogs.mutation.errorInvalidName": "Hundens namn ar obligatoriskt.",
  "admin.dogs.mutation.errorNameTooLong":
    "Hundens namn ar for langt (max 120 tecken).",
  "admin.dogs.mutation.errorInvalidSex": "Ogiltigt kon.",
  "admin.dogs.mutation.errorInvalidBirthDate":
    "Fodelsedatum har ogiltigt format.",
  "admin.dogs.mutation.errorInvalidEkNo":
    "EK-nummer maste vara ett positivt heltal.",
  "admin.dogs.mutation.errorRegistrationTooLong":
    "Registreringsnumret ar for langt (max 40 tecken).",
  "admin.dogs.mutation.errorNoteTooLong":
    "Anteckningen ar for lang (max 500 tecken).",
  "admin.dogs.mutation.errorInvalidSireRegistration":
    "Hanens registreringsnummer hittades inte.",
  "admin.dogs.mutation.errorInvalidDamRegistration":
    "Tikens registreringsnummer hittades inte.",
  "admin.dogs.mutation.errorInvalidParentCombination":
    "Hane och tik kan inte vara samma hund.",
  "admin.dogs.mutation.errorInvalidSelfParent":
    "Hunden kan inte vara sin egen foralder.",
  "admin.dogs.mutation.errorInvalidSireSex": "Vald hane har inte kon hane.",
  "admin.dogs.mutation.errorInvalidDamSex": "Vald tik har inte kon tik.",
  "admin.dogs.mutation.errorDuplicateDog":
    "En hund med samma EK-nummer eller registreringsnummer finns redan.",
  "admin.dogs.mutation.errorDogNotFound": "Hunden hittades inte.",
} as const;
