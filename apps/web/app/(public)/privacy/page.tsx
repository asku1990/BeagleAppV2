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
        Beagletietokanta on Suomen Beaglejärjestö ry:n ylläpitämä verkkopalvelu,
        joka tarjoaa beagle-rotuun liittyviä tietokanta- ja hakutoimintoja.
      </p>
      <p className={cn("mt-2 text-sm md:text-base", beagleTheme.inkText)}>
        Palvelu on tarkoitettu Suomen Beaglejärjestön toiminnan ja rodun
        harrastustoiminnan tukemiseen.
      </p>
      <p className={cn("mt-2 text-sm md:text-base", beagleTheme.inkText)}>
        Tämä seloste koskee vain Beagletietokanta -sovellusta. Yhdistyksen
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

        <PrivacySection title="Mitä tietoja käsitellään ja miksi">
          <p>
            Palvelun käyttäjätilit luo ylläpito. Käsiteltäviä tietoja ovat
            käyttäjätilin perustiedot (nimi, sähköposti, rooli), kirjautumis- ja
            istuntotiedot, suostumus- ja asetustiedot (esim. kieli) sekä
            tekniset lokitiedot.
          </p>
          <p>
            Palvelun toiminnan ja tietoturvan varmistamiseksi järjestelmä voi
            tallentaa teknisiä lokitietoja, kuten aikaleiman, IP-osoitteen ja
            pyydetyn resurssin.
          </p>
          <p>
            Käsittelyn oikeusperuste on rekisterinpitäjän oikeutettu etu
            palvelun ylläpitämiseen, suojaamiseen ja kehittämiseen sekä
            sopimuksen täytäntöönpano silloin, kun palvelussa käytetään
            kirjautumista vaativia toimintoja.
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
            Suostumuksen jälkeen sivustolla voidaan käyttää Vercel Analytics- ja
            Vercel Speed Insights -palveluja anonyymin liikenteen ja
            suorituskyvyn mittaamiseen.
          </p>
          <p>
            Analytiikkaa käytetään vain yleisen tason liikenne- ja
            suorituskykymittaukseen, eikä sitä käytetä yksittäisen käyttäjän
            suoraan tunnistamiseen.
          </p>
          <CookieChoicesButton />
        </PrivacySection>

        <PrivacySection title="Tietolähteet, luovutukset ja suojaus">
          <p>
            Tiedot saadaan rekisteröidyltä itseltään sekä palvelun käytön
            yhteydessä muodostuvista teknisistä tapahtumatiedoista.
          </p>
          <p>
            Tietoja voivat käsitellä rekisterinpitäjän lukuun tekniset
            palveluntarjoajat. Näihin kuuluvat esimerkiksi Vercel (hosting),
            Vercel Analytics ja Vercel Speed Insights (analytiikka ja
            suorituskykymittaus). Käyttäjätilien tunnistautuminen toteutetaan
            Better Auth -ohjelmistolla osana palvelua.
          </p>
          <p>
            Henkilötietoja ei luovuteta muihin tarkoituksiin ilman perustetta.
            Tietoja voidaan luovuttaa viranomaisille lakiin perustuvan
            vaatimuksen perusteella. Palvelu suojataan teknisin ja
            organisatorisin toimenpitein, kuten käyttöoikeuksin ja salatulla
            HTTPS/TLS-yhteydellä.
          </p>
        </PrivacySection>

        <PrivacySection title="Säilytys">
          <p>
            Käyttäjätiliin liittyviä tietoja säilytetään niin kauan kuin
            käyttäjätili on aktiivinen. Tilin poistamisen jälkeen tietoja
            voidaan säilyttää rajoitetun ajan tietoturvan, väärinkäytösten
            estämisen ja lakisääteisten velvoitteiden täyttämiseksi.
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <code>beagle.analytics_consent</code> enintään 12 kuukautta.
            </li>
            <li>
              <code>beagle.locale</code> evästeessä ja localStoragessa enintään
              12 kuukautta.
            </li>
            <li>
              <code>sidebar_state</code> enintään 7 päivää.
            </li>
          </ul>
        </PrivacySection>

        <PrivacySection title="Rekisteröidyn oikeudet">
          <p>
            Rekisteröidyllä on oikeus tarkastaa itseään koskevat tiedot sekä
            pyytää tietojen oikaisua, poistamista tai käsittelyn rajoittamista
            sekä vastustaa käsittelyä lain sallimissa tilanteissa.
            Rekisteröidyllä on myös oikeus tehdä valitus Tietosuojavaltuutetun
            toimistolle (
            <a
              href="https://tietosuoja.fi/etusivu"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2"
            >
              tietosuoja.fi
            </a>
            ).
          </p>
        </PrivacySection>

        <PrivacySection title="Yhteydenotot">
          <p>
            Kaikissa henkilötietojen käsittelyyn ja omien oikeuksien
            käyttämiseen liittyvissä kysymyksissä yhteys:
            jasenrekisteri@beaglejarjesto.fi.
          </p>
          <p>
            Lisätietoja tietosuojasta:{" "}
            <a
              href="https://tietosuoja.fi/etusivu"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2"
            >
              tietosuoja.fi
            </a>
            .
          </p>
        </PrivacySection>
      </div>

      <p className={cn("mt-8 text-xs md:text-sm", beagleTheme.mutedText)}>
        Päivitetty viimeksi: {lastUpdated}
      </p>
    </section>
  );
}
