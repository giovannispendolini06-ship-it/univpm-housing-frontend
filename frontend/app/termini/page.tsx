import LandingNavbar from "@/components/landing/LandingNavbar";
import LandingFooter from "@/components/landing/LandingFooter";
import { SITE_URL } from "@/lib/site";

export const metadata = {
  title: "Termini di Servizio | Coabito",
  description:
    "Condizioni d'uso di Coabito: marketplace abitativo per studenti e proprietari, matching, fiducia e sicurezza della transazione.",
  alternates: { canonical: `${SITE_URL}/termini` },
};

export default function TermsPage() {
  return (
    <main className="bg-bg">
      <LandingNavbar />
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <a href="/" className="mb-6 inline-block text-sm text-ink-muted underline underline-offset-2">
          ← Torna alla home
        </a>

        <h1 className="mb-2 font-display text-3xl font-bold text-ink">
          Termini di Servizio
        </h1>
        <p className="mb-8 text-sm text-ink-muted">
          Ultimo aggiornamento: 18 agosto 2026
        </p>

        <div className="space-y-6 text-sm leading-relaxed text-ink">
          <section>
            <h2 className="mb-2 font-display text-base font-bold text-ink">
              1. Chi siamo e cosa facciamo
            </h2>
            <p>
              Coabito (&quot;noi&quot;, &quot;la piattaforma&quot;) è un{" "}
              <strong>marketplace tecnologico</strong> che mette in contatto studenti
              universitari in cerca di alloggio e proprietari di immobili. L&apos;assistente
              virtuale Vesta raccoglie le preferenze dello studente e propone stanze
              compatibili. Il nostro ruolo è la tecnologia, il matching, la fiducia tra le
              parti e strumenti di sicurezza economica della transazione (ove disponibili).{" "}
              <strong>Coabito non è un&apos;agenzia immobiliare tradizionale</strong> e{" "}
              <strong>non è parte del contratto di locazione</strong>: proprietario e
              studente firmano direttamente tra loro.
            </p>
            <p className="mt-3 rounded-xl bg-sea-50 px-3 py-2 text-xs text-ink-muted">
              Nota: questa è una bozza di termini aggiornata al modello marketplace. Prima di
              considerarla definitiva, andrà rivista da un legale (insieme a eventuali
              condizioni su escrow, garanzie e servizi opzionali).
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-base font-bold text-ink">
              2. Registrazione e account
            </h2>
            <p>
              Per usare la piattaforma devi registrarti fornendo informazioni vere, accurate e
              aggiornate. Sei responsabile della riservatezza della tua password e di tutte le
              attività svolte tramite il tuo account. Ogni utente deve avere almeno 18 anni, oppure
              operare con il consenso di chi ne esercita la responsabilità genitoriale.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-base font-bold text-ink">
              3. Il ruolo della piattaforma
            </h2>
            <p className="mb-2">Nel modello marketplace Coabito:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                Facilita matching e contatto tra studenti e proprietari (verifica profili,
                filtri di compatibilità, messaggistica dove prevista)
              </li>
              <li>
                <strong>Non è parte del contratto di locazione</strong> tra studente e
                proprietario, che resta un accordo diretto tra le due parti
              </li>
              <li>
                Può offrire servizi di fiducia e sicurezza economica della transazione (es.
                verifica identità/badge, escrow su cauzione o prima mensilità, garanzie
                opzionali contro inadempimento, mediazione in caso di controversie), senza
                diventare locatore o conduttore dell&apos;immobile
              </li>
              <li>
                Il punteggio di compatibilità generato dalla nostra intelligenza artificiale è un
                suggerimento orientativo, non una garanzia di idoneità
              </li>
              <li>
                Non garantiamo che le informazioni fornite da proprietari o studenti siano sempre
                accurate — verifica sempre di persona prima di impegnarti in un contratto
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 font-display text-base font-bold text-ink">
              4. Obblighi degli utenti
            </h2>
            <p className="mb-2">Utilizzando Coabito ti impegni a:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Fornire informazioni veritiere su di te e (se proprietario) sui tuoi immobili</li>
              <li>Non utilizzare la piattaforma per finalità illecite o fraudolente</li>
              <li>Non tentare di aggirare o danneggiare il funzionamento tecnico del sito</li>
              <li>Rispettare gli altri utenti nelle comunicazioni facilitate dalla piattaforma</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 font-display text-base font-bold text-ink">
              5. Limitazione di responsabilità
            </h2>
            <p>
              Nei limiti consentiti dalla legge, Coabito non è responsabile per danni diretti o
              indiretti derivanti dall&apos;uso della piattaforma, da accordi di locazione presi
              direttamente tra studenti e proprietari, o da informazioni inesatte fornite dagli
              utenti, salvo dolo o colpa grave. Il servizio online è fornito &quot;così
              com&apos;è&quot;, senza garanzie di continuità assoluta o assenza di errori. Eventuali
              servizi opzionali (escrow, assicurazioni, garanzie) sono regolati dalle relative
              condizioni specifiche, quando attivati.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-base font-bold text-ink">
              6. Lista d&apos;attesa
            </h2>
            <p>
              Puoi iscriverti alla lista d&apos;attesa anche senza account, per ricevere avvisi quando
              è disponibile una stanza compatibile con le preferenze indicate. Se lasci un&apos;email,
              l&apos;iscrizione si attiva solo dopo la conferma del link che ti inviamo (double
              opt-in). Non garantiamo tempi di disponibilità né che arriverà un&apos;offerta adatta:
              la lista è uno strumento di contatto, non una prenotazione. Puoi chiedere in qualsiasi
              momento di essere rimosso scrivendo a{" "}
              <a href="mailto:info@coabito.it" className="text-sea-700 underline">
                info@coabito.it
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-base font-bold text-ink">
              7. Proprietà intellettuale
            </h2>
            <p>
              Il nome, il logo, il design e il codice della piattaforma sono di proprietà di Coabito.
              I contenuti che carichi (foto, testi degli annunci) restano di tua proprietà, ma ci
              concedi il diritto di mostrarli sulla piattaforma per il funzionamento del servizio.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-base font-bold text-ink">
              8. Modifiche al servizio e ai termini
            </h2>
            <p>
              Potremmo modificare, sospendere o interrompere il servizio, in tutto o in parte, in
              qualsiasi momento. Potremmo anche aggiornare questi termini: in caso di modifiche
              sostanziali te lo comunicheremo.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-base font-bold text-ink">
              9. Legge applicabile
            </h2>
            <p>
              Questi termini sono regolati dalla legge italiana. Per qualsiasi controversia sarà
              competente il foro di{" "}
              <strong>
                [FORO COMPETENTE — DA DEFINIRE CON LA COSTITUZIONE DELLA SOCIETÀ]
              </strong>
              , salvo diversa previsione inderogabile di legge a tutela del consumatore.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-base font-bold text-ink">
              10. Contatti
            </h2>
            <p>
              Per qualsiasi domanda su questi termini, scrivici a{" "}
              <a href="mailto:info@coabito.it" className="text-sea-700 underline">
                info@coabito.it
              </a>
              .
            </p>
          </section>
        </div>
      </div>
      <LandingFooter />
    </main>
  );
}
