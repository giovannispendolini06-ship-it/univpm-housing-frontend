import Link from "next/link";
import Reveal from "@/components/landing/Reveal";

type Status = "available" | "roadmap";

type ServiceItem = {
  title: string;
  body: string;
  status: Status;
};

type ServiceGroup = {
  title: string;
  items: ServiceItem[];
};

const STUDENT_GROUPS: ServiceGroup[] = [
  {
    title: "Verifica e fiducia",
    items: [
      {
        title: 'Badge "studente verificato"',
        body: "Conferma iscrizione universitaria (email istituzionale o documento), visibile sul profilo.",
        status: "available",
      },
      {
        title: "Reputazione portabile",
        body: 'Punteggio "buon inquilino" basato su feedback dei proprietari, riutilizzabile in altre città.',
        status: "roadmap",
      },
    ],
  },
  {
    title: "Prima del trasloco",
    items: [
      {
        title: "Checklist pre-trasloco personalizzata",
        body: "Generata da Vesta in base a zona/immobile (documenti, scadenze, cosa portare). Oggi esiste dopo l’assegnazione stanza; la versione pre-match è in roadmap.",
        status: "roadmap",
      },
      {
        title: "Stima costi totali reali",
        body: "Non solo canone: utenze medie, cauzione, costi di attivazione.",
        status: "roadmap",
      },
    ],
  },
  {
    title: "Al momento del trasloco",
    items: [
      {
        title: "Attivazione utenze assistita",
        body: "Luce, gas, internet in partnership con fornitori (possibile affiliazione).",
        status: "roadmap",
      },
      {
        title: "Supporto residenza/domicilio",
        body: "Indicazioni pratiche su cambio residenza e anagrafe, utili soprattutto agli internazionali.",
        status: "roadmap",
      },
      {
        title: "Assicurazione contenuto / RC",
        body: "Prodotto assicurativo in partnership, opzionale a pagamento.",
        status: "roadmap",
      },
    ],
  },
  {
    title: "Durante la permanenza",
    items: [
      {
        title: "Notifiche stanze compatibili",
        body: "Avvisi proattivi quando arriva qualcosa di adatto al tuo profilo.",
        status: "available",
      },
      {
        title: "Canale di mediazione Coabito",
        body: "Supporto in caso di problemi con coinquilino o proprietario, senza essere parte del contratto.",
        status: "roadmap",
      },
    ],
  },
  {
    title: "Fine contratto",
    items: [
      {
        title: "Assistenza ricerca sostituto",
        body: "Se lasci la stanza, aiutiamo a trovare il prossimo inquilino tramite la piattaforma.",
        status: "roadmap",
      },
    ],
  },
];

const OWNER_GROUPS: ServiceGroup[] = [
  {
    title: "Fiducia e verifica",
    items: [
      {
        title: 'Badge "proprietario verificato"',
        body: "Documento di proprietà/delega verificato, visibile agli studenti.",
        status: "available",
      },
      {
        title: "Garanzia contro inadempimento",
        body: "Prodotto assicurativo/fondo a pagamento su mancato canone o danni — senza che Coabito entri nel contratto. Sostituisce, in chiave marketplace, il valore percepito del canone garantito.",
        status: "roadmap",
      },
    ],
  },
  {
    title: "Gestione annuncio",
    items: [
      {
        title: "Foto professionali",
        body: "Gratuite o a costo ridotto per i primi proprietari acquisiti.",
        status: "roadmap",
      },
      {
        title: "Creazione annuncio assistita da Vesta",
        body: "Descrivi l’immobile in chat: Vesta genera un annuncio strutturato.",
        status: "roadmap",
      },
      {
        title: "Dashboard proprietario",
        body: "Stato annuncio e conteggi di interesse già disponibili; richieste e storico inquilini in roadmap.",
        status: "available",
      },
    ],
  },
  {
    title: "Selezione inquilini",
    items: [
      {
        title: "Pre-filtro studenti compatibili",
        body: "Solo profili filtrati per criteri di base, per ridurre il tempo di selezione.",
        status: "available",
      },
      {
        title: "Reputazione studente visibile",
        body: 'Punteggio "buon inquilino" mostrato prima del contatto diretto.',
        status: "roadmap",
      },
    ],
  },
  {
    title: "Pagamenti e sicurezza",
    items: [
      {
        title: "Pagamento in escrow",
        body: "Coabito trattiene prima mensilità/cauzione finché il trasloco non è confermato da entrambe le parti.",
        status: "roadmap",
      },
      {
        title: "Promemoria pagamenti",
        body: "Notifiche di scadenza canone, utili anche con pagamento diretto tra le parti.",
        status: "roadmap",
      },
    ],
  },
  {
    title: "Supporto operativo",
    items: [
      {
        title: "Rete manutentori convenzionati",
        body: "Servizio a pagamento o commissione, attivabile su richiesta.",
        status: "roadmap",
      },
      {
        title: "Assistenza ricerca nuovo inquilino",
        body: "Quando uno studente lascia, supporto nella ricerca del sostituto.",
        status: "roadmap",
      },
    ],
  },
];

const SHARED: ServiceItem[] = [
  {
    title: "Mediazione in caso di controversie",
    body: "Canale di supporto prima di eventuali vie legali, con contratto diretto tra le parti.",
    status: "roadmap",
  },
  {
    title: "Community / eventi locali",
    body: "Estensione futura a bassa priorità per tenere gli studenti legati alla piattaforma.",
    status: "roadmap",
  },
  {
    title: "Dati di mercato aggregati",
    body: "Report su prezzi/domanda per zona; potenzialmente vendibili a terzi in fase matura.",
    status: "roadmap",
  },
];

function StatusPill({ status }: { status: Status }) {
  if (status === "available") {
    return (
      <span className="rounded-full bg-sea-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sea-700">
        Disponibile
      </span>
    );
  }
  return (
    <span className="rounded-full bg-bg px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-muted ring-1 ring-sea-100">
      Roadmap
    </span>
  );
}

function GroupBlock({ group, delay }: { group: ServiceGroup; delay: number }) {
  return (
    <Reveal delay={delay}>
      <div className="mb-8">
        <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-ink-muted">
          {group.title}
        </h3>
        <ul className="space-y-3">
          {group.items.map((item) => (
            <li
              key={item.title}
              className="rounded-xl2 border border-sea-100 bg-white px-4 py-3 shadow-card"
            >
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <p className="font-display text-sm font-bold text-ink">{item.title}</p>
                <StatusPill status={item.status} />
              </div>
              <p className="text-sm leading-relaxed text-ink-muted">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}

export default function ServiziCatalog() {
  return (
    <div className="space-y-12">
      <section id="studenti">
        <Reveal>
          <h2 className="mb-6 font-display text-2xl font-bold text-ink">
            Per gli studenti
          </h2>
        </Reveal>
        {STUDENT_GROUPS.map((g, i) => (
          <GroupBlock key={g.title} group={g} delay={i * 40} />
        ))}
      </section>

      <section id="proprietari">
        <Reveal>
          <h2 className="mb-6 font-display text-2xl font-bold text-ink">
            Per i proprietari
          </h2>
        </Reveal>
        {OWNER_GROUPS.map((g, i) => (
          <GroupBlock key={g.title} group={g} delay={i * 40} />
        ))}
      </section>

      <section id="condivisi">
        <Reveal>
          <h2 className="mb-6 font-display text-2xl font-bold text-ink">
            Servizi condivisi
          </h2>
        </Reveal>
        <Reveal delay={40}>
          <ul className="mb-8 space-y-3">
            {SHARED.map((item) => (
              <li
                key={item.title}
                className="rounded-xl2 border border-sea-100 bg-white px-4 py-3 shadow-card"
              >
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <p className="font-display text-sm font-bold text-ink">{item.title}</p>
                  <StatusPill status={item.status} />
                </div>
                <p className="text-sm leading-relaxed text-ink-muted">{item.body}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      <Reveal>
        <div className="rounded-xl2 border border-sea-100 bg-sea-50 px-4 py-5">
          <h2 className="mb-2 font-display text-base font-bold text-ink">
            Priorità di implementazione
          </h2>
          <ol className="mb-4 list-decimal space-y-1 pl-5 text-sm text-ink-muted">
            <li>Badge verificato (studente + proprietario)</li>
            <li>Pagamento in escrow</li>
            <li>Garanzia contro inadempimento</li>
            <li>Dashboard proprietario (richieste e storico)</li>
            <li>Resto (utenze, manutentori, community, dati)</li>
          </ol>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link
              href="/lista-attesa"
              className="rounded-full bg-sea-600 px-4 py-2 font-semibold text-white transition hover:bg-sea-700"
            >
              Sono uno studente
            </Link>
            <Link
              href="/proprietari"
              className="rounded-full border border-sea-200 bg-white px-4 py-2 font-semibold text-sea-700 transition hover:border-sea-400"
            >
              Sono un proprietario
            </Link>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
