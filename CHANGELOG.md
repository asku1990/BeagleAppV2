# Changelog

This project uses a user-facing changelog format.

## How to write entries

- Keep language plain first; add technical detail only when useful.
- Internal-only changes are optional in the changelog.
- Use sections: `Added`, `Changed`, `Fixed`, `Removed`.
- Add ongoing work under `## Unreleased`.
- Move `Unreleased` entries into a dated `## [x.y.z] - YYYY-MM-DD` block only when preparing a release.

## Unreleased

### Added

- Ylläpitoon lisättiin uusi `Näyttelyt`-moduulin aloitussivu (`/admin/shows`), joka varaa erilliset osiot workbook-tuonnille, tuontiajoille sekä tulevalle näyttelyhaulle ja muokkaukselle.
- `Näyttelyt`-ylläpidossa workbook-tuonti siirrettiin omaan työtilaan `/admin/shows/import`, kun taas `/admin/shows` toimii nyt moduulin aloitussivuna. Tuontityötila sisältää inline-validoinnin sekä jäsennetyn preview-osion ennen varsinaista kirjoitusvaihetta.

### Changed

- vanhan datan tuonti on nyt jaettu selkeisiin vaiheisiin: `import:phase1` (perustiedot), `import:phase2` (kokeet), `import:phase3` (näyttelyt) sekä valinnainen `import:bootstrap`-ajo (`auth:bootstrap-admin -> seed:show-result-definitions -> seed:show-workbook-import-schema -> phase1 -> phase2 -> phase3`).
- Tuonnin virhe- ja huomioraportointi käyttää edelleen yhteistä `ImportRun`/`ImportRunIssue`-mallia, mutta raportointi tehdään nyt vaihekohtaisesti omalla run id:llä. Koe- ja näyttelyvalidointien koodit ovat vaihekohtaiset (`TRIAL_*`, `SHOW_*`), jotta CSV-yhteenvedot ovat selkeämmät.
- Näyttelyiden Kennelliitto-workbook-tuonnissa validoinnin jälkeen preview avautuu nyt samalla sivulla automaattisesti, validointi supistuu tiiviiksi tilasummaksi ja preview näyttää myös hylätyt rivit omalla tilallaan, jotta workbookin kaikki tapahtumarivit voi tarkistaa ilman erillistä modal-/overlay-vaihetta.
- Esikatselussa tapahtuman otsikko, metatiedot ja rivit yhdistettiin yhdeksi kortiksi per tapahtuma, jotta preview on helpompi lukea ja siihen mahtuu paremmin koko tapahtumakokonaisuus kerralla.
- Workbook-tuonnin header-matching on nyt tolerantimpi rivinvaihdolle, ylimääräisille välilyönneille ja välimerkille, mutta edelleen vaatii samat import-kriittiset sarakkeet.
- Näyttelyiden workbook-preview käyttää nyt tietokantaan siirrettyä Kennelliitto-workbookin sarakemetadataa (`ShowWorkbookColumnRule`), jossa jokainen ei-tyhjä sarake ratkaistaan tuoduksi, eksplisiittisesti ohitetuksi tai estetyksi. Tuntemattomat lisäsarakkeet, duplikaattiheaderit ja nimeämättömät dataa sisältävät sarakkeet estävät validoinnin hiljaisen ohituksen sijaan, kun taas esimerkiksi `Rotukoodi` näkyy nyt ohitettuna metadatapolitiikan kautta.
- Workbook-tuonnin rakenteellisten arvojen normalisointia kiristettiin: `Luokka`- ja `Laatuarvostelu`-kentissä hyväksytään vain tuetut workbook-arvot, eikä parseri enää muuta spekulatiivisia aliasmuotoja kuten `JU` -> `JUN` tai `AVK` -> `AVO`.
- Näyttelytulosten normalisointi erottaa nyt parseri- ja näyttönäkymän: ennen vuotta 2003 legacy-muoto (`JUN1`, `KÄY2`) esitetään käyttöliittymässä muodossa `JUN-1` / `KÄY-2`, kun taas vuodesta 2003 alkaen käytetään modernia muotoa (`JUN-ERI`, `KÄY-H`). Samalla phase3-parseri tallentaa pre-2003 luokka+numero -laadut uuteen `LEGACY-LAATUARVOSTELU`-määritelmään unmapped-tokenien sijaan.
- Phase3 lisää nyt informatiivisen `ImportRunIssue`-merkinnän, kun luokka+numero -laatuarvostelu (`JUN1`, `NUO2` jne.) normalisoidaan vuoden 2003 jälkeiseen moderniin muotoon. Tällä näkyy suoraan, milloin parseri käytti 2003-rajauksen yli menevää laatuarvostelun tulkintaa.
- Kanonisten näyttelytulosmääritelmien koodit yhdenmukaistettiin Kennelliiton workbook-muotoon (`varaSERT`, `NORD-SERT`, `NORD-varaSERT`, `varaCACIB`, `CACIB-J`, `CACIB-V`, `JUN-SERT`, `VET-SERT`, `JUN-ROP`, `VET-ROP`, `JUN-VSP`, `VET-VSP`), ja sertti-/CACIB-määritelmien ruotsinkieliset nimet asetettiin toistaiseksi tyhjiksi.
- Julkiset näyttelyhaut, näyttelyn tulossivu, koiraprofiilin näyttelyrivit sekä julkiset näyttelylaskurit lukevat nyt kanonisesta näyttelymallista (`ShowEvent`, `ShowEntry`, `ShowResultItem`) vanhan `ShowResult`-taulun sijaan.
- Julkinen näyttelyn tulossivu ja koiraprofiilin näyttelykortti näyttävät nyt kanoniset näyttelytiedot rakenteisina kenttinä Kennelliiton tyyliin (`Tyyppi`, `Laatuarvostelu`, `Sijoitus`, `PU/PN`, `Muut merkinnät`, `Sanallinen arvostelu`) yhden legacy-tyylisen tulostekstin sijaan.

### Fixed

### Removed

## [0.7.0] - 2026-03-10

### Added

- Koiraprofiili näyttää nyt pentueosion, jossa jälkeläiset on ryhmitelty pentueittain ja mukana ovat pentuemäärät, koirakohtaiset linkit sekä pentukohtaisia tietosarakkeita kuten sukupuoli, koe- ja näyttelymäärä sekä pentuemäärä.
- Koiraprofiili näyttää nyt myös `Sisarukset`-osion, joka listaa saman syntymäpentueen sisarukset omana korttinaan ennen pentueosiota.

### Changed

- Koiraprofiilin perustietokorttiin lisättiin isä- ja emätiedot linkkeinä. Tyhjät toissijaiset osiot (sisarukset, pentueet, näyttelyt, kokeet) piilotetaan, ja pitkissä listoissa näytetään rajattu määrä rivejä `Näytä lisää / Näytä vähemmän` -toiminnolla sekä näkyvien rivien laskurilla.
- Linkkityylit yhtenäistettiin profiili-, haku-, näyttely- ja koenäkymissä: avauslinkit ja tekstipohjaiset kopiointitoiminnot käyttävät nyt samoja globaaleja linkki-/toimintotyylejä.
- Etusivun, beaglehaun, näyttelyhaun ja ajokoehaun yläosan logo + otsikko -rakenne yhtenäistettiin ja siirrettiin jaettuun `FeatureHeroHeader`-komponenttiin. Mobiilin otsikkorivi käyttää nyt samaa tiiviimpää asettelua kaikissa näissä näkymissä.
- Sivupalkki avautuu nyt oletuksena desktopissa, ja sen leveys sekä navigaatio-/profiilirivien mitoitus tiivistettiin, jotta sisältöalueelle jää enemmän tilaa.

### Fixed

### Removed

## [0.6.3] - 2026-03-08

### Added

### Changed

- Sivupalkki näyttää nyt vain toimivat kohteet. Keskeneräiset linkit poistettiin päävalikosta, ja näkyvien julkisten osioiden nimet yhtenäistettiin muotoon `Beaglet`, `Koetulokset` ja `Näyttelyt`.
- Beaglehaun `Viimeisimmät lisäykset` näkyy nyt vain ennen haun suorittamista. Aktiivinen haku näyttää vain varsinaiset hakutulokset, jolloin sivu pysyy selkeämpänä.
- Beaglehaun tuloslistasta poistettiin keskeneräinen `Lisätiedot`-toimintosarake. Tulosriviltä siirrytään nyt suoraan koiran profiiliin nimen tai rekisterinumeron kautta.
- Beaglehaun desktop-tulostaulukossa `Nimi` siirrettiin heti rekisterinumeron jälkeen, jotta koiran tärkeimmät tunnistetiedot näkyvät vierekkäin.
- Evästebannerin tekstiä selkeytettiin käyttäjäystävällisemmäksi, ja bannereihin lisättiin suora linkki tietosuoja- ja evästetietoihin.

### Fixed

### Removed

## [0.6.2] - 2026-03-07

### Added

- Palveluun lisättiin julkinen `Tietosuoja`-sivu (`/privacy`) sekä sivupalkin alatunnisteessa aina näkyvä `Tietosuoja`-toiminto. `Avaa evästevalinnat` -painikkeella voi avata suostumusbannerin uudelleen `Tietosuoja`-sivulta.
- Vercel Analytics ja Speed Insights otetaan nyt käyttöön vasta, kun käyttäjä antaa siihen suostumuksen analytiikkabannerissa.
- `Tietosuoja`-sivu uudistettiin selkeäksi suomenkieliseksi tietosuojaselosteeksi. Sivulla kuvataan palvelun käytössä olevat evästeet, analytiikkasuostumus ja rekisteröidyn oikeudet.

## [0.6.1] - 2026-03-07

### Added

- Palveluun lisättiin Vercelin Web Analytics ja Speed Insights, joiden avulla Vercel-julkaisut keräävät automaattisesti tietoa kävijöistä, sivunäytöistä ja sivuston suorituskyvystä.
- Julkiselle näyttelyhaulle lisättiin leikepöytätoiminnot: hakusivulla voi kopioida näkyvän sivun tulokset ja näyttelyn tulossivulla yksittäisen rivin tai kaikki rivit TSV-muodossa.
- Koiran profiilin näyttely- ja koetuloskortteihin lisättiin "Kopioi kaikki" -toiminnot TSV-vientiä varten.
- Koiran profiilin koetuloskortin TSV-vienti sisältää nyt myös samat yksityiskohtaiset koemittarit kuin julkinen ajokokeen tulossivu, jotta rivien vertailu onnistuu paremmin esimerkiksi Excelissä.
- Koiraprofiilin näyttely sekä ajokoe paikkojen nimet toimii linkkinä tapahtumaan.

### Changed

- Julkisten näyttely- ja koetulossivujen leikepöytätoiminnot käyttävät nyt samaa jaettua formatter/action-polkujen rakennetta.
- Koiran profiilin näyttely- ja koetulokset haetaan nyt show/trial-domainin kautta, ja vanhat dog-domainin päällekkäiset tuloshelperit poistettiin.

### Fixed

### Removed

## [0.6.0] - 2026-03-06

### Added

- Uusi julkinen ajokoehaku sivulle `/beagle/trials`: haku vuosittain tai päivämäärävälillä, lajittelu, sivutus sekä desktop- ja mobiilitulosnäkymät.
- Uusi julkinen ajokokeen tulossivu `/beagle/trials/[trialId]`, jossa näkyvät koirakohtaiset koetiedot (rekisterinumero, nimi, sukupuoli, keli, palkinto, sijoitus, pisteet, tuomari).
- Ajokoetulosten hakusivulle lisättiin "Kopioi sivun tulokset" -toiminto, joka kopioi näkyvät tulosrivit leikepöydälle taulukkomuodossa. (kaikki tietokannan data)
- Ajokokeen tulossivulle lisättiin "Kopioi rivi" ja "Kopioi kaikki" -toiminnot koirakohtaisten tulosten vientiin leikepöydälle.

### Changed

- Sivupalkin `Koetulosten haku`-valinta avaa nyt uuden julkisen ajokoehaun (`/beagle/trials`). `Ajokokeet`-valinta on edelleen toistaiseksi tulossa myöhemmin.

### Fixed

### Removed

## [0.5.0] - 2026-03-06

### Added

- Uusi julkinen näyttelyhaku sivulle `/beagle/shows`: haku vuosittain tai päivämäärävälillä, lajittelu, sivutus sekä desktop- ja mobiilitulosnäkymät.
- Uusi julkinen näyttelyn tulossivu `/beagle/shows/[showId]`, jossa näkyvät näyttelyn koirat riveittäin (rekisterinumero, nimi, sukupuoli, tulos, korkeus, tuomari).
- Näyttelyn tulossivulla varaus arvostelutekstille (arvostelu tekstit eivät ole vielä uudessa tietokannassa).

### Changed

### Fixed

### Removed

## [0.4.2] - 2026-03-04

### Added

### Changed

- Koko sovelluksen kansiorakenne yhtenäistettiin paremman hallittavuuden mahdollistamiseksi ilman toiminnallisia muutoksia.
- Datan tuonti scripti 1 vanhasta tietokannasta päivitetty niin, että `FI`- ja `SF`-prefiksilliset rekisterinumerot lisätään aina ensin, jolloin ensimmäisestä tulee oletusrekisterinumero. Käyttöliittymä näyttää oletuksena vanhimman (ensimmäisenä lisätyn) rekisterinumeron. Tämä mahdollistaa käyttää suomalaista numeroa ensisijaisena.

### Fixed

- Koiran profiilin sukutaulun kortit pysyvät nyt aina oikean jälkeläislinjan kohdalla myös silloin, kun osa sukupuun tiedoista puuttuu. Puuttuvat vanhemmat näytetään lokalisoidulla "Tuntematon/Okänd"-tekstillä, jotta taulun rakenne pysyy selkeänä.

### Removed

## [0.4.1] - 2026-03-02

### Added

### Changed

- Koiran profiilin näyttely osiossa sarakejärjestys päivitettiin niin, että korkeus näytetään ennen tuomaria.
- Koiran profiilin sukutaulussa vanhemmat toimivat profiililinkkeinä ja vanhemman EK/SSB-numero näytetään nimen perässä, kun arvo on saatavilla. Näin on mahdollista seurata sukutaulua eteenpäin.

### Fixed

- Koiran profiilin koetulosten palkinto sasarake noudattaa nyt vanhaa luokkalogiikkaa (`Avo` / `Voi` / `Beaj`) kovakoodatun `BEAJ`-prefiksin sijaan.

### Removed

## [0.4.0] - 2026-02-27

### Added

- Uusi ulkinen koiran profiilisivu `/beagle/dogs/[dogId]`.
- Profiilisivulla koiran perustiedot, sukutaulu (3 sukupolvea), sekä näyttely- ja koetulokset.

### Changed

- Beagle-haun tuloksissa koiran rekisterinumero ja nimi toimivat nyt linkkeinä koiran profiilisivulle sekä desktop- että mobiilinäkymässä.

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
