import { beagleTheme } from "@/components/ui/beagle-theme";
import { CookieChoicesButton } from "@/components/privacy";
import { cn } from "@/lib/utils";

const lastUpdated = "7.3.2026";

function PrivacySection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className={cn(beagleTheme.headingSm, beagleTheme.inkStrongText)}>
        {title}
      </h2>
      <div
        className={cn(
          "mt-2 space-y-3 text-sm md:text-base",
          beagleTheme.inkText,
        )}
      >
        {children}
      </div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <section
      className={cn(
        beagleTheme.panel,
        "scroll-mt-16 px-5 py-5 md:px-6 md:py-6",
      )}
    >
      <h1 className={cn(beagleTheme.headingLg, beagleTheme.inkStrongText)}>
        Tietosuojaseloste
      </h1>
      <p className={cn("mt-2 text-sm md:text-base", beagleTheme.inkText)}>
        Tämä tietosuojaseloste on laadittu EU:n yleisen tietosuoja-asetuksen
        (GDPR, EU 2016/679) mukaisesti.
      </p>
      <p className={cn("mt-2 text-sm md:text-base", beagleTheme.inkText)}>
        Beagle App v2 on Suomen Beaglejärjestö ry:n ylläpitämä verkkopalvelu,
        joka tarjoaa beagle-rotuun liittyviä tietokanta- ja hakutoimintoja.
      </p>
      <p className={cn("mt-2 text-sm md:text-base", beagleTheme.inkText)}>
        Tämä seloste koskee vain Beagle App v2 -sovellusta. Yhdistyksen
        erillinen jäsenrekisteri ja vanha v1-foorumi noudattavat omia
        tietosuojaselosteitaan.
      </p>

      <div className="mt-6 space-y-6">
        <PrivacySection title="Rekisterinpitäjä">
          <ul className="list-disc space-y-1 pl-5">
            <li>Suomen Beaglejärjestö - Finska Beagleklubben r.y.</li>
            <li>Y-tunnus: [täydennä]</li>
            <li>Sähköposti: jasenrekisteri@beaglejarjesto.fi</li>
          </ul>
        </PrivacySection>

        <PrivacySection title="Tietosuoja-asioista vastaava yhteyshenkilö">
          <ul className="list-disc space-y-1 pl-5">
            <li>Jäsensihteeri / tietosuoja-asioiden yhteyshenkilö</li>
            <li>Sähköposti: jasenrekisteri@beaglejarjesto.fi</li>
          </ul>
        </PrivacySection>

        <PrivacySection title="Henkilötietojen käsittelyn peruste ja tarkoitus">
          <p>
            Henkilötietojen käsittelyn perusteena on rekisterinpitäjän
            oikeutettu etu palvelun ylläpitämiseksi, turvaamiseksi ja
            kehittämiseksi sekä sopimuksen täytäntöönpano niiltä osin, kun
            palvelussa tarjotaan kirjautumista vaativia toimintoja.
          </p>
          <p>
            Kerättyjä tietoja käytetään käyttäjän tunnistamiseen, istuntojen ja
            käyttöoikeuksien hallintaan, kieli- ja käyttöliittymäasetusten
            tallentamiseen, tietoturvan varmistamiseen sekä palvelun käyttö- ja
            suorituskykytietojen mittaamiseen silloin, kun käyttäjä on antanut
            analytiikkaa koskevan suostumuksensa.
          </p>
          <p>
            Palvelussa voidaan esittää julkisiin lähteisiin perustuvia koira- ja
            kilpailutietoja rodun harrastus- ja tietopalvelun tukemiseen.
          </p>
        </PrivacySection>

        <PrivacySection title="Evästeet">
          <p>
            Eväste (cookie) on pieni tekstitiedosto, jonka internetselain
            tallentaa käyttäjän laitteelle. Evästeitä käytetään esimerkiksi
            silloin, kun käyttäjän valinnat halutaan säilyttää tämän siirtyessä
            sivulta toiselle. Analytiikkaevästeiden tai vastaavien
            selaintallennusten käyttö edellyttää käyttäjän suostumusta.
          </p>
          <p>
            Tämä sivusto käyttää tällä hetkellä muun muassa seuraavia evästeitä
            ja selaintallennuksia:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <code>beagle.locale</code> säilyttää valitun kieliversion
              evästeessä ja selaimen localStoragessa enintään 12 kuukauden ajan.
            </li>
            <li>
              <code>sidebar_state</code> säilyttää sivupalkin
              auki/suljettu-tilan evästeessä enintään 7 päivän ajan.
            </li>
            <li>
              <code>beagle.analytics_consent</code> tallentaa käyttäjän
              analytiikkasuostumuksen enintään 12 kuukauden ajan.
            </li>
            <li>
              Kirjautumista varten käytetään Better Auth -ratkaisun
              istuntoevästeitä, jotka ovat välttämättömiä sisäänkirjautumisen ja
              käyttäjätilin käytön kannalta.
            </li>
          </ul>
          <p>
            Suostumuksen jälkeen analytiikkaan voidaan käyttää Vercel Analytics-
            ja Vercel Speed Insights -palveluja anonyymin liikenteen ja
            suorituskyvyn mittaamiseen.
          </p>
          <p>
            Analytiikkaa käytetään vain yleisen tason liikenne- ja
            suorituskykymittaukseen, eikä sitä käytetä yksittäisen käyttäjän
            suoraan tunnistamiseen.
          </p>
          <CookieChoicesButton />
        </PrivacySection>

        <PrivacySection title="Säännönmukaiset tietolähteet">
          <p>
            Henkilörekisteriin merkittävät tiedot saadaan säännönmukaisesti
            rekisteröidyltä itseltään kirjautumisen, käyttäjätilin ylläpidon ja
            palvelun käytön yhteydessä.
          </p>
          <p>
            Beagle App v2:ssa tämä tarkoittaa erityisesti käyttäjätilin
            perustietoja ja kirjautumiseen liittyviä tietoja. Sovellus ei
            sisällä vanhan v1-foorumin kaltaista keskustelupalstaa, julkista
            rekisteröintiä tai käyttäjien julkaisemia viestejä.
          </p>
          <p>
            Lisäksi palvelun käytöstä muodostuu teknisiä tietoja, kuten
            kielivalinta, evästevalinnat, istuntotiedot sekä analytiikkaa varten
            kerättävät käyttö- ja suorituskykytiedot silloin, kun käyttäjä on
            hyväksynyt analytiikan.
          </p>
          <p>
            Palvelun toiminnan ja tietoturvan varmistamiseksi infrastruktuuri ja
            sovellus voivat tallentaa teknisiä lokitietoja, kuten IP-osoitteen,
            aikaleiman, pyydetyn resurssin ja virhetilanteisiin liittyviä
            teknisiä tietoja. Lokitietoja käytetään virhetilanteiden
            selvittämiseen, väärinkäytösten estämiseen ja tietoturvan
            valvontaan.
          </p>
        </PrivacySection>

        <PrivacySection title="Henkilötietojen luovuttaminen">
          <p>
            Henkilötietoja ei luovuteta säännönmukaisesti ulkopuolisille muihin
            tarkoituksiin kuin palvelun tekniseen toteuttamiseen.
          </p>
          <p>
            Tietoja voivat käsitellä rekisterinpitäjän lukuun palvelun tekniset
            palveluntarjoajat. Näihin kuuluvat esimerkiksi Vercel
            hosting-palveluna sekä Vercel Analytics ja Vercel Speed Insights
            analytiikka- ja suorituskykymittaukseen. Käyttäjätilien
            tunnistautuminen toteutetaan Better Auth -ohjelmistolla osana
            palvelua. Tietoja voidaan lisäksi luovuttaa viranomaisille lakiin
            perustuvan vaatimuksen perusteella.
          </p>
          <p>
            Tietoja voidaan käsitellä myös EU- tai ETA-alueen ulkopuolella, jos
            palvelun tekninen toteutus sitä edellyttää. Tällöin siirrot tehdään
            soveltuvan tietosuojalainsäädännön sallimilla suojatoimilla.
          </p>
        </PrivacySection>

        <PrivacySection title="Henkilötietojen suojaus">
          <p>
            Palvelu suojataan asianmukaisilla teknisillä ja organisatorisilla
            toimenpiteillä. Yhteydet palveluun suojataan HTTPS/TLS-yhteydellä,
            pääsy henkilötietoihin rajataan käyttöoikeuksin ja tietoja
            käsittelevät vain ne henkilöt, joilla on siihen työtehtävien
            perusteella oikeus.
          </p>
        </PrivacySection>

        <PrivacySection title="Tietojen säilytysaika">
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Käyttäjätiliin liittyviä tietoja säilytetään niin kauan kuin
              käyttäjätili on aktiivinen. Käyttäjätilin poistamisen jälkeen
              tietoja voidaan säilyttää rajoitetun ajan palvelun tietoturvan,
              väärinkäytösten estämisen ja lakisääteisten velvoitteiden
              täyttämiseksi.
            </li>
            <li>
              <code>beagle.analytics_consent</code> säilyy selaimessa enintään
              12 kuukautta.
            </li>
            <li>
              <code>beagle.locale</code> säilyy evästeessä ja localStoragessa
              enintään 12 kuukautta.
            </li>
            <li>
              <code>sidebar_state</code> säilyy selaimen evästeessä enintään 7
              päivää.
            </li>
          </ul>
        </PrivacySection>

        <PrivacySection title="Profilointi">
          <p>
            Palvelussa ei tehdä suoramarkkinointiin perustuvaa profilointia.
            Suostumuksella aktivoitavaa analytiikkaa käytetään vain palvelun
            käytön ja suorituskyvyn mittaamiseen yleisellä tasolla.
          </p>
        </PrivacySection>

        <PrivacySection title="Rekisteröidyn oikeudet">
          <div>
            <h3 className={cn("font-semibold", beagleTheme.inkStrongText)}>
              Oikeus saada pääsy henkilötietoihin
            </h3>
            <p className="mt-1">
              Rekisteröidyllä on oikeus saada vahvistus siitä, käsitelläänkö
              häntä koskevia henkilötietoja, ja jos käsitellään, oikeus saada
              kopio henkilötiedoistaan.
            </p>
          </div>

          <div>
            <h3 className={cn("font-semibold", beagleTheme.inkStrongText)}>
              Oikeus tietojen oikaisemiseen
            </h3>
            <p className="mt-1">
              Rekisteröidyllä on oikeus pyytää, että häntä koskevat epätarkat,
              virheelliset tai puutteelliset henkilötiedot korjataan tai
              täydennetään.
            </p>
          </div>

          <div>
            <h3 className={cn("font-semibold", beagleTheme.inkStrongText)}>
              Oikeus tietojen poistamiseen
            </h3>
            <p className="mt-1">
              Rekisteröidyllä on oikeus pyytää itseään koskevien henkilötietojen
              poistamista esimerkiksi silloin, kun tietoja ei enää tarvita
              niihin tarkoituksiin, joita varten ne on kerätty, tai tietoja on
              käsitelty lainvastaisesti.
            </p>
          </div>

          <div>
            <h3 className={cn("font-semibold", beagleTheme.inkStrongText)}>
              Oikeus käsittelyn rajoittamiseen
            </h3>
            <p className="mt-1">
              Rekisteröidyllä on oikeus pyytää henkilötietojensa käsittelyn
              rajoittamista esimerkiksi silloin, kun hän kiistää tietojen
              paikkansapitävyyden tai käsittelyn lainmukaisuuden.
            </p>
          </div>

          <div>
            <h3 className={cn("font-semibold", beagleTheme.inkStrongText)}>
              Vastustamisoikeus
            </h3>
            <p className="mt-1">
              Rekisteröidyllä on oikeus henkilökohtaiseen tilanteeseensa
              liittyvällä perusteella vastustaa henkilötietojensa käsittelyä
              silloin, kun käsittely perustuu rekisterinpitäjän oikeutettuun
              etuun.
            </p>
          </div>

          <div>
            <h3 className={cn("font-semibold", beagleTheme.inkStrongText)}>
              Oikeus siirtää tiedot järjestelmästä toiseen
            </h3>
            <p className="mt-1">
              Rekisteröidyllä on oikeus saada itse toimittamansa henkilötiedot
              jäsennellyssä, yleisesti käytetyssä ja koneellisesti luettavassa
              muodossa sekä siirtää ne toiselle rekisterinpitäjälle, jos
              käsittely perustuu suostumukseen tai sopimukseen ja tapahtuu
              automaattisesti.
            </p>
          </div>

          <div>
            <h3 className={cn("font-semibold", beagleTheme.inkStrongText)}>
              Oikeus olla joutumatta automatisoitujen päätösten kohteeksi
            </h3>
            <p className="mt-1">
              Rekisteröidyllä on oikeus olla joutumatta sellaisen päätöksen
              kohteeksi, joka perustuu pelkästään automaattiseen käsittelyyn ja
              jolla on häntä koskevia oikeusvaikutuksia tai joka vaikuttaa
              häneen vastaavalla tavalla merkittävästi. Palvelu ei tällä
              hetkellä tee tällaisia päätöksiä.
            </p>
          </div>

          <div>
            <h3 className={cn("font-semibold", beagleTheme.inkStrongText)}>
              Oikeus tehdä valitus valvontaviranomaiselle
            </h3>
            <p className="mt-1">
              Rekisteröidyllä on oikeus tehdä valitus Tietosuojavaltuutetun
              toimistolle (
              <a
                href="https://tietosuoja.fi/etusivu"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2"
              >
                tietosuoja.fi
              </a>
              ), jos hän katsoo, että henkilötietojen käsittelyssä rikotaan
              soveltuvaa tietosuojalainsäädäntöä.
            </p>
          </div>
        </PrivacySection>

        <PrivacySection title="Yhteydenotot">
          <p>
            Kaikissa henkilötietojen käsittelyyn ja omien oikeuksien
            käyttämiseen liittyvissä kysymyksissä rekisteröidyn tulee ottaa
            yhteyttä tietosuoja-asioista vastaavaan yhteyshenkilöön
            sähköpostitse osoitteeseen jasenrekisteri@beaglejarjesto.fi.
          </p>
        </PrivacySection>
      </div>

      <p className={cn("mt-8 text-xs md:text-sm", beagleTheme.mutedText)}>
        Päivitetty viimeksi: {lastUpdated}
      </p>
    </section>
  );
}
