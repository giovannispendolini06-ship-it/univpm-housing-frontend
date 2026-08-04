/**
 * Nota per Giovanni: il testo qui sotto è un punto di partenza scritto
 * da me — cambialo pure con le tue parole vere, il tono deve essere il
 * tuo, non il mio. Anche il cerchio con la "G" è un segnaposto: appena
 * hai una foto tua che ti piace, sostituiscila (basta chiedere a Cursor
 * "sostituisci il cerchio con la G con questa immagine" e allegarla).
 */
export default function FounderNote() {
  return (
    <section className="bg-sea-600">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="flex flex-col items-center text-center">
          {/* Segnaposto per una foto vera: sostituire con <img> quando disponibile */}
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white font-display text-xl font-bold text-sea-600">
            G
          </div>

          <p className="font-display text-xl leading-relaxed text-white sm:text-2xl">
            &ldquo;Ho vissuto anch&apos;io la ricerca di una stanza ad Ancona senza sapere
            nulla di chi ci avrei convissuto. Coabito è il servizio che avrei
            voluto trovare io, il primo anno.&rdquo;
          </p>

          <p className="mt-6 text-sm font-medium text-sea-100">
            — Giovanni, fondatore di Coabito
          </p>
        </div>
      </div>
    </section>
  );
}
