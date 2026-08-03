export const metadata = {
  title: "Termini di Servizio | Bindo",
};

export default function TermsPage() {
  return (
    <main className="bg-bg px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <a href="/" className="mb-6 inline-block text-sm text-ink-muted underline underline-offset-2">
          ← Torna alla home
        </a>

        <h1 className="mb-2 font-display text-3xl font-bold text-ink">
          Termini di Servizio
        </h1>
        <p className="mb-8 text-sm text-ink-muted">
          Ultimo aggiornamento: [DA COMPILARE — data di pubblicazione]
        </p>

        <div className="space-y-6 text-sm leading-relaxed text-ink">
          <section>
            <h2 className="mb-2 font-display text-base font-bold text-ink">
              1. Chi siamo e cosa facciamo
            </h2>
            <p>
              Bindo (&quot;noi&quot;, &quot;la piattaforma&quot;) è un servizio che mette in contatto
              studenti universitari in cerca di alloggio con proprietari di immobili, tramite un
              assistente virtuale che raccoglie le preferenze dello studente e propone stanze
              compatibili. <strong>Bindo non è un&apos;agenzia immobiliare tradizionale</strong> né una
              parte del contratto di locazione: agiamo come intermediari tecnologici che facilitano
              il contatto tra le parti.
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
            <p className="mb-2">
              Bindo facilita il contatto tra studenti e proprietari, ma:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                Non garantiamo che le informazioni fornite da proprietari o studenti siano sempre
                accurate — verifica sempre di persona prima di impegnarti in un contratto
              </li>
              <li>
                Non siamo parte del contratto di locazione tra studente e proprietario, che resta
                un accordo diretto tra le due parti
              </li>
              <li>
                Il punteggio di compatibilità generato dalla nostra intelligenza artificiale è un
                suggerimento orientativo, non una garanzia di idoneità
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 font-display text-base font-bold text-ink">
              4. Obblighi degli utenti
            </h2>
            <p className="mb-2">Utilizzando Bindo ti impegni a:</p>
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
              Nei limiti consentiti dalla legge, Bindo non è responsabile per danni diretti o
              indiretti derivanti dall&apos;uso della piattaforma, da accordi presi tra studenti e
              proprietari, o da informazioni inesatte fornite dagli utenti. Il servizio è fornito
              &quot;così com&apos;è&quot;, senza garanzie di continuità assoluta o assenza di errori.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-base font-bold text-ink">
              6. Proprietà intellettuale
            </h2>
            <p>
              Il nome, il logo, il design e il codice della piattaforma sono di proprietà di Bindo.
              I contenuti che carichi (foto, testi degli annunci) restano di tua proprietà, ma ci
              concedi il diritto di mostrarli sulla piattaforma per il funzionamento del servizio.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-base font-bold text-ink">
              7. Modifiche al servizio e ai termini
            </h2>
            <p>
              Potremmo modificare, sospendere o interrompere il servizio, in tutto o in parte, in
              qualsiasi momento. Potremmo anche aggiornare questi termini: in caso di modifiche
              sostanziali te lo comunicheremo.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-base font-bold text-ink">
              8. Legge applicabile
            </h2>
            <p>
              Questi termini sono regolati dalla legge italiana. Per qualsiasi controversia sarà
              competente il foro di [CITTÀ DA COMPILARE], salvo diversa previsione inderogabile di
              legge a tutela del consumatore.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-base font-bold text-ink">
              9. Contatti
            </h2>
            <p>
              Per qualsiasi domanda su questi termini, scrivici a{" "}
              <a href="mailto:info@bindo.it" className="text-sea-700 underline">
                info@bindo.it
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
