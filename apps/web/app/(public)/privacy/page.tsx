import { beagleTheme } from "@/components/ui/beagle-theme";
import { cn } from "@/lib/utils";

const lastUpdated = "29.8.2026";

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
        Tässä selosteessa kerrotaan, miten Suomen Beaglejärjestö käsittelee
        henkilötietoja Beagletietokannassa.
      </p>
      <p className={cn("mt-2 text-sm md:text-base", beagleTheme.inkText)}>
        Seloste koskee vain Beagletietokantaa. Yhdistyksen jäsenrekisteriä ja
        muita palveluja koskevat niiden omat tietosuojatiedot.
      </p>

      <div className="mt-6 space-y-6">
        <PrivacySection title="Rekisterinpitäjä ja yhteystiedot">
          <ul className="list-disc space-y-1 pl-5">
            <li>Suomen Beaglejärjestö - Finska Beagleklubben r.y.</li>
            <li>Y-tunnus: 1742495-0</li>
            <li>
              Sähköposti:{" "}
              <a
                href="mailto:tietosuoja@beaglejarjesto.fi"
                className="underline underline-offset-2"
              >
                tietosuoja@beaglejarjesto.fi
              </a>
            </li>
          </ul>
        </PrivacySection>

        <PrivacySection title="Mitä henkilötietoja käsittelemme">
          <p>Beagletietokannassa voidaan käsitellä seuraavia henkilötietoja:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              koiran omistajan ja kasvattajan nimi, postinumero, paikkakunta ja
              yhteys koiraan;
            </li>
            <li>
              koe- ja näyttelytietoihin liittyvät omistajien ja toimihenkilöiden
              nimet, kotikunnat ja muut tulosasiakirjaan kuuluvat
              tunnistetiedot;
            </li>
            <li>
              valtuutetun käyttäjän nimi, sähköpostiosoite, rooli sekä
              kirjautumis- ja istuntotiedot; ja
            </li>
            <li>
              palvelun käytöstä syntyvät tekniset loki- ja auditointitiedot,
              kuten aikaleima, IP-osoite ja selaimen käyttäjäagentti.
            </li>
          </ul>
          <p>
            Koiran sukutaulu-, terveys-, koe- ja näyttelytiedot eivät yleensä
            ole henkilötietoja. Ne voivat kuitenkin liittyä henkilötietoon,
            esimerkiksi koiran omistajaan tai kokeen toimihenkilöön.
          </p>
        </PrivacySection>

        <PrivacySection title="Miksi tietoja käsitellään">
          <p>
            Tietoja käsitellään beagle-rodun sukutaulu-, omistus-, terveys-,
            koe- ja näyttelyhistorian ylläpitämiseksi, jalostusneuvonnan ja
            tilastoinnin tukemiseksi sekä palvelun hallintaa ja tietoturvaa
            varten.
          </p>
          <p>
            Käsittely perustuu Suomen Beaglejärjestön oikeutettuun etuun
            ylläpitää rotua koskevaa tietopalvelua, edistää rodun terveyttä ja
            jalostusta sekä suojata palvelua. Oikeutettuun etuun perustuvaa
            käsittelyä arvioidaan suhteessa rekisteröidyn oikeuksiin ja
            vapauksiin.
          </p>
          <p>
            Beagletietokannassa ei tehdä henkilöihin kohdistuvaa automaattista
            päätöksentekoa tai profilointia.
          </p>
        </PrivacySection>

        <PrivacySection title="Julkiset ja rajatut tiedot">
          <p>
            Julkisessa palvelussa esitetään koiria koskevia sukutaulu-,
            terveys-, koe-, näyttely- ja tilastotietoja. Palvelussa voidaan
            näyttää myös koiria koskevia laskennallisia jalostus- ja
            riskilukuja.
          </p>
          <p>
            Tavalliset julkiset koiranäkymät eivät näytä ylläpidon
            omistajarekisteriä tai omistajien osoitetietoja. Yksittäiset
            sairausrivit, niiden lähdetiedot ja ylläpidon muistiinpanot ovat
            vain tehtävään valtuutettujen ylläpitäjien ja asiantuntijoiden
            käytettävissä.
          </p>
          <p>
            Julkisiin virallisiin koe- ja näyttelytietoihin sekä
            koepöytäkirjoihin voi kuitenkin sisältyä omistajien ja
            toimihenkilöiden nimiä, kotikuntatietoja ja muita asiakirjaan
            kuuluvia tunnistetietoja.
          </p>
        </PrivacySection>

        <PrivacySection title="Mistä tiedot saadaan">
          <p>
            Koirien ja omistajien historialliset tiedot ovat peräisin Suomen
            Kennelliitolta ja Suomen Beaglejärjestön aiemmasta tietokannasta.
            Tiedot ovat olleet niitä kerättäessä julkisesti saatavilla tai ne on
            luovutettu rotujärjestön käyttöön.
          </p>
          <p>
            Koetulokset syntyvät Kennelliiton alaisten koetapahtumien
            yhteydessä. Beagletietokanta vastaanottaa tuloksia
            Koiratietokanta.fi-palvelun välittämän teknisen integraation kautta.
          </p>
          <p>
            Tietoja voidaan lisäksi täydentää ja korjata Suomen Beaglejärjestön
            valtuutettujen käyttäjien toimesta. Käyttäjätilien tiedot saadaan
            käyttäjältä tai tilin perustavalta ylläpitäjältä, ja tekniset tiedot
            muodostuvat palvelua käytettäessä.
          </p>
        </PrivacySection>

        <PrivacySection title="Tietojen käsittelijät, luovutukset ja suojaus">
          <p>
            Henkilötietoja käsittelevät vain henkilöt, jotka tarvitsevat niitä
            ylläpito- tai asiantuntijatehtävässään. Käyttöoikeudet rajataan
            tehtävän mukaan.
          </p>
          <p>
            Rekisterinpitäjän lukuun tietoja voivat käsitellä palvelun hosting-
            ja tietokantapalvelujen tarjoajat. Tuotantopalvelu ja sen tietokanta
            toimivat Microsoft Azure -ympäristössä.
          </p>
          <p>
            Henkilötietoja ei myydä. Niitä voidaan luovuttaa viranomaiselle
            lakiin perustuvan pyynnön perusteella. Jos palveluntarjoaja
            käsittelee tietoja EU- tai ETA-alueen ulkopuolella, siirrossa
            käytetään yleisen tietosuoja-asetuksen mukaisia suojatoimia.
          </p>
          <p>
            Palvelua suojataan muun muassa henkilökohtaisilla käyttäjätileillä,
            rajatuilla käyttöoikeuksilla, salatuilla verkkoyhteyksillä sekä
            teknisellä lokituksella.
          </p>
        </PrivacySection>

        <PrivacySection title="Tietojen säilytys">
          <p>
            Historiallisia koira-, omistus- ja tulostietoja säilytetään niin
            kauan kuin niitä tarvitaan tietokannan käyttötarkoituksiin ja rodun
            historian ylläpitämiseen. Virheellinen tai tarpeeton henkilötieto
            oikaistaan tai poistetaan, kun sen säilyttämiselle ei enää ole
            perustetta.
          </p>
          <p>
            Käyttäjätiliä säilytetään käyttöoikeustarpeen ajan. Kirjautumis-,
            loki- ja auditointitietoja säilytetään vain niin kauan kuin palvelun
            tietoturva, häiriöiden selvittäminen ja toiminnan luotettavuus
            edellyttävät.
          </p>
        </PrivacySection>

        <PrivacySection title="Evästeet ja selaintallennus">
          <p>
            Palvelu käyttää vain toiminnan ja käyttäjän valintojen kannalta
            tarpeellisia evästeitä ja selaintallennusta:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <code>beagle.locale</code> säilyttää kielivalinnan evästeessä ja
              selaimen localStoragessa enintään 12 kuukautta;
            </li>
            <li>
              <code>sidebar_state</code> säilyttää sivupalkin tilan enintään 7
              päivää; ja
            </li>
            <li>
              kirjautumisen välttämätön istuntoeväste pitää valtuutetun
              käyttäjän kirjautuneena ja vanhenee automaattisesti.
            </li>
          </ul>
        </PrivacySection>

        <PrivacySection title="Rekisteröidyn oikeudet">
          <p>
            Rekisteröidyllä on lain edellytysten täyttyessä oikeus tarkastaa
            itseään koskevat tiedot sekä pyytää niiden oikaisua, poistamista tai
            käsittelyn rajoittamista. Oikeutettuun etuun perustuvaa käsittelyä
            voi myös vastustaa henkilökohtaiseen erityiseen tilanteeseen
            liittyvällä perusteella.
          </p>
          <p>
            Oikeuksia koskevat pyynnöt lähetetään osoitteeseen{" "}
            <a
              href="mailto:tietosuoja@beaglejarjesto.fi"
              className="underline underline-offset-2"
            >
              tietosuoja@beaglejarjesto.fi
            </a>
            . Rekisterinpitäjä voi pyytää tarpeelliset tiedot pyynnön esittäjän
            henkilöllisyyden varmistamiseksi.
          </p>
          <p>
            Rekisteröidyllä on oikeus tehdä valitus{" "}
            <a
              href="https://tietosuoja.fi/etusivu"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2"
            >
              Tietosuojavaltuutetun toimistolle
            </a>
            .
          </p>
        </PrivacySection>

        <PrivacySection title="Muut Suomen Beaglejärjestön rekisterit">
          <p>
            Yhdistyksen jäsenrekisterin tietosuojatiedot ovat{" "}
            <a
              href="https://www.beaglejarjesto.fi/tietosuojaseloste/"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2"
            >
              Suomen Beaglejärjestön verkkosivuilla
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
