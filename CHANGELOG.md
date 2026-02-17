# Changelog

This project uses a user-facing changelog format.

## How to write entries

- Keep language plain first; add technical detail only when useful.
- Internal-only changes are optional in the changelog.
- Use sections: `Added`, `Changed`, `Fixed`, `Removed`.

## [0.1.1] - 2026-02-17

### Added

- Beaglehaun lisäsuodattimiin lisättiin syntymävuosiväli (`alkaen` ja `asti`).
- Beaglehaun lisäsuodattimiin lisättiin asetus "vain EK-koirat".

### Changed

- Uudet lisäsuodattimet tallentuvat URL-osoitteeseen ja palautuvat sivun uudelleenlatauksessa.
- Beaglehaun lisäsuodattimien käyttöliittymä siistittiin ja yhdenmukaistettiin (otsikko, kenttäasettelu ja tilat), ja samaa rakennetta voidaan jatkossa käyttää myös ylläpidon hakunäkymissä.
- Beaglehaun lajitteluun lisättiin EK-numerojärjestys (pienin ensin), jossa EK-numeroa vailla olevat koirat näytetään listan lopussa.

### Fixed

- Yläpalkin painikkeita tiivistettiin, jotta kielivalinta (🇸🇪/🇫🇮) mahtuu myös pienille näytöille ilman vaakasuuntaista ylivuotoa.

### Removed

- Ei poistettu käyttäjälle näkyviä toimintoja tässä julkaisussa.

## [0.1.0] - 2026-02-16

### Added

- Palvelussa on nyt selkeä etusivu ja sivupalkki.
- Beaglehaun ensimmäinen versio on julkaistu. Haku toimii EK-numerolla, rekisterinumerolla ja nimellä.
- Lisäsuodattimista käytössä ovat sukupuoli ja asetus "vain koirat, joilla on useita rekisterinumeroita".
- Hakutuloksissa näkyvät sekä mobiili- että desktop-näkymässä samat perustiedot: rekisterinumero, EK-numero, sukupuoli, nimi, koemäärä ja näyttelymäärä.
- Hakutuloksissa näytetään myös muut rekisterinumerot, jos koiralla on niitä useita.
- Beaglehaussa näkyy myös Viimeisimmät lisäykset -lista (uusimmat koirat).
- Kielen vaihto suomi/ruotsi on käytössä.
- Julkinen "Mitä uutta" -sivu ja sen linkki yläpalkissa on lisätty.

### Changed

- Etusivun rakennetta päivitettiin selkeämmäksi.
- Navigaatio koottiin yhtenäiseksi sivupalkkinäkymäksi.
- Viimeisimmät lisäykset -listassa vanhojen beaglejen järjestys voi vaihdella, jos lisäysaika on sama.

### Fixed

- Ei käyttäjälle näkyviä korjauksia tässä julkaisussa.

### Removed

- Ei poistettu käyttäjälle näkyviä toimintoja tässä julkaisussa.
