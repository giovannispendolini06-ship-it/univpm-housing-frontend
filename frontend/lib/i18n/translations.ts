export type Locale = "it" | "en";

export const translations = {
  it: {
    nav: {
      forStudents: "Per gli studenti",
      forOwners: "Per i proprietari",
      howItWorks: "Come funziona",
      services: "Servizi",
      rooms: "Stanze",
      installApp: "Installa l'app",
      login: "Accedi",
      waitlist: "Lista d'attesa",
    },
    hero: {
      badge: "Pensato per chi studia fuori sede",
      titlePart1: "La casa giusta. ",
      titleHighlight: "Le persone",
      titlePart2: " giuste.",
      subtitle:
        "Marketplace abitativo per fuori sede: stanze trasparenti, profili verificabili e Compatibilità Coabito — per trovare stanza e coinquilini giusti, non solo un annuncio.",
      ctaStudent: "Trova il tuo match",
      ctaOwner: "Pubblica un immobile",
      ctaBrowse: "Sfoglia le stanze",
      freeNote: "Gratuito per gli studenti. Nessuna carta di credito richiesta.",
      alreadyAccount: "Hai già un account? Accedi",
      seeExample: "Vedi un esempio",
      socialProof: "{count} studenti già in lista d'attesa",
      liveCompatibility: "Compatibilità calcolata in tempo reale",
      mockBot: "Che facoltà fai, e quanto puoi spendere al mese?",
      mockUser: "Ingegneria, secondo anno. Max 420€",
      mockRoomTitle: "Singola luminosa con balcone",
      mockRoomMeta: "380€/mese · 9 min dall'ateneo",
      badgeCompatTitle: "Compatibilità 92%",
      badgeCompatSub: "Calcolata in tempo reale",
      badgeFeesTitle: "Zero commissioni",
      badgeFeesSub: "Per lo studente",
    },
    launchCountdown: {
      days: "Le prime stanze arrivano tra {n} giorni",
      oneDay: "Le prime stanze arrivano domani",
      arrived: "Le prime stanze stanno arrivando",
    },
    intro: {
      skip: "Salta",
      tagline: "— su misura, come un abito.",
      ariaLabel: "Introduzione animata di Coabito",
    },
    howItWorksStudents: {
      eyebrow: "Per gli studenti",
      title: "Tre passaggi, e Vesta fa il resto",
      ctaLabel: "Inizia a chattare con Vesta",
      steps: [
        {
          number: "1",
          title: "Racconta chi sei",
          description:
            "Facoltà, ateneo, budget e data d'ingresso: bastano due minuti di chat, niente moduli infiniti.",
        },
        {
          number: "2",
          title: "Vesta capisce le tue abitudini",
          description:
            "Orari di studio, vita sociale, pulizia: informazioni che di solito si scoprono solo dopo aver firmato.",
        },
        {
          number: "3",
          title: "Ricevi le stanze compatibili",
          description:
            "Ogni stanza mostra un punteggio di compatibilità e il perché, non solo prezzo e metri quadri.",
        },
      ],
    },
    howItWorksOwners: {
      eyebrow: "Per i proprietari",
      title: "Matching e fiducia, contratto diretto",
      ctaLabel: "Proponi il tuo immobile",
      steps: [
        {
          number: "1",
          title: "Ci racconti il tuo immobile",
          description:
            "Indirizzo, prezzo, foto: pubblichiamo l'annuncio sulla piattaforma e, dove ha senso, sui portali.",
        },
        {
          number: "2",
          title: "Pre-filtro degli interessati",
          description:
            "Solo studenti compatibili — e, appena disponibili, verificati — arrivano fino a te: niente perditempo.",
        },
        {
          number: "3",
          title: "Tu scegli e firmi direttamente",
          description:
            "Il contratto resta tra te e lo studente. Coabito supporta matching, fiducia e sicurezza della transazione.",
        },
      ],
    },
    ownerCalculator: {
      eyebrow: "Per i proprietari",
      title: "Quanto potresti ricevere con il canone garantito?",
      subtitle:
        "Una stima indicativa in base alla zona e alle dimensioni del tuo immobile — non un'offerta vincolante.",
      zoneLabel: "Zona",
      zoneTorrette: "Torrette",
      zoneCentro: "Centro",
      zonePalombina: "Palombina",
      roomsLabel: "Numero di stanze",
      sizeLabel: "Superficie totale (mq)",
      mqUnit: "mq",
      conditionLabel: "Stato dell'immobile",
      conditionGood: "Buono",
      conditionRefresh: "Da rinfrescare",
      conditionRenovated: "Ristrutturato",
      resultLabel: "Canone garantito stimato",
      perMonth: "/mese",
      rangeLabel: "Range indicativo: {low}€ - {high}€",
      disclaimer:
        "Questa è una stima basata su prezzi medi di zona, non un'offerta vincolante. Il canone reale viene definito insieme durante un sopralluogo.",
      cta: "Richiedi una valutazione precisa",
      whatsappMessage:
        "Ciao! Ho usato il calcolatore canone garantito Coabito. Immobile: {zone}, {rooms} stanze, {mq} mq, stato {condition}. Stima indicativa: {amount}€/mese (range {low}–{high}€). Vorrei una valutazione precisa.",
    },
    howItWorksDemo: {
      eyebrow: "Come funziona",
      titleLine1: "Non te lo raccontiamo.",
      titleLine2: "Te lo facciamo vedere.",
      toggleAria: "Scegli il tuo punto di vista",
      toggleStudent: "Sono studente",
      toggleOwner: "Sono proprietario",
      stepsAria: "Passaggi",
      exampleBadge: "Esempio",
      ctaStudent: "Inizia a chattare con Vesta",
      ctaOwner: "Proponi il tuo immobile",
      student: {
        steps: [
          {
            title: "Parli con Vesta",
            subtitle: "Facoltà, budget, orari di studio",
          },
          {
            title: "Vedi il costo reale, non solo l'affitto",
            subtitle: "Canone + utenze + cauzione, tutto insieme",
          },
          {
            title: "Scopri con chi vivresti",
            subtitle: "Coinquilini con abitudini simili alle tue",
          },
          {
            title: "Il tuo pagamento resta al sicuro",
            subtitle: "Sbloccato solo dopo la conferma del trasloco",
          },
        ],
        proofs: [
          {
            badge: "Zero commissioni",
            title: "Gratis per gli studenti",
            body: "Nessuna commissione di ricerca, mai — a differenza dei portali tradizionali.",
            accent: "coral" as const,
          },
          {
            badge: "✓ Studente verificato",
            title: "Sai sempre con chi parli",
            body: "Badge assegnato solo dopo verifica reale dell'iscrizione universitaria.",
            accent: "teal" as const,
          },
        ],
        screens: {
          chat: {
            bot1: "Che facoltà frequenti, e quanto puoi spendere al mese?",
            me: "Ingegneria, secondo anno. Max 420€",
            bot2: "Perfetto, iniziamo a cercare 🔥",
          },
          cost: {
            title: "Singola · Torrette",
            match: "92%",
            rent: "Canone: 320€",
            utilities: "Utenze: 40€",
            deposit: "Cauzione: 640€ (una tantum)",
            total: "Totale mensile: 360€",
            note: "nessun costo nascosto dopo",
          },
          roommates: {
            title: "I tuoi coinquilini",
            people: [
              { initials: "GM", tag: "Studia molto" },
              { initials: "LR", tag: "Casa tranquilla" },
              { initials: "+1", tag: "Orari simili" },
            ],
          },
          escrow: {
            rows: [
              { label: "Pagamento versato — al sicuro con Coabito", done: true },
              { label: "In attesa di conferma trasloco", done: false },
              { label: "Rilascio al proprietario dopo tua conferma", done: false },
            ],
          },
        },
      },
      owner: {
        steps: [
          {
            title: "Racconti il tuo immobile a Vesta",
            subtitle: "Niente form lunghi da compilare",
          },
          {
            title: "Ricevi candidati già verificati",
            subtitle: "Iscrizione universitaria confermata",
          },
          {
            title: "Il canone arriva puntuale",
            subtitle: "Ogni mese, senza rincorrere nessuno",
          },
          {
            title: "E se qualcosa va storto?",
            subtitle: "La domanda che nessun altro risponde davvero",
          },
        ],
        proofs: [
          {
            badge: "✓ Canone garantito",
            title: "Zero sorprese, ogni mese",
            body: "Su alcuni immobili, il canone è garantito direttamente da Coabito — anche a stanza vuota.",
            accent: "teal" as const,
          },
          {
            badge: "Un solo interlocutore",
            title: "Non decine di studenti separati",
            body: "Un unico contratto, una sola persona di riferimento per qualsiasi cosa.",
            accent: "coral" as const,
          },
        ],
        screens: {
          chat: {
            bot1: "Quante stanze ha l'immobile, e in che zona?",
            me: "3 stanze, Torrette, vicino Medicina",
            bot2: "Annuncio pronto — lo rivedi tu prima di pubblicarlo",
          },
          applicants: {
            rows: [
              {
                initials: "GM",
                name: "Giulia M.",
                badge: "✓ Studentessa verificata",
                score: "91%",
              },
              {
                initials: "LR",
                name: "Luca R.",
                badge: "✓ Studente verificato",
                score: "84%",
              },
            ],
          },
          payout: {
            label: "Prossimo pagamento",
            amount: "637€",
            sub: "15 settembre · Immobile occupato · Nessuna azione richiesta",
          },
          whatIf: {
            question: "Se lo studente non paga?",
            answer:
              "Sulle proprietà a canone garantito, il rischio è nostro: tu ricevi comunque il canone.",
          },
        },
      },
    },
    founderNote: {
      quote:
        "Anche io ho cercato casa ad Ancona da studente, senza sapere nulla delle persone con cui avrei convissuto. Coabito è il servizio che avrei voluto avere io, il primo anno.",
      attribution: "— Giovanni, fondatore di Coabito",
    },
    faq: {
      eyebrow: "Domande frequenti",
      title: "Le domande che ci fate davvero",
      seeAll: "Tutte le FAQ per studenti",
      toggleStudent: "Sono studente",
      toggleOwner: "Sono proprietario",
      toggleAria: "Scegli se vedere le FAQ per studenti o proprietari",
      studentItems: [
        {
          question: "Quanto costa usare Coabito?",
          answer: "Niente. Zero commissioni di ricerca per gli studenti, sempre.",
        },
        {
          question: "I miei soldi sono al sicuro?",
          answer:
            "Sì. Il pagamento resta bloccato con Coabito finché non confermi tu stesso che il trasloco è andato come previsto — non viene rilasciato al proprietario prima.",
          worry: true,
        },
        {
          question: "Posso scegliere con chi vivere?",
          answer:
            "Vesta ti propone stanze dove i coinquilini hanno abitudini simili alle tue (orari, pulizia, vita sociale) — vedi sempre perché prima di candidarti.",
          worry: true,
        },
        {
          question: "Quando arrivano le prime stanze?",
          answer:
            "Le prime disponibilità arrivano a settembre 2026. Iscriviti alla lista d'attesa per essere avvisato.",
        },
        {
          question: "Cosa succede se non trovo posto?",
          answer:
            "Resti in lista d'attesa e continui a ricevere proposte compatibili man mano che nuove stanze si aggiungono — nessun impegno, nessuna scadenza.",
          worry: true,
        },
      ],
      ownerItems: [
        {
          question: "E se lo studente non paga?",
          answer:
            "Sulle proprietà a canone garantito, il rischio è nostro: tu ricevi comunque il canone concordato, ogni mese.",
          worry: true,
        },
        {
          question: "E se lascia danni all'immobile?",
          answer:
            "La cauzione versata dallo studente resta a garanzia. Per i casi sul marketplace indipendente, valutiamo insieme l'attivazione di una garanzia aggiuntiva opzionale.",
          worry: true,
        },
        {
          question: "Posso rifiutare un candidato?",
          answer:
            "Sulle proprietà a canone garantito, selezioniamo noi. Su quelle indipendenti, decidi sempre tu chi accettare tra i candidati verificati.",
        },
        {
          question: "Quanto mi costa?",
          answer:
            "Nulla per pubblicare. Coabito si remunera sulla gestione, non su commissioni a tuo carico.",
        },
        {
          question: "Posso interrompere l'accordo?",
          answer:
            "Sì, le condizioni di recesso sono definite chiaramente nel contratto, concordate prima della firma e valide per entrambe le parti.",
          worry: true,
        },
      ],
    },
    faqStudenti: {
      eyebrow: "Per gli studenti",
      title: "Domande frequenti per chi cerca casa",
      subtitle:
        "Costi, matching con Vesta, lista d'attesa e come scegliamo le stanze compatibili — risposte chiare prima di iscriverti.",
      backHome: "← Torna alla home",
      ctaWaitlist: "Entra in lista d'attesa",
      ctaChat: "Parla con Vesta",
      items: [
        {
          question: "Quanto costa usare Coabito?",
          answer:
            "Per gli studenti è gratuito parlare con Vesta, entrare in lista d'attesa e vedere le stanze proposte. Non chiediamo carte di credito né costi di iscrizione. Paghi solo il canone della stanza che scegli, come in un affitto tradizionale.",
        },
        {
          question: "Come funziona il matching con Vesta?",
          answer:
            "Racconti a Vesta facoltà, polo, budget e abitudini di convivenza. Confrontiamo ogni nuova stanza con il tuo profilo (prezzo, distanza dall'ateneo, stile di vita) e ti mostriamo solo le proposte davvero compatibili — con un punteggio chiaro, non un elenco infinito di annunci.",
        },
        {
          question: "Cosa succede dopo che mi iscrivo alla lista d'attesa?",
          answer:
            "Se lasci l'email, ti mandiamo un link di conferma (double opt-in). Dopo la conferma sei in lista: quando arriva una stanza compatibile ti avvisiamo. Nel frattempo puoi ricevere qualche aggiornamento sul progetto; se nel frattempo trovi già una stanza con noi, smettiamo di mandarti messaggi di “aspetto”.",
        },
        {
          question: "Posso scegliere zona e budget?",
          answer:
            "Sì. In chat o nel form indichi budget massimo e polo/zona di interesse. Vesta li usa come filtri: meglio essere realistici sul tetto di spesa piuttosto che accettare proposte che non reggi dopo pochi mesi.",
        },
        {
          question: "Come vengono selezionati i coinquilini?",
          answer:
            "Non mettiamo a caso persone nella stessa casa. Guardiamo preferenze di studio, sociabilità, ospiti e ordine — oltre a budget e polo — così la convivenza ha più probabilità di funzionare. Tu vedi il punteggio e decidi se procedere.",
        },
        {
          question: "Devo creare un account per la lista d'attesa?",
          answer:
            "No. Puoi iscriverti con il form leggero (nome + email o telefono). Se preferisci, puoi anche registrarti e chattare con Vesta: in quel caso salviamo le preferenze dal profilo quando non c'è ancora una stanza adatta.",
        },
        {
          question: "Quando arrivano le prime stanze?",
          answer:
            "Stiamo preparando le disponibilità per l'anno accademico 2026/2027, con obiettivo intorno a settembre. Entrare in lista ora serve a essere tra i primi avvisati quando qualcosa di compatibile si libera.",
        },
      ],
    },
    footer: {
      tagline:
        "Piattaforma indipendente per studenti fuori sede e proprietari di casa. Non affiliata a nessuna università.",
      rights: "Tutti i diritti riservati.",
      privacy: "Privacy",
      terms: "Termini di servizio",
      cookies: "Cookie",
      guide: "Guida affitto Ancona",
      faq: "FAQ studenti",
      guideFirstTime: "Prima volta fuori sede",
      services: "Servizi",
    },
    whatsappFloat: {
      ariaLabel: "Scrivici su WhatsApp",
      generic: "Ciao! Ho visto Coabito e vorrei saperne di più",
      owners:
        "Ciao! Ho un immobile e vorrei saperne di più su Coabito.",
      waitlist:
        "Ciao! Sto cercando casa da studente fuori sede e vorrei info su Coabito / la lista d'attesa.",
    },
    guidaAffittoAncona: {
      title: "Come affittare casa per studenti ad Ancona",
      subtitle:
        "Una guida pratica per fuori sede UNIVPM: tempi, zone vicine ai poli, budget realistici e come evitare i classici errori sugli annunci.",
      intro:
        "Trovare una stanza ad Ancona sembra semplice finché non inizi a rispondere a decine di annunci, a fare giri inutili e a scoprire che la “singola luminosa” è a 40 minuti dal tuo polo. Questa guida riassume cosa conta davvero se studi all’Università Politecnica delle Marche.",
      sections: [
        {
          title: "Quando iniziare a cercare",
          body: "Per l’inizio dell’anno accademico i posti migliori si muovono da giugno a settembre. Se arrivi a ottobre sei ancora in tempo, ma conviene entrare in lista d’attesa o chattare subito con Vesta: più chiaro è il tuo profilo (polo, budget, data di ingresso), più è facile proporti qualcosa di sensato appena si libera.",
        },
        {
          title: "Zone e poli universitari",
          body: "Monte Dago (Ingegneria, Agraria, Scienze) si raggiunge bene con la linea 65 University Link e la 46/. Torrette (Medicina) è lungo lo stesso corridoio della 65. Economia e Giurisprudenza gravitano sul centro / Villarey: lì contano soprattutto piedi e linee verso stazione e Piazza Roma. Una stanza “conveniente” lontano dal tuo polo spesso costa di più in tempo e stress quotidiano.",
        },
        {
          title: "Budget realistico",
          body: "Oltre al canone mensile metti in conto utenze, deposito e eventuali spese condominiali. Su Coabito indichi un budget massimo e Vesta lo usa per filtrare: meglio essere onesti sul tetto reale che accettare proposte che non reggi dopo due mesi.",
        },
        {
          title: "Cosa chiedere (e cosa evitare)",
          body: "Chiedi sempre data di disponibilità, cosa è incluso nelle spese, se la stanza è singola o doppia, e regole su ospiti/fumo. Diffida di richieste di caparra via bonifico prima di aver visto la casa o firmato qualcosa di chiaro. Su Coabito il contratto resta diretto con il proprietario: la piattaforma riduce i passaggi opachi con matching, verifica e — in roadmap — escrow sulla prima mensilità/cauzione.",
        },
        {
          title: "Come ti aiuta Coabito",
          body: "Invece di scorrere annunci a caso, racconti a Vesta facoltà, budget e abitudini di convivenza. Ti proponiamo stanze compatibili vicino al tuo ateneo e un punteggio che pesa anche stile di vita, non solo metri quadri. Per gli studenti è gratuito parlare con Vesta e vedere le proposte.",
        },
      ],
      ctaTitle: "Pronto a cercare senza perdere settimane?",
      ctaBody: "Inizia la chat con Vesta oppure entra in lista d’attesa: ti avvisiamo quando arriva qualcosa di compatibile.",
      ctaChat: "Parla con Vesta",
      ctaWaitlist: "Lista d’attesa",
      backHome: "← Torna alla home",
    },
    guidaPrimaVolta: {
      title: "Prima volta fuori sede: la guida pratica",
      intro:
        "Trasferirti per l'università è la prima volta che gestisci tutto da solo: casa, documenti, spese, convivenza. Non serve saperlo già fare — serve sapere cosa aspettarti. Questa guida raccoglie le cose che avremmo voluto sapere prima di partire noi stessi.",
      sections: [
        {
          title: "Prima di partire",
          blocks: [
            {
              heading: "Documenti da preparare",
              bullets: [
                "Carta d'identità e codice fiscale (portali sempre con te, non solo il giorno del trasferimento)",
                "Certificato di iscrizione universitaria o attestato di immatricolazione",
                "Se richiesto dal proprietario: documenti del garante (di solito un genitore)",
              ],
            },
            {
              heading: "Il contratto",
              body: "Leggilo tutto prima di firmare, anche le parti noiose. Controlla in particolare: durata, importo del deposito cauzionale, cosa succede se vuoi lasciare la stanza prima della scadenza, chi paga cosa tra le utenze. Se qualcosa non è chiaro, chiedi — un contratto serio non ha problemi a spiegarti ogni riga.",
            },
            {
              heading: "Budget reale, non solo l'affitto",
              body: "L'affitto è solo una parte della spesa mensile. Metti in conto: utenze (luce, gas, internet — a volte incluse, a volte no, verificalo prima), spesa alimentare, trasporti, materiale universitario. Un budget realistico evita brutte sorprese al secondo mese.",
            },
          ],
        },
        {
          title: "Il trasferimento",
          blocks: [
            {
              heading: "Cosa portare (e cosa no)",
              body: "Non serve portare tutto quello che hai in camera a casa. La maggior parte delle stanze in affitto per studenti sono già arredate con l'essenziale (letto, scrivania, armadio). Porta: biancheria, oggetti personali, eventuale attrezzatura per lo studio. Il resto si compra sul posto se serve, spesso costa meno che trasportarlo.",
            },
            {
              heading: "Il cambio di residenza",
              body: "Non è obbligatorio, ma vale la pena informarsi se conviene nel tuo caso (può incidere su alcune agevolazioni, tasse universitarie, o convenzioni sanitarie). Chiedi in anagrafe del tuo comune di origine cosa cambia.",
            },
            {
              heading: "Attivare le utenze",
              body: "Se non sono già incluse nel contratto, informati con anticipo sui tempi di attivazione — internet in particolare può richiedere alcuni giorni. Meglio saperlo prima di arrivare che scoprirlo il primo giorno senza connessione.",
            },
          ],
        },
        {
          title: "Vivere con coinquilini",
          blocks: [
            {
              heading: "I primi giorni contano",
              body: "Parla subito, apertamente, delle regole della convivenza: pulizia, orari, ospiti, spese condivise. Non aspettare che diventi un problema per parlarne — la maggior parte degli attriti nasce da aspettative mai dette ad alta voce, non da cattiva volontà.",
            },
            {
              heading: "Le spese condivise",
              body: "Decidete insieme fin da subito come dividere spesa comune, utenze, e prodotti per la casa. Un metodo semplice (anche solo un foglio condiviso) evita discussioni continue su chi ha pagato cosa.",
            },
            {
              heading: "Se qualcosa non funziona",
              body: "È normale che una convivenza abbia momenti di attrito. Prova a parlarne direttamente prima di lasciare che la situazione peggiori. Se il problema persiste, è comunque meglio affrontarlo presto che aspettare la fine del contratto sperando che si risolva da solo.",
            },
          ],
        },
        {
          title: "Errori comuni da evitare",
          blocks: [
            {
              bullets: [
                "Non leggere bene il contratto prima di firmare — anche se ha fretta chi te lo propone, tu prendi il tempo che ti serve",
                "Non chiarire subito le regole di convivenza — meglio una conversazione scomoda il primo giorno che un conflitto dopo un mese",
                "Sottovalutare il budget reale — l'affitto non è l'unica spesa",
                "Non conservare le ricevute di pagamento — utile sia per te che per eventuali dispute future",
              ],
            },
          ],
        },
      ],
      closing:
        "Non serve arrivare preparati al 100% — quasi nessuno lo è alla prima esperienza fuori sede. Serve solo sapere a cosa prestare attenzione. Se hai dubbi specifici sulla tua situazione, scrivici — vedi sotto.",
      relatedGuide: "Guida: affittare casa per studenti ad Ancona",
      backHome: "← Torna alla home",
    },
    founderContact: {
      title: "Hai domande prima di iscriverti?",
      body: "Scrivimi direttamente. Sono Giovanni, il fondatore di Coabito — studio anch'io all'UNIVPM e conosco bene la ricerca casa da fuori sede. Se hai dubbi su come funziona la piattaforma, o semplicemente vuoi capire se fa al caso tuo, scrivimi su WhatsApp: ti rispondo io.",
      cta: "Scrivimi su WhatsApp",
      whatsappMessage:
        "Ciao Giovanni! Ho una domanda su Coabito / sulla guida Prima volta fuori sede.",
      photoAlt: "Giovanni, fondatore di Coabito",
    },
    cookieBanner: {
      title: "Usiamo i cookie",
      description:
        "Usiamo cookie essenziali per far funzionare il sito e, solo con il tuo consenso, cookie di misurazione (Vercel Analytics) per capire come migliorare Coabito.",
      acceptAll: "Accetta tutti",
      rejectNonEssential: "Rifiuta non essenziali",
      customize: "Personalizza",
      preferencesTitle: "Preferenze cookie",
      savePreferences: "Salva preferenze",
      close: "Chiudi",
      privacyLink: "Privacy Policy",
      sectionIntroTitle: "Utilizzo dei cookie",
      sectionIntroBody:
        "Puoi scegliere quali cookie accettare. I cookie essenziali sono sempre attivi perché servono al funzionamento del sito (sessione, lingua, sicurezza).",
      sectionNecessaryTitle: "Essenziali",
      sectionNecessaryBody:
        "Necessari per autenticazione, preferenza lingua e sicurezza. Non possono essere disattivati.",
      sectionAnalyticsTitle: "Analitici",
      sectionAnalyticsBody:
        "Vercel Analytics: ci aiuta a capire quali pagine vengono visitate e i passaggi del percorso (es. chat, lista d'attesa), in forma aggregata e anonima. Non usiamo Google Analytics né pubblicità.",
      sectionMoreTitle: "Maggiori informazioni",
      sectionMoreBody: "Per dettagli su come trattiamo i dati, leggi la nostra",
    },
    common: {
      signOut: "Esci",
      deleteAccount: "Elimina il mio account",
      deletingAccount: "Eliminazione...",
      deleteAccountWarningStudent:
        "Eliminare definitivamente il tuo account? Tutti i tuoi dati (chat con Vesta, profilo) verranno cancellati. L'azione non si può annullare.",
      deleteAccountWarningOwner:
        "Eliminare definitivamente il tuo account? Verranno eliminati anche TUTTI i tuoi immobili e i relativi dati. L'azione non si può annullare.",
      deleteAccountConfirm: "Sei sicuro? Non potrai recuperare l'account dopo.",
      oneMoment: "Un attimo...",
    },
    login: {
      forgotTitle: "Password dimenticata",
      forgotSubtitle: "Ti mandiamo un link per reimpostarla.",
      forgotSuccess:
        "Se esiste un account con questa email, riceverai a breve un link per scegliere una nuova password. Controlla anche lo spam.",
      emailPlaceholderReset: "Email con cui ti sei registrato",
      sendResetLink: "Invia link di reset",
      backToLogin: "← Torna al login",
      createAccountTitle: "Crea il tuo account",
      welcomeBackTitle: "Bentornato",
      signupSubtitle: "Per parlare con Vesta e vedere le stanze consigliate",
      signinSubtitle: "Accedi per continuare",
      iAmStudent: "Sono studente",
      iAmOwner: "Sono proprietario",
      fullNamePlaceholder: "Nome e cognome",
      emailPlaceholder: "Email",
      passwordPlaceholder: "Password (minimo 6 caratteri)",
      forgotPassword: "Password dimenticata?",
      consentPrefix: "Ho letto e accetto la",
      privacyPolicy: "Privacy Policy",
      and: "e i",
      termsOfService: "Termini di Servizio",
      consentMissing: "Devi accettare Privacy e Termini di servizio per registrarti.",
      rateLimitError:
        "Troppe email di conferma inviate in poco tempo. Riprova tra qualche minuto — se il problema continua, scrivici a info@coabito.it.",
      alreadyRegisteredError:
        "Esiste già un account con questa email. Prova ad accedere, oppure usa «Password dimenticata».",
      networkSmtpError:
        "Non siamo riusciti a completare la registrazione (problema di rete o invio email). Riprova tra un minuto; se ripeti, scrivici a info@coabito.it.",
      genericError: "Qualcosa è andato storto, riprova.",
      signUpButton: "Registrati",
      signInButton: "Accedi",
      alreadyHaveAccount: "Hai già un account? Accedi",
      noAccount: "Non hai un account? Registrati",
      stepIndicator: "{current} di {total}",
      step1Title: "Come ti chiami?",
      step1Hint: "Dicci chi sei e se cerchi casa o la proponi.",
      step2Title: "Come ti contattiamo?",
      step3Title: "Ultimo passo",
      stepContinue: "Continua",
      stepBack: "Indietro",
      stepNameRequired: "Un nome basta per iniziare — anche solo il tuo.",
      stepEmailRequired: "Serve un'email valida per scriverti.",
      stepPasswordRequired: "La password deve avere almeno 6 caratteri.",
      vestaStep1: "Piacere di conoscerti",
      vestaStep2: "Perfetto, ci siamo quasi",
      vestaStep3:
        "Perfetto, {name} — manca solo il consenso, poi ti mando la conferma via email.",
      vestaSignupDone:
        "Perfetto, {name} — account creato. Accedi con email e password, poi ti aspetto per parlare della tua stanza ideale.",
      vestaNameFallback: "ciao",
    },
    onboarding: {
      title: "Ultimo passaggio",
      subtitleOwner: "Qualche dato in più prima di iniziare a gestire i tuoi immobili.",
      subtitleStudent: "Qualche dato in più prima di parlare con Vesta.",
      profilePhoto: "Foto profilo *",
      phoneNumber: "Numero di telefono *",
      phonePlaceholder: "Es. +39 333 1234567",
      fiscalCodeOwner: "Codice fiscale o P.IVA *",
      fiscalCodeStudent: "Codice fiscale *",
      dateOfBirth: "Data di nascita *",
      continueButton: "Continua",
    },
    dashboard: {
      chatTab: "Chat",
      roomsTab: "Stanze",
      loadingChat: "Sto ritrovando la tua chat...",
    },
    chat: {
      subtitle: "Il tuo assistente casa · fuori sede",
      inputPlaceholder: "Scrivi un messaggio...",
      sendLabel: "Invia messaggio",
      progressLabel: "{done}/{total} · {step}",
      progressComplete: "Profilo completo",
      progressSteps: {
        city: "Città",
        university: "Università",
        campus: "Polo / facoltà",
        budget: "Budget",
        moveIn: "Data ingresso",
        study: "Studio",
        social: "Vita sociale",
        clean: "Pulizia",
        extras: "Fumo / animali",
      },
    },
    roomCard: {
      perMonth: "/mese",
      plusUtilities: "+ {utilities}€ spese",
      total: "Totale: {total}€/mese",
      viewListing: "Vedi annuncio",
      availableFrom: "Libera dal {date}",
      otherCampus: "Altro polo",
    },
    listingsCard: {
      guaranteedRent: "Canone garantito",
      verifiedOwner: "Proprietario verificato",
      photoSoon: "Foto in arrivo",
      zoneTbd: "Zona da confermare",
      seeDetails: "Vedi i dettagli",
      discoverFit: "Scopri la tua compatibilità con Vesta",
      share: "Condividi",
      shareAria: "Condividi questa stanza",
      shareCopied: "Link copiato",
      filterGuaranteed: "Solo canone garantito Coabito",
    },
    listingsFilters: {
      title: "Filtri",
      reset: "Azzera",
      hide: "Nascondi filtri",
      show: "Mostra filtri",
      collapseAria: "Nascondi pannello filtri",
      closeOverlayAria: "Chiudi filtri",
      resultCount: "{n} stanze trovate",
      resultCountOne: "1 stanza trovata",
      headCount: "{n} risultati",
      headCountOne: "1 risultato",
      emptyTitle: "Nessuna stanza con questi filtri",
      emptyBody:
        "Prova ad allargare la ricerca: alza il budget, togli qualche caratteristica o azzera i filtri.",
      emptyCta: "Azzera filtri",
      pageTitle: "Stanze disponibili",
      budget: "Budget mensile",
      zone: "Zona",
      roomType: "Tipo di stanza",
      size: "Superficie stanza (mq)",
      availability: "Data disponibilità",
      contract: "Durata minima contratto",
      flatmates: "Coinquilini in casa",
      heating: "Riscaldamento",
      features: "Caratteristiche",
      rules: "Regole della casa",
      trust: "Fiducia",
      all: "Tutte",
      any: "Qualsiasi",
      zoneTorrette: "Torrette",
      zoneCentro: "Centro",
      zonePalombina: "Palombina",
      zoneTavernelle: "Tavernelle",
      typeSingola: "Singola",
      typeDoppia: "Doppia",
      typeDus: "Doppia uso singola",
      sizeS: "Fino a 12",
      sizeM: "12-18",
      sizeL: "18+",
      availNow: "Da subito",
      availSept: "Da settembre",
      months6: "6 mesi",
      months12: "12 mesi",
      flatmates3plus: "3+",
      heatAutonomous: "Autonomo",
      heatCentral: "Centralizzato",
      featBathroom: "Bagno privato",
      featFurnished: "Arredata",
      featWasher: "Lavatrice",
      featWifi: "Wifi incluso",
      featBalcony: "Balcone",
      featElevator: "Ascensore",
      featAc: "Aria condizionata",
      featBills: "Spese incluse",
      rulePets: "Animali ammessi",
      ruleSmoking: "Fumatori ammessi",
      trustGuaranteed: "Solo canone garantito Coabito",
      trustVerified: "Solo proprietari verificati",
      sortLabel: "Ordina",
      sortRecommended: "Consigliati",
      sortPriceAsc: "Prezzo crescente",
      sortPriceDesc: "Prezzo decrescente",
      sortNewest: "Più recenti",
    },
    listingsCompare: {
      selectAria: "Seleziona per confrontare",
      selectShort: "Confronta",
      selectedCount: "{n} stanze selezionate",
      compareButton: "Confronta ({n})",
      clear: "Deseleziona",
      title: "Confronto stanze",
      close: "Chiudi",
      rowPrice: "Prezzo",
      rowZone: "Zona",
      rowDistance: "Distanza polo",
      rowMatch: "Compatibilità",
      rowGuaranteed: "Canone garantito",
      rowTags: "Atmosfera",
      yes: "Sì",
      no: "No",
      matchUnknown: "—",
      noTags: "—",
      distancePending: "Non ancora calcolata",
      utilitiesIncludedHint: "utenze da verificare",
      needTwo: "Seleziona almeno 2 stanze per confrontarle.",
      maxReached: "massimo 3",
      bestMatch: "Miglior match",
    },
    listingsMap: {
      viewLabel: "Vista elenco o mappa",
      viewList: "Elenco",
      viewMap: "Mappa",
      countOne: "1 stanza",
      countMany: "{n} stanze",
      styleLabel: "Stile mappa",
      styleStreets: "Standard",
      styleSatellite: "Satellite",
      styleDark: "Scuro",
      privacyNote: "I pin indicano la zona, non l’indirizzo esatto.",
      legendGuaranteed: "Canone garantito",
      legendMarketplace: "Marketplace",
      closePreview: "Chiudi anteprima",
      tokenMissingTitle: "Mappa non configurata",
      tokenMissingBody:
        "Aggiungi NEXT_PUBLIC_MAPBOX_TOKEN per attivare la mappa interattiva. L’elenco resta disponibile.",
    },
    ownerDashboard: {
      widgetEyebrow: "Canone garantito Coabito",
      nextPayout: "Prossimo pagamento",
      expectedOn: "Previsto il {date}",
      widgetAllOccupied: "Immobile occupato · Nessuna azione richiesta",
      widgetMixed: "Parte degli immobili in gestione · Nessuna azione richiesta",
      widgetSearching: "In fase di ricerca inquilino",
      showDetail: "Mostra dettaglio per immobile",
      hideDetail: "Nascondi dettaglio",
      occupied: "Occupato",
      searchingTenant: "In ricerca",
      guaranteedBadge: "Canone garantito",
      marketplaceBadge: "Sul marketplace",
      coabitoHandles:
        "Se ne occupa Coabito — nessuna gestione richiesta da parte tua.",
      contactCoabito: "Contatta Coabito",
      emptyCandidates:
        "Il tuo annuncio è visibile agli studenti compatibili — i primi candidati arriveranno a breve.",
      manage: "Dettaglio immobile",
      roomAvailable: "Libera",
      roomOccupied: "Occupata",
      verifiedStudent: "Studente verificato",
      message: "Messaggio",
      compatibility: "Compatibilità",
      candidatesHeading: "Candidati",
      messagesLink: "Messaggi in-app",
    },
    escrow: {
      title: "Pagamento in escrow",
      notLiveBadge: "Non ancora attivo",
      statusLabel: "Stato",
      statusPending: "In attesa (pending)",
      statusReleased: "Sbloccato (released)",
      statusDisputed: "In contestazione (disputed)",
      statusRefunded: "Rimborsato (refunded)",
      amountLabel: "Importo previsto",
      illustrative: "illustrativo",
      studentPendingCopy:
        "Il tuo pagamento resterà al sicuro finché non confermi il trasloco. Il prelievo reale non è ancora attivo: stiamo completando l'inquadramento legale.",
      ownerPendingCopy:
        "Riceverai il pagamento non appena lo studente conferma l'arrivo. Il prelievo reale non è ancora attivo: stiamo completando l'inquadramento legale.",
      confirmMoveInStudent: "Confermo di essere arrivato",
      confirmMoveInOwner: "Confermo il trasloco",
      reportIssue: "Segnala un problema",
      disabledHint: "Disponibile quando l'escrow sarà attivo",
      legalHoldNote:
        "Demo / predisposizione: nessun addebito Stripe finché non riceviamo parere legale e non attiviamo ESCROW_LIVE.",
      marketplaceOnlyNote:
        "L'escrow riguarda solo gli immobili sul marketplace indipendente, non il canone garantito Coabito.",
      optionalPublishNote:
        "Opzionale e non bloccante: puoi pubblicare l'annuncio anche prima di completare l'onboarding Stripe.",
      coverageLabel: "Cosa può includere",
      coverageFirstMonth: "Solo prima mensilità",
      coverageDeposit: "Solo cauzione",
      coverageBoth: "Prima mensilità + cauzione",
      breakdownFirstMonth: "Prima mensilità",
      breakdownDeposit: "Cauzione",
    },
    roomList: {
      title: "Stanze consigliate per te",
      resultsSuffix: "risultati ordinati per compatibilità",
      emptyTitle: "Ancora nessuna stanza da mostrarti",
      emptySubtitle:
        "Continua a chattare con Vesta: appena avrà budget, polo e abitudini troverà le stanze più compatibili con te.",
      noMatchTitle: "Ancora nessuna stanza compatibile",
      noMatchSubtitle:
        "Ho salvato le tue preferenze. Appena arriva un immobile compatibile con te, sarai tra i primi ad essere avvisato.",
      shareCta: "Condividi con un amico",
      shareText: "Sto cercando casa da fuori sede con Coabito — entra in lista d'attesa:",
      loadingLabel: "Caricamento stanze compatibili…",
    },
    notFound: {
      title: "Pagina non trovata",
      body: "Questo indirizzo non esiste o è stato spostato. Torna alla home oppure entra in lista d'attesa.",
      home: "Torna alla home",
      waitlist: "Lista d'attesa",
    },

    serviziJourney: {
      eyebrow: "I nostri servizi",
      title: "Ti accompagniamo in ogni fase, non solo nella ricerca",
      intro:
        "Coabito non è parte del contratto di locazione: studente e proprietario firmano direttamente. Il nostro ruolo è fiducia, matching e sicurezza della transazione.",
      toggleStudent: "Sono studente",
      toggleOwner: "Sono proprietario",
      ctaBody: "Pronto a iniziare? Entra in lista d'attesa o proponi un immobile.",
      ctaStudent: "Sono uno studente",
      ctaOwner: "Sono un proprietario",
      student: {
        phases: [
          {
            title: "Prima di candidarti",
            subtitle: "Verifica, fiducia, trasparenza dei costi",
            items: [
              {
                title: "Badge verificato",
                body: "Studenti e proprietari verificati, non solo dichiarati.",
              },
              {
                title: "Costo totale trasparente",
                body: "Canone, utenze e cauzione visibili insieme, mai scoperti dopo.",
              },
              {
                title: "Reputazione portabile",
                body: "Il tuo storico di buon inquilino ti segue città dopo città.",
              },
            ],
          },
          {
            title: "Durante il trasloco",
            subtitle: "Pagamento sicuro e supporto pratico",
            items: [
              {
                title: "Pagamento in escrow",
                body: "Il tuo pagamento resta al sicuro finché non confermi il trasloco.",
              },
              {
                title: "Checklist personalizzata",
                body: "Documenti e scadenze, generati in base al tuo caso specifico.",
              },
              {
                title: "Attivazione utenze assistita",
                body: "Luce, gas, internet — ti aiutiamo ad attivarle senza stress.",
              },
            ],
          },
          {
            title: "Dopo esserti trasferito",
            subtitle: "Non spariamo se qualcosa va storto",
            items: [
              {
                title: "Mediazione diretta",
                body: "Un problema con il proprietario o un coinquilino? Scrivici, non sei solo.",
              },
              {
                title: "Assistenza ricerca sostituto",
                body: "Se devi lasciare la stanza, ti aiutiamo a trovare chi ti sostituisce.",
              },
              {
                title: "Contatto diretto col fondatore",
                body: "Per qualsiasi dubbio, non un ticket assegnato a caso.",
              },
            ],
          },
        ],
      },
      owner: {
        phases: [
          {
            title: "Prima di pubblicare",
            subtitle: "Fiducia e un annuncio che lavora per te",
            items: [
              {
                title: "Badge proprietario verificato",
                body: "Documento di proprietà o delega verificato, visibile agli studenti.",
              },
              {
                title: "Annuncio assistito da Vesta",
                body: "Descrivi l'immobile in chat: Vesta genera un annuncio strutturato.",
              },
              {
                title: "Foto e presentazione",
                body: "Supporto per rendere l'immobile chiaro e credibile al primo sguardo.",
              },
            ],
          },
          {
            title: "Durante le candidature",
            subtitle: "Selezione filtrata e pagamento sicuro",
            items: [
              {
                title: "Pre-filtro studenti compatibili",
                body: "Solo profili filtrati per criteri di base, per ridurre il tempo di selezione.",
              },
              {
                title: "Pagamento in escrow",
                body: "Prima mensilità o cauzione trattenute finché il trasloco non è confermato.",
              },
              {
                title: "Reputazione studente visibile",
                body: "Storico da buon inquilino mostrato prima del contatto diretto.",
              },
            ],
          },
          {
            title: "Dopo l'affitto",
            subtitle: "Supporto operativo senza entrare nel contratto",
            items: [
              {
                title: "Mediazione e garanzia",
                body: "Canale di supporto e, in roadmap, copertura su inadempimento — senza che Coabito sia parte del contratto.",
              },
              {
                title: "Assistenza ricerca sostituto",
                body: "Quando uno studente lascia, aiutiamo a trovare il prossimo inquilino.",
              },
              {
                title: "Contatto diretto col fondatore",
                body: "Un interlocutore reale per dubbi e urgenze, non un ticket anonimo.",
              },
            ],
          },
        ],
      },
    },
    listaAttesa: {
      backToHome: "← Torna alla home",
      title: "Lista d'attesa",
      eyebrow: "Le prime stanze arrivano a {month}",
      titleBefore: "Sarai tra i primi a ",
      titleAccent: "trovare casa",
      titleAfter: "",
      subtitle:
        "Iscriviti alla lista d'attesa: appena una stanza compatibile con te sarà disponibile, sarai il primo a saperlo.",
      nameLabel: "Nome e cognome *",
      emailLabel: "Email",
      emailPlaceholder: "La tua email",
      phoneLabel: "Telefono / WhatsApp",
      contactHint: "Almeno uno tra email e telefono è obbligatorio.",
      facoltaLabel: "Facoltà",
      poloLabel: "Polo universitario",
      budgetLabel: "Budget massimo (€/mese)",
      privacyPrefix: "Ho letto e accetto la",
      privacyLightPrefix: "Iscrivendoti accetti la",
      privacyLightSuffix: ".",
      privacyLink: "Privacy Policy",
      privacyRequired: "Devi accettare la Privacy Policy per iscriverti.",
      submit: "Iscriviti gratis",
      submitting: "Invio...",
      trustItems: ["Gratis, sempre", "Zero spam", "Cancellati quando vuoi"] as const,
      comingSoonLabel: "Presto disponibile",
      subtitleCity:
        "Coabito sta arrivando a {city} ({status}). Iscriviti: ti avvisiamo appena apriamo le iscrizioni lì.",
      statVacantHomes: "Case sfitte in Italia",
      statStudentsQualitative: "Migliaia di studenti fuori sede in tutta Italia",
      statLaunch: "Prime stanze disponibili",
      statFees: "Commissioni",
      statFeesValue: "0€",
      successTitle: "Sei in lista!",
      successBody:
        "Ti avviseremo appena arriva un immobile compatibile con le tue preferenze. Nel frattempo, puoi condividere il link con chi cerca casa da fuori sede.",
      positionHeadline: "Sei il {n}° in lista d'attesa",
      successBodyWithPosition:
        "Ti avviseremo appena ci sarà una stanza compatibile con il tuo profilo.",
      pendingTitle: "Controlla la tua email",
      pendingBody:
        "Ti abbiamo inviato un link di conferma. Cliccalo entro 7 giorni per attivare l'iscrizione: solo dopo potremo avvisarti quando arriva una stanza compatibile — e ti mostreremo la tua posizione in lista.",
      confirm: {
        successTitle: "Iscrizione confermata",
        successBody:
          "Perfetto: sei in lista d'attesa. Ti avviseremo appena arriva qualcosa di compatibile con le tue preferenze.",
        alreadyTitle: "Già confermata",
        alreadyBody: "La tua iscrizione era già attiva. Non serve fare altro.",
        expiredTitle: "Link scaduto",
        expiredBody:
          "Questo link di conferma non è più valido. Iscriviti di nuovo dalla lista d'attesa per ricevere un nuovo email.",
        invalidTitle: "Link non valido",
        invalidBody:
          "Non riusciamo a confermare questa iscrizione. Controlla il link nell'email o iscriviti di nuovo.",
      },
      errorGeneric:
        "Qualcosa è andato storto. Riprova, o scrivici a info@coabito.it.",
      contactRequired: "Inserisci almeno un'email o un numero di telefono.",
      referral: {
        title: "Invita un amico",
        body: "Condividi il tuo link: sarai avvisato prima quando arrivano le prime stanze.",
        copy: "Copia link",
        copied: "Copiato!",
        copyFallback: "Copia questo link:",
        whatsapp: "WhatsApp",
        whatsappAria: "Condividi il link di invito su WhatsApp",
        shareText:
          "Sto cercando una stanza da fuori sede con Coabito — entra in lista d'attesa con il mio link:",
      },
      facoltaOptions: [
        { value: "ingegneria_informatica", label: "Ingegneria informatica" },
        { value: "ingegneria_civile", label: "Ingegneria civile" },
        { value: "medicina", label: "Medicina" },
        { value: "economia", label: "Economia" },
        { value: "giurisprudenza", label: "Giurisprudenza" },
        { value: "agraria", label: "Agraria" },
        { value: "scienze", label: "Scienze" },
        { value: "design", label: "Design" },
        { value: "altro", label: "Altro" },
      ],
      poloOptions: [
        { value: "monte_dago", label: "Monte Dago / Tavernelle" },
        { value: "torrette", label: "Torrette" },
        { value: "centro_economia_giurisprudenza", label: "Centro / Villarey" },
        { value: "altro", label: "Altro" },
      ],
    },
    myHomeCard: {
      title: "🏠 La mia casa",
      statusPending: "In attesa di conferma",
      statusPaid: "Pagato questo mese ✓",
      statusLate: "In ritardo",
      rent: "Affitto",
      utilities: "Utenze stimate",
      totalPerMonth: "Totale/mese",
      tenantSince: "Inquilino dal {date}",
      checklistTitle: "📋 La tua checklist di trasloco",
    },
    myPayments: {
      title: "I miei pagamenti",
      nextPayment: "Prossimo pagamento",
      dueBy: "Scade il {date}",
      payNow: "Paga ora",
      paying: "Reindirizzamento…",
      payError: "Qualcosa è andato storto. Riprova o contattaci.",
      stripeSoon:
        "I pagamenti online saranno attivi a breve — nel frattempo contattaci per le modalità di pagamento.",
      whatsappCta: "Scrivici su WhatsApp",
      whatsappMessage:
        "Ciao! Sono uno studente Coabito e vorrei sapere come pagare l'affitto di questo mese.",
      history: "Storico",
      historyEmpty: "Nessun pagamento registrato ancora.",
      receipt: "Ricevuta",
      statusPaid: "Pagato",
      statusDue: "In scadenza",
      statusLate: "In ritardo",
      statusFailed: "Fallito",
    },
    esempi: {
      backToHome: "← Torna alla home",
      title: "Come funziona, in pratica",
      subtitle:
        "Due esempi concreti di quello che vedi usando la piattaforma. Nessun dato vero: solo per farti capire il tono e il tipo di risultato.",
      conversationTitle: "Una conversazione con Vesta",
      conversationSubtitle:
        "Bastano due minuti di chat, in un tono normale — come scriveresti a un amico, non come compili un modulo.",
      scoreTitle: "Come leggiamo la compatibilità",
      scoreSubtitle:
        "Ogni stanza mostra un punteggio e il motivo dietro — non solo prezzo e metri quadri.",
      howToReadTitle: "Come si legge il punteggio",
      scoreHigh: "85-100%:",
      scoreHighDetail: "compatibilità alta — budget, orari e abitudini si allineano bene",
      scoreMed: "65-84%:",
      scoreMedDetail: "compatibilità media — vale la pena dare un'occhiata, con qualche compromesso",
      scoreLow: "Sotto il 65%:",
      scoreLowDetail:
        "resta un'opzione valida, solo meno allineata alle tue preferenze — mai un errore",
      tryItYourself: "Prova tu stesso →",
    },
    resetPassword: {
      title: "Nuova password",
      subtitle: "Scegline una nuova per il tuo account.",
      success: "✓ Password aggiornata! Ti stiamo portando dentro...",
      verifying:
        "Verifica del link in corso... Se questa schermata resta ferma, il link potrebbe essere scaduto: torna al",
      loginLink: "login",
      andRequestNew: "e richiedine uno nuovo.",
      newPasswordPlaceholder: "Nuova password (minimo 6 caratteri)",
      repeatPasswordPlaceholder: "Ripeti la nuova password",
      tooShort: "La password deve avere almeno 6 caratteri.",
      mismatch: "Le due password non coincidono.",
      invalidToken: "Questo link non è più valido. Richiedine uno nuovo dal login.",
      saveButton: "Salva nuova password",
    },
    installa: {
      backToHome: "← Torna alla home",
      title: "Installa Coabito sul tuo telefono",
      subtitle:
        "Niente App Store: bastano quattro tocchi per avere un'icona vera sulla schermata Home, che si apre a schermo intero come un'app.",
      iphoneTab: "iPhone",
      androidTab: "Android",
      note: "Da sapere: il sito resta identico a prima anche senza installarlo — questo passaggio aggiunge solo un'icona comoda, non cambia nulla di come funziona Coabito.",
      iosSteps: [
        {
          title: "Apri Coabito su Safari",
          body: "Vai su coabito.it come faresti normalmente.",
        },
        {
          title: "Tocca l'icona di condivisione",
          body: "In basso, l'icona con il quadrato e la freccia verso l'alto.",
        },
        {
          title: "Tocca “Aggiungi alla schermata Home”",
          body: "La trovi scorrendo la lista che compare.",
        },
        {
          title: "Fatto! L'icona è sulla tua Home",
          body: "Da ora puoi aprire Coabito come una vera app.",
        },
      ],
      androidSteps: [
        {
          title: "Apri Coabito su Chrome",
          body: "Vai su coabito.it come faresti normalmente.",
        },
        {
          title: "Tocca i tre puntini in alto",
          body: "In alto a destra, il menu con i tre puntini verticali.",
        },
        {
          title: "Tocca “Installa app”",
          body: "Se non la vedi, cerca “Aggiungi a schermata Home”.",
        },
        {
          title: "Fatto! L'icona è sulla tua Home",
          body: "Da ora puoi aprire Coabito come una vera app.",
        },
      ],
    },
  },
  en: {
    nav: {
      forStudents: "For students",
      forOwners: "For property owners",
      howItWorks: "How it works",
      services: "Services",
      rooms: "Rooms",
      installApp: "Install the app",
      login: "Log in",
      waitlist: "Waitlist",
    },
    hero: {
      badge: "Made for students living away from home",
      titlePart1: "The right home. ",
      titleHighlight: "The right",
      titlePart2: " people.",
      subtitle:
        "Housing marketplace for students living away from home: transparent rooms, verifiable profiles and Coabito Compatibility — find the right room and roommates, not just another listing.",
      ctaStudent: "Find your match",
      ctaOwner: "List a room",
      ctaBrowse: "Browse rooms",
      freeNote: "Free for students. No credit card required.",
      alreadyAccount: "Already have an account? Sign in",
      seeExample: "See an example",
      socialProof: "{count} students already on the waitlist",
      liveCompatibility: "Compatibility calculated in real time",
      mockBot: "What are you studying, and what's your monthly budget?",
      mockUser: "Engineering, second year. Max €420",
      mockRoomTitle: "Bright single with balcony",
      mockRoomMeta: "€380/month · 9 min from campus",
      badgeCompatTitle: "92% compatibility",
      badgeCompatSub: "Calculated in real time",
      badgeFeesTitle: "Zero fees",
      badgeFeesSub: "For students",
    },
    launchCountdown: {
      days: "The first rooms arrive in {n} days",
      oneDay: "The first rooms arrive tomorrow",
      arrived: "The first rooms are on their way",
    },
    intro: {
      skip: "Skip",
      tagline: "— tailored, like a garment.",
      ariaLabel: "Coabito animated introduction",
    },
    howItWorksStudents: {
      eyebrow: "For students",
      title: "Three steps, and Vesta does the rest",
      ctaLabel: "Start chatting with Vesta",
      steps: [
        {
          number: "1",
          title: "Tell us who you are",
          description:
            "Degree course, university, budget and move-in date: just a couple of minutes of chat, no endless forms.",
        },
        {
          number: "2",
          title: "Vesta learns your habits",
          description:
            "Study hours, social life, cleanliness: things you'd normally only find out after signing.",
        },
        {
          number: "3",
          title: "Get your compatible rooms",
          description:
            "Every room shows a compatibility score and why, not just price and square meters.",
        },
      ],
    },
    howItWorksOwners: {
      eyebrow: "For property owners",
      title: "Matching and trust, direct contract",
      ctaLabel: "List your property",
      steps: [
        {
          number: "1",
          title: "Tell us about your property",
          description:
            "Address, price, photos: we publish the listing on the platform and, where it makes sense, on major portals.",
        },
        {
          number: "2",
          title: "We pre-filter interested students",
          description:
            "Only compatible students — and, as soon as available, verified ones — reach you: no time-wasters.",
        },
        {
          number: "3",
          title: "You choose and sign directly",
          description:
            "The lease stays between you and the student. Coabito supports matching, trust and transaction safety.",
        },
      ],
    },
    ownerCalculator: {
      eyebrow: "For property owners",
      title: "How much could you receive with guaranteed rent?",
      subtitle:
        "An indicative estimate based on area and size of your property — not a binding offer.",
      zoneLabel: "Area",
      zoneTorrette: "Torrette",
      zoneCentro: "Centro",
      zonePalombina: "Palombina",
      roomsLabel: "Number of rooms",
      sizeLabel: "Total size (sqm)",
      mqUnit: "sqm",
      conditionLabel: "Property condition",
      conditionGood: "Good",
      conditionRefresh: "Needs refresh",
      conditionRenovated: "Renovated",
      resultLabel: "Estimated guaranteed rent",
      perMonth: "/month",
      rangeLabel: "Indicative range: €{low} - €{high}",
      disclaimer:
        "This is an estimate based on average area prices, not a binding offer. The real rent is agreed together during a site visit.",
      cta: "Request a precise valuation",
      whatsappMessage:
        "Hi! I used the Coabito guaranteed-rent calculator. Property: {zone}, {rooms} rooms, {mq} sqm, condition {condition}. Indicative estimate: €{amount}/month (range €{low}–{high}). I'd like a precise valuation.",
    },
    howItWorksDemo: {
      eyebrow: "How it works",
      titleLine1: "We won't just tell you.",
      titleLine2: "We'll show you.",
      toggleAria: "Choose your point of view",
      toggleStudent: "I'm a student",
      toggleOwner: "I'm a landlord",
      stepsAria: "Steps",
      exampleBadge: "Example",
      ctaStudent: "Start chatting with Vesta",
      ctaOwner: "List your property",
      student: {
        steps: [
          {
            title: "You chat with Vesta",
            subtitle: "Course, budget, study hours",
          },
          {
            title: "See the real cost, not just rent",
            subtitle: "Rent + utilities + deposit, together",
          },
          {
            title: "Meet who you'd live with",
            subtitle: "Roommates with habits like yours",
          },
          {
            title: "Your payment stays safe",
            subtitle: "Released only after you confirm move-in",
          },
        ],
        proofs: [
          {
            badge: "Zero fees",
            title: "Free for students",
            body: "No search commission, ever — unlike traditional portals.",
            accent: "coral" as const,
          },
          {
            badge: "✓ Verified student",
            title: "You always know who you're talking to",
            body: "Badge granted only after real university enrolment verification.",
            accent: "teal" as const,
          },
        ],
        screens: {
          chat: {
            bot1: "What are you studying, and what's your monthly budget?",
            me: "Engineering, second year. Max €420",
            bot2: "Perfect — let's start looking 🔥",
          },
          cost: {
            title: "Single · Torrette",
            match: "92%",
            rent: "Rent: €320",
            utilities: "Utilities: €40",
            deposit: "Deposit: €640 (one-off)",
            total: "Monthly total: €360",
            note: "no hidden costs later",
          },
          roommates: {
            title: "Your roommates",
            people: [
              { initials: "GM", tag: "Studies a lot" },
              { initials: "LR", tag: "Quiet home" },
              { initials: "+1", tag: "Similar hours" },
            ],
          },
          escrow: {
            rows: [
              { label: "Payment made — held safely with Coabito", done: true },
              { label: "Waiting for move-in confirmation", done: false },
              { label: "Released to landlord after you confirm", done: false },
            ],
          },
        },
      },
      owner: {
        steps: [
          {
            title: "You tell Vesta about your property",
            subtitle: "No long forms to fill in",
          },
          {
            title: "Get pre-verified applicants",
            subtitle: "University enrolment confirmed",
          },
          {
            title: "Rent arrives on time",
            subtitle: "Every month, no chasing anyone",
          },
          {
            title: "What if something goes wrong?",
            subtitle: "The question no one else answers honestly",
          },
        ],
        proofs: [
          {
            badge: "✓ Guaranteed rent",
            title: "No surprises, every month",
            body: "On selected properties, Coabito guarantees the rent — even if the room is empty.",
            accent: "teal" as const,
          },
          {
            badge: "One contact",
            title: "Not dozens of separate students",
            body: "One contract, one person to talk to for anything.",
            accent: "coral" as const,
          },
        ],
        screens: {
          chat: {
            bot1: "How many rooms, and which area?",
            me: "3 rooms, Torrette, near Medicine",
            bot2: "Listing ready — you review it before it goes live",
          },
          applicants: {
            rows: [
              {
                initials: "GM",
                name: "Giulia M.",
                badge: "✓ Verified student",
                score: "91%",
              },
              {
                initials: "LR",
                name: "Luca R.",
                badge: "✓ Verified student",
                score: "84%",
              },
            ],
          },
          payout: {
            label: "Next payout",
            amount: "€637",
            sub: "15 September · Occupied · No action needed",
          },
          whatIf: {
            question: "What if the student doesn't pay?",
            answer:
              "On guaranteed-rent properties, the risk is ours: you still receive the rent.",
          },
        },
      },
    },
    founderNote: {
      quote:
        "I also searched for a room in Ancona as a student, without knowing anything about the people I'd end up living with. Coabito is the service I wish I'd had, my first year.",
      attribution: "— Giovanni, founder of Coabito",
    },
    faq: {
      eyebrow: "Frequently asked questions",
      title: "The questions you really ask us",
      seeAll: "All student FAQs",
      toggleStudent: "I'm a student",
      toggleOwner: "I'm an owner",
      toggleAria: "Choose student or owner FAQs",
      studentItems: [
        {
          question: "How much does Coabito cost?",
          answer: "Nothing. Zero search fees for students, always.",
        },
        {
          question: "Is my money safe?",
          answer:
            "Yes. Payment stays held with Coabito until you confirm the move-in went as expected — it isn't released to the landlord before that.",
          worry: true,
        },
        {
          question: "Can I choose who I live with?",
          answer:
            "Vesta suggests rooms where flatmates have habits similar to yours (hours, cleanliness, social life) — you always see why before you apply.",
          worry: true,
        },
        {
          question: "When do the first rooms arrive?",
          answer:
            "The first availability arrives in September 2026. Join the waitlist to be notified.",
        },
        {
          question: "What if I don't find a place?",
          answer:
            "You stay on the waitlist and keep receiving compatible suggestions as new rooms are added — no commitment, no deadline.",
          worry: true,
        },
      ],
      ownerItems: [
        {
          question: "What if the student doesn't pay?",
          answer:
            "On guaranteed-rent properties, the risk is ours: you still receive the agreed rent, every month.",
          worry: true,
        },
        {
          question: "What if they damage the property?",
          answer:
            "The student's deposit stays as security. For independent marketplace listings, we can discuss activating an optional extra guarantee together.",
          worry: true,
        },
        {
          question: "Can I reject a candidate?",
          answer:
            "On guaranteed-rent properties, we select. On independent ones, you always decide who to accept among verified candidates.",
        },
        {
          question: "How much does it cost me?",
          answer:
            "Nothing to publish. Coabito is paid through management, not fees charged to you.",
        },
        {
          question: "Can I end the agreement?",
          answer:
            "Yes — exit terms are clearly defined in the contract, agreed before signing, and apply to both parties.",
          worry: true,
        },
      ],
    },
    faqStudenti: {
      eyebrow: "For students",
      title: "Frequently asked questions for students",
      subtitle:
        "Costs, matching with Vesta, the waitlist, and how we pick compatible rooms — clear answers before you sign up.",
      backHome: "← Back to home",
      ctaWaitlist: "Join the waitlist",
      ctaChat: "Chat with Vesta",
      items: [
        {
          question: "How much does Coabito cost?",
          answer:
            "For students, chatting with Vesta, joining the waitlist, and viewing suggested rooms is free. No credit card, no signup fee. You only pay the rent for the room you choose, like a normal tenancy.",
        },
        {
          question: "How does matching with Vesta work?",
          answer:
            "You tell Vesta your course, campus, budget and living habits. We compare each new room to your profile (price, distance to campus, lifestyle) and only show truly compatible options — with a clear score, not an endless list of ads.",
        },
        {
          question: "What happens after I join the waitlist?",
          answer:
            "If you leave an email, we send a confirmation link (double opt-in). After confirming you're on the list: when a compatible room appears, we notify you. You may get a couple of project updates in the meantime; if you already find a room with us, we stop the “we're still preparing” messages.",
        },
        {
          question: "Can I choose area and budget?",
          answer:
            "Yes. In chat or on the form you set a max budget and campus/area of interest. Vesta uses them as filters — better to be honest about your ceiling than accept a place you can't sustain after a few months.",
        },
        {
          question: "How are roommates selected?",
          answer:
            "We don't randomly put people in the same flat. We look at study habits, sociability, guests and cleanliness — plus budget and campus — so living together is more likely to work. You see the score and decide whether to go ahead.",
        },
        {
          question: "Do I need an account for the waitlist?",
          answer:
            "No. You can join with the light form (name + email or phone). Or register and chat with Vesta: we'll save preferences from your profile when there isn't a suitable room yet.",
        },
        {
          question: "When do the first rooms arrive?",
          answer:
            "We're preparing availability for the 2026/2027 academic year, aiming around September. Joining the waitlist now means you'll be among the first notified when something compatible opens up.",
        },
      ],
    },
    footer: {
      tagline:
        "Independent platform for out-of-town students and property owners. Not affiliated with any university.",
      rights: "All rights reserved.",
      privacy: "Privacy",
      terms: "Terms of service",
      cookies: "Cookies",
      guide: "Ancona student housing guide",
      faq: "Student FAQ",
      guideFirstTime: "First time living away",
      services: "Services",
    },
    whatsappFloat: {
      ariaLabel: "Message us on WhatsApp",
      generic: "Hi! I found Coabito and I'd like to know more",
      owners:
        "Hi! I have a property and I'd like to know more about Coabito.",
      waitlist:
        "Hi! I'm a student living away from home and I'd like info about Coabito / the waitlist.",
    },
    guidaAffittoAncona: {
      title: "How to rent student housing in Ancona",
      subtitle:
        "A practical guide for UNIVPM students: timing, areas near campus, realistic budgets, and how to avoid the usual listing traps.",
      intro:
        "Finding a room in Ancona looks easy until you answer dozens of ads, take pointless viewings, and discover that “bright single” is 40 minutes from your campus. This guide covers what actually matters if you study at Università Politecnica delle Marche.",
      sections: [
        {
          title: "When to start looking",
          body: "For the start of the academic year, the best places move between June and September. Arriving in October can still work, but join the waitlist or chat with Vesta early: the clearer your profile (campus, budget, move-in date), the easier it is to match you when something opens up.",
        },
        {
          title: "Areas and university campuses",
          body: "Monte Dago (Engineering, Agriculture, Sciences) is well served by bus 65 University Link and 46/. Torrette (Medicine) sits on the same 65 corridor. Economics and Law gravitate toward the centre / Villarey, where walking and lines to the station and Piazza Roma matter most. A “cheap” room far from your campus often costs more in daily time and stress.",
        },
        {
          title: "A realistic budget",
          body: "Beyond monthly rent, plan for utilities, deposit and any condo fees. On Coabito you set a maximum budget and Vesta uses it to filter — better to be honest about your real ceiling than accept a place you can’t sustain after two months.",
        },
        {
          title: "What to ask (and what to avoid)",
          body: "Always ask about availability date, what’s included in bills, whether the room is single or shared, and rules on guests/smoking. Be wary of deposit transfers before you’ve seen the place or signed something clear. On Coabito the lease stays direct with the landlord: the platform reduces opaque steps with matching, verification and — on the roadmap — escrow on the first month’s rent/deposit.",
        },
        {
          title: "How Coabito helps",
          body: "Instead of scrolling random listings, you tell Vesta your course, budget and living habits. We suggest compatible rooms near your campus, with a score that weighs lifestyle — not just square metres. For students, chatting with Vesta and seeing suggestions is free.",
        },
      ],
      ctaTitle: "Ready to search without wasting weeks?",
      ctaBody: "Start chatting with Vesta or join the waitlist — we’ll notify you when something compatible appears.",
      ctaChat: "Chat with Vesta",
      ctaWaitlist: "Join the waitlist",
      backHome: "← Back to home",
    },
    guidaPrimaVolta: {
      title: "First time living away: a practical guide",
      intro:
        "Moving for university is often the first time you handle everything yourself: housing, paperwork, money, flatmates. You don’t need to already know how — you need to know what to expect. This guide collects what we wish we’d known before we left home.",
      sections: [
        {
          title: "Before you leave",
          blocks: [
            {
              heading: "Documents to prepare",
              bullets: [
                "ID card and tax code (keep them with you, not only on move-in day)",
                "University enrolment certificate or matriculation proof",
                "If the landlord asks: guarantor documents (usually a parent)",
              ],
            },
            {
              heading: "The contract",
              body: "Read all of it before signing, including the boring parts. Check especially: length, deposit amount, what happens if you leave early, and who pays which utilities. If something isn’t clear, ask — a serious contract can explain every line.",
            },
            {
              heading: "A real budget, not just rent",
              body: "Rent is only part of the monthly cost. Factor in utilities (electricity, gas, internet — sometimes included, sometimes not: check first), groceries, transport, and study materials. A realistic budget avoids nasty surprises in month two.",
            },
          ],
        },
        {
          title: "The move",
          blocks: [
            {
              heading: "What to bring (and what not to)",
              body: "You don’t need to ship your entire bedroom. Most student rooms already have the basics (bed, desk, wardrobe). Bring: bedding, personal items, any study gear you need. Buy the rest locally if you need it — often cheaper than transporting it.",
            },
            {
              heading: "Changing residence",
              body: "It isn’t mandatory, but it’s worth checking whether it helps in your case (it can affect some benefits, university fees, or healthcare arrangements). Ask your home town registry office what changes.",
            },
            {
              heading: "Turning on utilities",
              body: "If they aren’t already included in the contract, check activation timelines in advance — internet especially can take a few days. Better to know before you arrive than discover it on day one with no connection.",
            },
          ],
        },
        {
          title: "Living with flatmates",
          blocks: [
            {
              heading: "The first days matter",
              body: "Talk early and openly about house rules: cleaning, schedules, guests, shared expenses. Don’t wait until it becomes a problem — most friction comes from unspoken expectations, not bad intentions.",
            },
            {
              heading: "Shared expenses",
              body: "Decide together from day one how to split shared groceries, utilities, and household products. A simple method (even just a shared sheet) avoids endless “who paid what” debates.",
            },
            {
              heading: "If something isn’t working",
              body: "Friction is normal. Try talking directly before letting it escalate. If it persists, it’s still better to face it early than wait until the contract ends hoping it fixes itself.",
            },
          ],
        },
        {
          title: "Common mistakes to avoid",
          blocks: [
            {
              bullets: [
                "Not reading the contract carefully before signing — even if someone is in a rush, take the time you need",
                "Not clarifying house rules early — an awkward day-one talk beats a month-later conflict",
                "Underestimating the real budget — rent isn’t the only cost",
                "Not keeping payment receipts — useful for you and for any future dispute",
              ],
            },
          ],
        },
      ],
      closing:
        "You don’t need to arrive 100% prepared — almost nobody is the first time they live away. You just need to know what to watch for. If you have specific questions about your situation, write to us — see below.",
      relatedGuide: "Guide: renting student housing in Ancona",
      backHome: "← Back to home",
    },
    founderContact: {
      title: "Questions before you sign up?",
      body: "Message me directly. I’m Giovanni, the founder of Coabito — I also study at UNIVPM and know the out-of-town housing search well. If you’re unsure how the platform works, or simply want to know if it’s right for you, write on WhatsApp: I’ll reply myself.",
      cta: "Message me on WhatsApp",
      whatsappMessage:
        "Hi Giovanni! I have a question about Coabito / the First time living away guide.",
      photoAlt: "Giovanni, founder of Coabito",
    },
    cookieBanner: {
      title: "We use cookies",
      description:
        "We use essential cookies to make the site work and, only with your consent, measurement cookies (Vercel Analytics) to understand how to improve Coabito.",
      acceptAll: "Accept all",
      rejectNonEssential: "Reject non-essential",
      customize: "Customize",
      preferencesTitle: "Cookie preferences",
      savePreferences: "Save preferences",
      close: "Close",
      privacyLink: "Privacy Policy",
      sectionIntroTitle: "How we use cookies",
      sectionIntroBody:
        "You can choose which cookies to accept. Essential cookies are always on because they are required for the site to work (session, language, security).",
      sectionNecessaryTitle: "Essential",
      sectionNecessaryBody:
        "Required for authentication, language preference and security. These cannot be turned off.",
      sectionAnalyticsTitle: "Analytics",
      sectionAnalyticsBody:
        "Vercel Analytics: helps us understand which pages are visited and key funnel steps (e.g. chat, waitlist), in aggregate and anonymous form. We do not use Google Analytics or ads.",
      sectionMoreTitle: "More information",
      sectionMoreBody: "For details on how we process data, read our",
    },
    common: {
      signOut: "Sign out",
      deleteAccount: "Delete my account",
      deletingAccount: "Deleting...",
      deleteAccountWarningStudent:
        "Permanently delete your account? All your data (chat with Vesta, profile) will be removed. This cannot be undone.",
      deleteAccountWarningOwner:
        "Permanently delete your account? ALL your properties and related data will also be deleted. This cannot be undone.",
      deleteAccountConfirm: "Are you sure? You won't be able to recover your account afterwards.",
      oneMoment: "One moment...",
    },
    login: {
      forgotTitle: "Forgot password",
      forgotSubtitle: "We'll send you a link to reset it.",
      forgotSuccess:
        "If an account exists for this email, you’ll soon receive a link to choose a new password. Check spam too.",
      emailPlaceholderReset: "Email you signed up with",
      sendResetLink: "Send reset link",
      backToLogin: "← Back to login",
      createAccountTitle: "Create your account",
      welcomeBackTitle: "Welcome back",
      signupSubtitle: "To chat with Vesta and see recommended rooms",
      signinSubtitle: "Log in to continue",
      iAmStudent: "I'm a student",
      iAmOwner: "I'm a property owner",
      fullNamePlaceholder: "Full name",
      emailPlaceholder: "Email",
      passwordPlaceholder: "Password (at least 6 characters)",
      forgotPassword: "Forgot your password?",
      consentPrefix: "I have read and accept the",
      privacyPolicy: "Privacy Policy",
      and: "and the",
      termsOfService: "Terms of Service",
      consentMissing: "You must accept the Privacy Policy and Terms of Service to sign up.",
      rateLimitError:
        "Too many confirmation emails sent in a short time. Try again in a few minutes — if it keeps happening, email info@coabito.it.",
      alreadyRegisteredError:
        "An account with this email already exists. Try signing in, or use “Forgot password”.",
      networkSmtpError:
        "We couldn't complete sign-up (network or email delivery issue). Try again in a minute; if it persists, email info@coabito.it.",
      genericError: "Something went wrong, please try again.",
      signUpButton: "Sign up",
      signInButton: "Log in",
      alreadyHaveAccount: "Already have an account? Log in",
      noAccount: "Don't have an account? Sign up",
      stepIndicator: "{current} of {total}",
      step1Title: "What's your name?",
      step1Hint: "Tell us who you are and whether you're looking for a room or listing one.",
      step2Title: "How do we reach you?",
      step3Title: "One last step",
      stepContinue: "Continue",
      stepBack: "Back",
      stepNameRequired: "A name is enough to start — even just your first name.",
      stepEmailRequired: "We need a valid email to reach you.",
      stepPasswordRequired: "Password must be at least 6 characters.",
      vestaStep1: "Nice to meet you",
      vestaStep2: "Perfect — almost there",
      vestaStep3:
        "Perfect, {name} — just the consent, then I’ll send your confirmation email.",
      vestaSignupDone:
        "Perfect, {name} — account created. Sign in with email and password, then I’ll be here to talk about your ideal room.",
      vestaNameFallback: "there",
    },
    onboarding: {
      title: "One last step",
      subtitleOwner: "A few more details before you start managing your properties.",
      subtitleStudent: "A few more details before you chat with Vesta.",
      profilePhoto: "Profile photo *",
      phoneNumber: "Phone number *",
      phonePlaceholder: "E.g. +39 333 1234567",
      fiscalCodeOwner: "Tax ID or VAT number *",
      fiscalCodeStudent: "Tax ID code *",
      dateOfBirth: "Date of birth *",
      continueButton: "Continue",
    },
    dashboard: {
      chatTab: "Chat",
      roomsTab: "Rooms",
      loadingChat: "Loading your chat...",
    },
    chat: {
      subtitle: "Your housing assistant · away from home",
      inputPlaceholder: "Write a message...",
      sendLabel: "Send message",
      progressLabel: "{done}/{total} · {step}",
      progressComplete: "Profile complete",
      progressSteps: {
        city: "City",
        university: "University",
        campus: "Campus / course",
        budget: "Budget",
        moveIn: "Move-in date",
        study: "Study habits",
        social: "Social life",
        clean: "Cleanliness",
        extras: "Smoking / pets",
      },
    },
    roomCard: {
      perMonth: "/month",
      plusUtilities: "+ €{utilities} utilities",
      total: "Total: €{total}/month",
      viewListing: "View listing",
      availableFrom: "Available from {date}",
      otherCampus: "Other campus",
    },
    listingsCard: {
      guaranteedRent: "Guaranteed rent",
      verifiedOwner: "Verified landlord",
      photoSoon: "Photo coming soon",
      zoneTbd: "Area TBC",
      seeDetails: "See details",
      discoverFit: "Discover your fit with Vesta",
      share: "Share",
      shareAria: "Share this room",
      shareCopied: "Link copied",
      filterGuaranteed: "Coabito guaranteed rent only",
    },
    listingsFilters: {
      title: "Filters",
      reset: "Reset",
      hide: "Hide filters",
      show: "Show filters",
      collapseAria: "Hide filters panel",
      closeOverlayAria: "Close filters",
      resultCount: "{n} rooms found",
      resultCountOne: "1 room found",
      headCount: "{n} results",
      headCountOne: "1 result",
      emptyTitle: "No rooms match these filters",
      emptyBody:
        "Try widening your search: raise the budget, remove a feature, or reset the filters.",
      emptyCta: "Reset filters",
      pageTitle: "Available rooms",
      budget: "Monthly budget",
      zone: "Area",
      roomType: "Room type",
      size: "Room size (sqm)",
      availability: "Availability",
      contract: "Minimum contract length",
      flatmates: "Flatmates in the home",
      heating: "Heating",
      features: "Features",
      rules: "House rules",
      trust: "Trust",
      all: "All",
      any: "Any",
      zoneTorrette: "Torrette",
      zoneCentro: "Centro",
      zonePalombina: "Palombina",
      zoneTavernelle: "Tavernelle",
      typeSingola: "Single",
      typeDoppia: "Double",
      typeDus: "Double used as single",
      sizeS: "Up to 12",
      sizeM: "12-18",
      sizeL: "18+",
      availNow: "Immediate",
      availSept: "From September",
      months6: "6 months",
      months12: "12 months",
      flatmates3plus: "3+",
      heatAutonomous: "Independent",
      heatCentral: "Central",
      featBathroom: "Private bathroom",
      featFurnished: "Furnished",
      featWasher: "Washing machine",
      featWifi: "Wifi included",
      featBalcony: "Balcony",
      featElevator: "Lift",
      featAc: "Air conditioning",
      featBills: "Bills included",
      rulePets: "Pets allowed",
      ruleSmoking: "Smoking allowed",
      trustGuaranteed: "Coabito guaranteed rent only",
      trustVerified: "Verified landlords only",
      sortLabel: "Sort",
      sortRecommended: "Recommended",
      sortPriceAsc: "Price: low to high",
      sortPriceDesc: "Price: high to low",
      sortNewest: "Newest",
    },
    listingsCompare: {
      selectAria: "Select to compare",
      selectShort: "Compare",
      selectedCount: "{n} rooms selected",
      compareButton: "Compare ({n})",
      clear: "Clear",
      title: "Compare rooms",
      close: "Close",
      rowPrice: "Price",
      rowZone: "Area",
      rowDistance: "Campus distance",
      rowMatch: "Compatibility",
      rowGuaranteed: "Guaranteed rent",
      rowTags: "Atmosphere",
      yes: "Yes",
      no: "No",
      matchUnknown: "—",
      noTags: "—",
      distancePending: "Not calculated yet",
      utilitiesIncludedHint: "utilities TBC",
      needTwo: "Select at least 2 rooms to compare them.",
      maxReached: "max 3",
      bestMatch: "Best match",
    },
    listingsMap: {
      viewLabel: "List or map view",
      viewList: "List",
      viewMap: "Map",
      countOne: "1 room",
      countMany: "{n} rooms",
      styleLabel: "Map style",
      styleStreets: "Standard",
      styleSatellite: "Satellite",
      styleDark: "Dark",
      privacyNote: "Pins show the area, not the exact address.",
      legendGuaranteed: "Guaranteed rent",
      legendMarketplace: "Marketplace",
      closePreview: "Close preview",
      tokenMissingTitle: "Map not configured",
      tokenMissingBody:
        "Add NEXT_PUBLIC_MAPBOX_TOKEN to enable the interactive map. The list view still works.",
    },
    ownerDashboard: {
      widgetEyebrow: "Coabito guaranteed rent",
      nextPayout: "Next payout",
      expectedOn: "Expected on {date}",
      widgetAllOccupied: "Property occupied · No action required",
      widgetMixed: "Some properties under management · No action required",
      widgetSearching: "Looking for a tenant",
      showDetail: "Show per-property detail",
      hideDetail: "Hide detail",
      occupied: "Occupied",
      searchingTenant: "Searching",
      guaranteedBadge: "Guaranteed rent",
      marketplaceBadge: "On the marketplace",
      coabitoHandles: "Coabito handles everything — no management required from you.",
      contactCoabito: "Contact Coabito",
      emptyCandidates:
        "Your listing is visible to compatible students — the first applicants will arrive shortly.",
      manage: "Property details",
      roomAvailable: "Available",
      roomOccupied: "Occupied",
      verifiedStudent: "Verified student",
      message: "Message",
      compatibility: "Compatibility",
      candidatesHeading: "Applicants",
      messagesLink: "In-app messages",
    },
    escrow: {
      title: "Escrow payment",
      notLiveBadge: "Not live yet",
      statusLabel: "Status",
      statusPending: "Pending",
      statusReleased: "Released",
      statusDisputed: "Disputed",
      statusRefunded: "Refunded",
      amountLabel: "Expected amount",
      illustrative: "illustrative",
      studentPendingCopy:
        "Your payment stays safe until you confirm move-in. Real charges are not active yet — we are completing the legal setup.",
      ownerPendingCopy:
        "You will receive the payment once the student confirms arrival. Real charges are not active yet — we are completing the legal setup.",
      confirmMoveInStudent: "I confirm I have moved in",
      confirmMoveInOwner: "I confirm move-in",
      reportIssue: "Report an issue",
      disabledHint: "Available when escrow goes live",
      legalHoldNote:
        "Demo / predisposed only: no Stripe charge until legal clearance and ESCROW_LIVE.",
      marketplaceOnlyNote:
        "Escrow applies only to independent marketplace listings, not Coabito guaranteed-rent stock.",
      optionalPublishNote:
        "Optional and non-blocking: you can publish the listing before finishing Stripe onboarding.",
      coverageLabel: "What it may include",
      coverageFirstMonth: "First month only",
      coverageDeposit: "Deposit only",
      coverageBoth: "First month + deposit",
      breakdownFirstMonth: "First month",
      breakdownDeposit: "Deposit",
    },
    roomList: {
      title: "Recommended rooms for you",
      resultsSuffix: "results sorted by compatibility",
      emptyTitle: "No rooms to show you yet",
      emptySubtitle:
        "Keep chatting with Vesta: once she has your budget, campus and habits, she'll find the most compatible rooms for you.",
      noMatchTitle: "No compatible rooms yet",
      noMatchSubtitle:
        "I've saved your preferences. As soon as a compatible place becomes available, you'll be among the first to know.",
      shareCta: "Share with a friend",
      shareText: "I'm looking for a room with Coabito while studying away from home — join the waitlist:",
      loadingLabel: "Loading compatible rooms…",
    },
    notFound: {
      title: "Page not found",
      body: "This address doesn't exist or has moved. Go back home or join the waitlist.",
      home: "Back to home",
      waitlist: "Waitlist",
    },

    serviziJourney: {
      eyebrow: "Our services",
      title: "We support you at every stage, not just the search",
      intro:
        "Coabito is not a party to the lease: student and landlord sign directly. Our role is trust, matching, and transaction safety.",
      toggleStudent: "I'm a student",
      toggleOwner: "I'm a landlord",
      ctaBody: "Ready to start? Join the waitlist or list a property.",
      ctaStudent: "I'm a student",
      ctaOwner: "I'm a landlord",
      student: {
        phases: [
          {
            title: "Before you apply",
            subtitle: "Verification, trust, cost transparency",
            items: [
              {
                title: "Verified badge",
                body: "Students and landlords verified — not just self-declared.",
              },
              {
                title: "Transparent total cost",
                body: "Rent, utilities and deposit shown together — never discovered later.",
              },
              {
                title: "Portable reputation",
                body: "Your good-tenant history follows you from city to city.",
              },
            ],
          },
          {
            title: "During move-in",
            subtitle: "Safe payment and practical support",
            items: [
              {
                title: "Escrow payment",
                body: "Your payment stays safe until you confirm move-in.",
              },
              {
                title: "Personalised checklist",
                body: "Documents and deadlines generated for your specific case.",
              },
              {
                title: "Assisted utility setup",
                body: "Electricity, gas, internet — we help you activate them without stress.",
              },
            ],
          },
          {
            title: "After you've moved in",
            subtitle: "We don't disappear if something goes wrong",
            items: [
              {
                title: "Direct mediation",
                body: "Issue with the landlord or a roommate? Write to us — you're not alone.",
              },
              {
                title: "Replacement search help",
                body: "If you need to leave the room, we help find someone to take your place.",
              },
              {
                title: "Direct founder contact",
                body: "For any doubt — not a randomly assigned ticket.",
              },
            ],
          },
        ],
      },
      owner: {
        phases: [
          {
            title: "Before you publish",
            subtitle: "Trust and a listing that works for you",
            items: [
              {
                title: "Verified landlord badge",
                body: "Ownership or mandate document verified, visible to students.",
              },
              {
                title: "Vesta-assisted listing",
                body: "Describe the property in chat: Vesta builds a structured listing.",
              },
              {
                title: "Photos and presentation",
                body: "Support to make the property clear and credible at first glance.",
              },
            ],
          },
          {
            title: "During applications",
            subtitle: "Filtered selection and safe payment",
            items: [
              {
                title: "Pre-filtered compatible students",
                body: "Only profiles matching basic criteria, so you spend less time selecting.",
              },
              {
                title: "Escrow payment",
                body: "First month or deposit held until move-in is confirmed.",
              },
              {
                title: "Visible student reputation",
                body: "Good-tenant history shown before direct contact.",
              },
            ],
          },
          {
            title: "After the lease starts",
            subtitle: "Operational support without joining the contract",
            items: [
              {
                title: "Mediation and cover",
                body: "Support channel and, on the roadmap, non-payment cover — without Coabito joining the lease.",
              },
              {
                title: "Replacement search help",
                body: "When a student leaves, we help find the next tenant.",
              },
              {
                title: "Direct founder contact",
                body: "A real person for questions and urgencies — not an anonymous ticket.",
              },
            ],
          },
        ],
      },
    },
    listaAttesa: {
      backToHome: "← Back to home",
      title: "Waitlist",
      eyebrow: "First rooms arrive in {month}",
      titleBefore: "Be among the first to ",
      titleAccent: "find a home",
      titleAfter: "",
      subtitle:
        "Join the waitlist: as soon as a room compatible with you is available, you'll be the first to know.",
      nameLabel: "Full name *",
      emailLabel: "Email",
      emailPlaceholder: "Your email",
      phoneLabel: "Phone / WhatsApp",
      contactHint: "At least one of email or phone is required.",
      facoltaLabel: "Degree course",
      poloLabel: "University campus",
      budgetLabel: "Maximum budget (€/month)",
      privacyPrefix: "I have read and accept the",
      privacyLightPrefix: "By joining you accept the",
      privacyLightSuffix: ".",
      privacyLink: "Privacy Policy",
      privacyRequired: "You must accept the Privacy Policy to sign up.",
      submit: "Join for free",
      submitting: "Submitting...",
      trustItems: ["Always free", "Zero spam", "Unsubscribe anytime"] as const,
      comingSoonLabel: "Coming soon",
      subtitleCity:
        "Coabito is coming to {city} ({status}). Join the waitlist and we'll notify you when we open there.",
      statVacantHomes: "Vacant homes in Italy",
      statStudentsQualitative: "Thousands of students living away from home across Italy",
      statLaunch: "First rooms available",
      statFees: "Fees",
      statFeesValue: "€0",
      successTitle: "You're on the list!",
      successBody:
        "We'll notify you as soon as a compatible place becomes available. In the meantime, feel free to share the link with friends looking for a room while studying away from home.",
      positionHeadline: "You're #{n} on the waitlist",
      successBodyWithPosition:
        "We'll let you know as soon as a room compatible with your profile becomes available.",
      pendingTitle: "Check your email",
      pendingBody:
        "We've sent you a confirmation link. Click it within 7 days to activate your signup — we'll only notify you about compatible rooms after that, and that's when you'll see your waitlist position.",
      confirm: {
        successTitle: "Signup confirmed",
        successBody:
          "You're on the waitlist. We'll let you know as soon as something compatible becomes available.",
        alreadyTitle: "Already confirmed",
        alreadyBody: "Your signup was already active. Nothing else to do.",
        expiredTitle: "Link expired",
        expiredBody:
          "This confirmation link is no longer valid. Join the waitlist again to get a new email.",
        invalidTitle: "Invalid link",
        invalidBody:
          "We couldn't confirm this signup. Check the link in your email or join the waitlist again.",
      },
      errorGeneric: "Something went wrong. Please try again, or email us at info@coabito.it.",
      contactRequired: "Please enter at least an email or a phone number.",
      referral: {
        title: "Invite a friend",
        body: "Share your link — you'll be notified earlier when the first rooms arrive.",
        copy: "Copy link",
        copied: "Copied!",
        copyFallback: "Copy this link:",
        whatsapp: "WhatsApp",
        whatsappAria: "Share your invite link on WhatsApp",
        shareText:
          "I'm looking for a room with Coabito while studying away from home — join the waitlist with my link:",
      },
      facoltaOptions: [
        { value: "ingegneria_informatica", label: "Computer Engineering" },
        { value: "ingegneria_civile", label: "Civil Engineering" },
        { value: "medicina", label: "Medicine" },
        { value: "economia", label: "Economics" },
        { value: "giurisprudenza", label: "Law" },
        { value: "agraria", label: "Agricultural Sciences" },
        { value: "scienze", label: "Sciences" },
        { value: "design", label: "Design" },
        { value: "altro", label: "Other" },
      ],
      poloOptions: [
        { value: "monte_dago", label: "Monte Dago / Tavernelle" },
        { value: "torrette", label: "Torrette" },
        { value: "centro_economia_giurisprudenza", label: "Centro / Villarey" },
        { value: "altro", label: "Other" },
      ],
    },
    myHomeCard: {
      title: "🏠 My home",
      statusPending: "Awaiting confirmation",
      statusPaid: "Paid this month ✓",
      statusLate: "Overdue",
      rent: "Rent",
      utilities: "Est. utilities",
      totalPerMonth: "Total/month",
      tenantSince: "Tenant since {date}",
      checklistTitle: "📋 Your move-in checklist",
    },
    myPayments: {
      title: "My payments",
      nextPayment: "Next payment",
      dueBy: "Due {date}",
      payNow: "Pay now",
      paying: "Redirecting…",
      payError: "Something went wrong. Please try again or contact us.",
      stripeSoon:
        "Online payments will be available soon — in the meantime contact us for how to pay.",
      whatsappCta: "Message us on WhatsApp",
      whatsappMessage:
        "Hi! I'm a Coabito student and I'd like to know how to pay this month's rent.",
      history: "History",
      historyEmpty: "No payments recorded yet.",
      receipt: "Receipt",
      statusPaid: "Paid",
      statusDue: "Due soon",
      statusLate: "Overdue",
      statusFailed: "Failed",
    },
    esempi: {
      backToHome: "← Back to home",
      title: "How it works, in practice",
      subtitle:
        "Two concrete examples of what you see on the platform. No real data — just to show you the tone and the kind of result you get.",
      conversationTitle: "A conversation with Vesta",
      conversationSubtitle:
        "Just a couple of minutes of chat, in a normal tone — like texting a friend, not filling out a form.",
      scoreTitle: "How we read compatibility",
      scoreSubtitle:
        "Every room shows a score and the reason behind it — not just price and square meters.",
      howToReadTitle: "How to read the score",
      scoreHigh: "85-100%:",
      scoreHighDetail: "high compatibility — budget, hours and habits align well",
      scoreMed: "65-84%:",
      scoreMedDetail: "medium compatibility — worth a look, with some trade-offs",
      scoreLow: "Below 65%:",
      scoreLowDetail:
        "still a valid option, just less aligned with your preferences — never a mistake",
      tryItYourself: "Try it yourself →",
    },
    resetPassword: {
      title: "New password",
      subtitle: "Choose a new one for your account.",
      success: "✓ Password updated! Taking you in...",
      verifying:
        "Verifying the link... If this screen stays here, the link may have expired: go back to",
      loginLink: "login",
      andRequestNew: "and request a new one.",
      newPasswordPlaceholder: "New password (at least 6 characters)",
      repeatPasswordPlaceholder: "Repeat the new password",
      tooShort: "Password must be at least 6 characters.",
      mismatch: "The two passwords don't match.",
      invalidToken: "This link is no longer valid. Request a new one from login.",
      saveButton: "Save new password",
    },
    installa: {
      backToHome: "← Back to home",
      title: "Install Coabito on your phone",
      subtitle:
        "No App Store needed: just four taps to get a real icon on your Home screen that opens full-screen like an app.",
      iphoneTab: "iPhone",
      androidTab: "Android",
      note: "Good to know: the site works exactly the same without installing — this step only adds a handy icon, it doesn't change how Coabito works.",
      iosSteps: [
        {
          title: "Open Coabito in Safari",
          body: "Go to coabito.it as you normally would.",
        },
        {
          title: "Tap the share icon",
          body: "At the bottom, the square with an arrow pointing up.",
        },
        {
          title: "Tap “Add to Home Screen”",
          body: "You'll find it by scrolling the list that appears.",
        },
        {
          title: "Done! The icon is on your Home screen",
          body: "From now on you can open Coabito like a real app.",
        },
      ],
      androidSteps: [
        {
          title: "Open Coabito in Chrome",
          body: "Go to coabito.it as you normally would.",
        },
        {
          title: "Tap the three dots at the top",
          body: "Top right, the menu with three vertical dots.",
        },
        {
          title: "Tap “Install app”",
          body: "If you don't see it, look for “Add to Home screen”.",
        },
        {
          title: "Done! The icon is on your Home screen",
          body: "From now on you can open Coabito like a real app.",
        },
      ],
    },
  },
} as const;
