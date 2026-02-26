# Changelog

This project uses a user-facing changelog format.

## How to write entries

- Keep language plain first; add technical detail only when useful.
- Internal-only changes are optional in the changelog.
- Use sections: `Added`, `Changed`, `Fixed`, `Removed`.

## [Unreleased]

### Added

### Changed

### Fixed

### Removed

## [0.3.0] - 2026-02-26

### Added

- Ylläpidon koirasivulla voi nyt lisätä uusia koiria: rekisterinumero, nimi, sukupuoli, syntymäaika, kasvattaja, omistajat, uros, emä, EK-numero ja muistiinpanot.
- Ylläpidon koirasivun haku ja listaus hakee datan suoraan tietokannasta.
- Ylläpidon koirasivulla voi nyt myös muokata ja poistaa koiria.
- Pudotusvalikkoihin koiraa luodessa ja muokatessa lisättiin kasvattaja-, omistaja- ja vanhempivalinnat automaattisilla ehdotuksilla.
- Kenttiin lisättiin validointeja (esim. rekisterinumero, syntymäaika ja vanhempien sukupuolirajoitteet).
- Admin koiralista sekä muokkaus että luontisivu tukevat useaa rekisterinumeroa, ensimmäinen on aina esitetty defaulttina. Järjestystä voi muuttaa.

### Changed

### Fixed

### Removed

## [0.2.0] - 2026-02-19

### Tärkeintä tässä julkaisussa

- Tässä versiossa otettiin käyttöön uusi käyttäjähallinta sekä turvallinen better-auth kirjautuminen. Samalla paranneltiin taustatoimintoja ja testausta, jotta mahdolliset virheet tulevat herkemin ilmi. Ylläpitäjä voi luoda käyttäjätunnuksia, poistaa, jäädyttää ja resetoida salasanat. Toistaiseksi käytössä on vain yksi käyttäjärooli (admin) mutta tietokannassa on valmius peruskäyttäjälle.

### Added

- Palveluun lisättiin uusi kirjautumis- ja istunnonhallinta.
- Ylläpidolle lisättiin selkeä Admin-alue, jossa on omat sivut etusivulle, käyttäjille, koirille ja asetuksille.
- Ylläpitoon lisättiin käyttäjähallinnan perustoiminnot: käyttäjän luonti, poisto, jäädytys/aktivointi ja salasanan vaihto.
- Käyttäjille lisättiin oma Tiliprofiili-sivu.
- Ylläpidon ensimmäisen pääkäyttäjän käyttöönottoon lisättiin oma komentotyökalu (ajetaanpaikalliseslta koneelta suoraan tietokantaan).
- Komentotyökalu salasanan vaihtamiseen.

### Changed

- Ylläpidon sivupalkki ja navigaatio järjesteltiin selkeämmäksi.

### Fixed

### Removed

- Vanha kirjautumisratkaisu ja siihen liittyneet vanhat välikerrokset poistettiin.

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
