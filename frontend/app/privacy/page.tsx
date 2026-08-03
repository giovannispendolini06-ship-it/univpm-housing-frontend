export const metadata = {
  title: "Informativa Privacy | Bindo",
};

export default function PrivacyPage() {
  return (
    <main className="bg-bg px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <a href="/" className="mb-6 inline-block text-sm text-ink-muted underline underline-offset-2">
          ← Torna alla home
        </a>

        <h1 className="mb-2 font-display text-3xl font-bold text-ink">
          Informativa sulla Privacy
        </h1>
        <p className="mb-8 text-sm text-ink-muted">
          Ultimo aggiornamento: [DA COMPILARE — data di pubblicazione]
        </p>

        <div className="space-y-6 text-sm leading-relaxed text-ink">
          <section>
            <h2 className="mb-2 font-display text-base font-bold text-ink">
              1. Titolare del trattamento
            </h2>
            <p>
              Il Titolare del trattamento dei dati è <strong>[RAGIONE SOCIALE DA COMPILARE]</strong>,
              con sede in [INDIRIZZO DA COMPILARE], contattabile all&apos;indirizzo email{" "}
              <a href="mailto:privacy@bindo.it" className="text-sea-700 underline">
                privacy@bindo.it
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-base font-bold text-ink">
              2. Quali dati raccogliamo
            </h2>
            <p className="mb-2">A seconda del tuo ruolo sulla piattaforma, raccogliamo:</p>
            <p className="mb-1 font-semibold">Per tutti gli utenti:</p>
            <ul className="mb-2 list-disc space-y-1 pl-5">
              <li>Nome e cognome, indirizzo email, numero di telefono</li>
              <li>Codice fiscale o partita IVA</li>
              <li>Foto profilo</li>
              <li>Contenuto delle conversazioni con l&apos;assistente Nomi (per gli studenti)</li>
            </ul>
            <p className="mb-1 font-semibold">Solo per gli studenti, in aggiunta:</p>
            <ul className="mb-2 list-disc space-y-1 pl-5">
              <li>Data di nascita</li>
              <li>Facoltà, polo universitario, budget, abitudini di convivenza (raccolti tramite la chat)</li>
            </ul>
            <p className="mb-1 font-semibold">Solo per i proprietari, in aggiunta:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Dati relativi agli immobili inseriti (indirizzo, canone, foto dell&apos;immobile)</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 font-display text-base font-bold text-ink">
              3. Perché raccogliamo questi dati (finalità e base giuridica)
            </h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <strong>Fornire il servizio</strong> di ricerca e abbinamento tra studenti e stanze/immobili —
                base giuridica: esecuzione di un contratto con te.
              </li>
              <li>
                <strong>Gestire il tuo account</strong> e comunicare con te riguardo al servizio —
                base giuridica: esecuzione di un contratto con te.
              </li>
              <li>
                <strong>Calcolare la compatibilità</strong> tra studenti e stanze tramite intelligenza
                artificiale — base giuridica: esecuzione di un contratto con te.
              </li>
              <li>
                <strong>Adempiere a obblighi di legge</strong> (es. fiscali, contrattuali) —
                base giuridica: obbligo legale.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 font-display text-base font-bold text-ink">
              4. Come trattiamo i tuoi dati con l&apos;intelligenza artificiale
            </h2>
            <p>
              Quando chatti con il nostro assistente Nomi, i tuoi messaggi vengono inviati a{" "}
              <strong>OpenAI</strong> (fornitore del modello linguistico) per generare le risposte.
              OpenAI ha sede negli Stati Uniti: il trasferimento dei dati verso un paese extra-UE
              avviene sulla base delle Clausole Contrattuali Standard approvate dalla Commissione
              Europea. Non condividiamo con OpenAI dati più sensibili del necessario per far
              funzionare la conversazione.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-base font-bold text-ink">
              5. Dove sono conservati i tuoi dati
            </h2>
            <p>
              I tuoi dati sono conservati su server gestiti da <strong>Supabase</strong> (database e
              archiviazione file) e <strong>Vercel</strong> (hosting del sito). Adottiamo le misure di
              sicurezza tecniche e organizzative messe a disposizione da questi fornitori per
              proteggere i tuoi dati da accessi non autorizzati.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-base font-bold text-ink">
              6. Per quanto tempo conserviamo i tuoi dati
            </h2>
            <p>
              Conserviamo i tuoi dati per tutta la durata del tuo account sulla piattaforma, e
              successivamente per il tempo necessario ad adempiere a obblighi di legge (es. fiscali)
              o per far valere un diritto in sede giudiziaria. Puoi richiedere la cancellazione del
              tuo account e dei tuoi dati in qualsiasi momento (vedi sezione 8).
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-base font-bold text-ink">
              7. Con chi condividiamo i tuoi dati
            </h2>
            <p className="mb-2">Non vendiamo i tuoi dati a terzi. Li condividiamo solo con:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>I nostri fornitori tecnici (Supabase, Vercel, OpenAI), in qualità di responsabili del trattamento</li>
              <li>
                Studenti e proprietari, limitatamente alle informazioni necessarie a facilitare un
                abbinamento (es. un proprietario vede il numero di studenti compatibili, mai i loro
                dati personali, che restano gestiti da noi)
              </li>
              <li>Autorità competenti, se richiesto dalla legge</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 font-display text-base font-bold text-ink">
              8. I tuoi diritti
            </h2>
            <p className="mb-2">In qualsiasi momento hai diritto di:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Accedere ai tuoi dati personali</li>
              <li>Chiederne la rettifica se inesatti</li>
              <li>Chiederne la cancellazione ( &quot;diritto all&apos;oblio&quot;)</li>
              <li>Limitarne o opporti al trattamento</li>
              <li>Richiederne la portabilità</li>
              <li>Proporre reclamo al Garante per la Protezione dei Dati Personali</li>
            </ul>
            <p className="mt-2">
              Per esercitare questi diritti, scrivici a{" "}
              <a href="mailto:privacy@bindo.it" className="text-sea-700 underline">
                privacy@bindo.it
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-base font-bold text-ink">
              9. Modifiche a questa informativa
            </h2>
            <p>
              Potremmo aggiornare questa informativa nel tempo. In caso di modifiche sostanziali, te
              lo comunicheremo tramite email o un avviso sul sito.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
