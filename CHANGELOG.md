# Changelog

This project uses a user-facing changelog format.

## How to write entries

- Keep language plain first; add technical detail only when useful.
- Internal-only changes are optional in the changelog.
- Use sections: `Added`, `Changed`, `Fixed`, `Removed`.

## [0.2.0] - 2026-02-18

### Tärkeintä tässä julkaisussa

- Tämä julkaisu painottuu taustalla tehtyihin autentikoinnin uudistuksiin. Käyttäjälle näkyvät muutokset ovat vähäisiä, mutta tekninen pohja on aiempaa vakaampi.

### Added

- Sovellukseen lisättiin Better Authiin perustuva auth-reitti (`/api/auth/[...all]`).
- Ylläpidon alkuasennusta varten lisättiin `auth:bootstrap-admin`-komento, jolla ensimmäinen ADMIN-käyttäjä voidaan luoda tai olemassa oleva käyttäjä nostaa adminiksi.

### Changed

- Sovelluksen aiempi auth-palvelukerros ja auth-route-wrapperit korvattiin Better Auth -integraatiolla.
- Ylläpidon käyttöoikeustarkistus (`requireAdmin`) käyttää nyt Better Authin sessiota.
- Auth-asetusten validointeja tarkennettiin (esim. salaisuuden vähimmäispituus ja session kestoasetukset), jotta virheelliset asetukset havaitaan jo käynnistyksessä.

### Fixed

- Auth-päätepisteiden CORS-otsakkeet ja OPTIONS-preflight-vastaukset yhdenmukaistettiin, jotta selain ei estä kirjautumispyyntöjä eri alkuperien välillä.
- Auth-reittien testit päivitettiin kattamaan CORS- ja preflight-käytös sekä estämään testien välinen ympäristömuuttujien vuoto.

### Removed

- Vanhat API-clientin auth-wrapperit (`login`, `logout`, `me`, `register`) ja aiempi auth-service poistettiin käytöstä.

## [0.1.2] - 2026-02-18

### Added

- Beaglehaun sivutukseen lisättiin valittava tulosmäärä per sivu (10, 25, 50, 100) sekä URL-osoitteeseen tallentuva `pageSize`-parametri.

### Changed

- Hakutulosten sivutus uudistettiin: käytössä on nyt numeropohjainen sivunavigaatio (`1 ... 14 15 16 ... N`) aiemman pelkän edellinen/seuraava-rakenteen sijaan.
- Sivutusnäkymä näyttää nyt myös selkeän "tuloksia / sivu" -valinnan sekä mobiilissa että desktopissa.
- Hakutulosten sarake- ja otsikot täsmennettiin suomeksi ja ruotsiksi (esim. EK-numero, sukupuoli, kokeet/näyttelyt ja sukupuoliarvot) luettavuuden parantamiseksi.

### Fixed

- Hakutuloksiin lisättiin uusi "Kopioi sivun tulokset" -painike, jonka toiminto kopioi näkyvän tulossivun koirarivit leikepöydälle taulukkomuodossa.
- Varmistettiin, että hakutulosten kopiointi toimii käytännössä: koirarivejä voi maalata hausta ja liittää onnistuneesti esimerkiksi Google Docsiin.

### Removed

- Ei poistettu käyttäjälle näkyviä toimintoja tässä julkaisussa.

## [0.1.1] - 2026-02-16

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
