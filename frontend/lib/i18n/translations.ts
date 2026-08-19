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
      badge: "Pensato per chi studia fuori sede ad Ancona",
      titlePart1: "La casa giusta. ",
      titleHighlight: "Le persone",
      titlePart2: " giuste.",
      subtitle:
        "Marketplace abitativo per fuori sede ad Ancona: stanze trasparenti, profili verificabili e Compatibilità Coabito — per trovare stanza e coinquilini giusti, non solo un annuncio.",
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
    founderNote: {
      quote:
        "Anche io ho cercato casa ad Ancona da studente, senza sapere nulla delle persone con cui avrei convissuto. Coabito è il servizio che avrei voluto avere io, il primo anno.",
      attribution: "— Giovanni, fondatore di Coabito",
    },
    faq: {
      eyebrow: "Domande frequenti",
      title: "I dubbi più comuni, risolti subito",
      items: [
        {
          question: "È davvero gratis per gli studenti?",
          answer:
            "Sì. Chattare con Vesta e vedere le stanze proposte è sempre gratuito, nessuna carta di credito richiesta. Paghi solo il canone della stanza che scegli, come faresti comunque affittando da chiunque altro.",
        },
        {
          question: "Come guadagna Coabito?",
          answer:
            "Siamo un marketplace: il contratto di locazione resta diretto tra studente e proprietario. Guadagniamo da servizi a valore aggiunto (verifica, escrow, garanzie opzionali, supporti al trasloco e partnership), non entrando come parte del contratto.",
        },
        {
          question: "Devo pagare qualcosa prima di trovare la stanza giusta?",
          answer:
            "No, mai. Non c'è nessun costo di iscrizione o di ricerca: paghi solo quando decidi davvero di prendere una stanza specifica.",
        },
        {
          question: "Chi si occupa del contratto?",
          answer:
            "Il contratto di locazione lo firmi direttamente con il proprietario. Coabito facilita matching e contatto, e può offrire strumenti di fiducia (verifica, escrow, mediazione) senza essere parte del contratto.",
        },
        {
          question: "Come funziona il punteggio di compatibilità?",
          answer:
            'Vesta confronta budget, orari di studio, abitudini di convivenza e vicinanza al tuo polo universitario — non solo prezzo e metri quadri. Puoi vedere un esempio vero nella pagina "Come funziona".',
        },
        {
          question: "I miei dati sono al sicuro?",
          answer:
            "Sì, trattiamo i tuoi dati secondo il GDPR. Puoi leggere tutti i dettagli nella nostra Privacy Policy, e puoi eliminare il tuo account in qualsiasi momento, direttamente dalla tua area personale.",
        },
        {
          question: "Sono un proprietario: devo pagare per proporre il mio immobile?",
          answer:
            "No, proporre il tuo immobile è gratuito. Ti mostriamo studenti compatibili (e, appena disponibili, verificati): tu decidi con chi firmare direttamente. Servizi opzionali come garanzia contro inadempimento o escrow arriveranno a pagamento, senza farci entrare nel contratto.",
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
      services: "Servizi",
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
        "Vercel Analytics: ci aiuta a capire quali pagine vengono visitate, in forma aggregata e anonima. Non usiamo Google Analytics né pubblicità.",
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
        "✓ Controlla la tua casella email — ti abbiamo mandato un link per scegliere una nuova password. Se non lo vedi, guarda anche nello spam.",
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
      genericError: "Qualcosa è andato storto, riprova.",
      signUpButton: "Registrati",
      signInButton: "Accedi",
      alreadyHaveAccount: "Hai già un account? Accedi",
      noAccount: "Non hai un account? Registrati",
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
      subtitle: "Il tuo assistente casa · UNIVPM Ancona",
      inputPlaceholder: "Scrivi un messaggio...",
      sendLabel: "Invia messaggio",
      progressLabel: "{done}/{total} · {step}",
      progressComplete: "Profilo completo",
      progressSteps: {
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
      shareText: "Sto cercando casa ad Ancona con Coabito — entra in lista d'attesa:",
      loadingLabel: "Caricamento stanze compatibili…",
    },
    notFound: {
      title: "Pagina non trovata",
      body: "Questo indirizzo non esiste o è stato spostato. Torna alla home oppure entra in lista d'attesa.",
      home: "Torna alla home",
      waitlist: "Lista d'attesa",
    },
    listaAttesa: {
      backToHome: "← Torna alla home",
      title: "Lista d'attesa",
      subtitle:
        "Non c'è ancora la stanza giusta per te? Lasciaci i tuoi dati: ti avvisiamo appena arriva qualcosa di compatibile.",
      nameLabel: "Nome e cognome *",
      emailLabel: "Email",
      phoneLabel: "Telefono / WhatsApp",
      contactHint: "Almeno uno tra email e telefono è obbligatorio.",
      facoltaLabel: "Facoltà",
      poloLabel: "Polo universitario",
      budgetLabel: "Budget massimo (€/mese)",
      privacyPrefix: "Ho letto e accetto la",
      privacyLink: "Privacy Policy",
      privacyRequired: "Devi accettare la Privacy Policy per iscriverti.",
      submit: "Entra in lista d'attesa",
      submitting: "Invio...",
      successTitle: "Sei in lista!",
      successBody:
        "Ti avviseremo appena arriva un immobile compatibile con le tue preferenze. Nel frattempo, puoi condividere il link con chi cerca casa ad Ancona.",
      pendingTitle: "Controlla la tua email",
      pendingBody:
        "Ti abbiamo inviato un link di conferma. Cliccalo entro 7 giorni per attivare l'iscrizione: solo dopo potremo avvisarti quando arriva una stanza compatibile.",
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
      badge: "Made for out-of-town students in Ancona",
      titlePart1: "The right home. ",
      titleHighlight: "The right",
      titlePart2: " people.",
      subtitle:
        "Housing marketplace for students in Ancona: transparent rooms, verifiable profiles and Coabito Compatibility — find the right room and roommates, not just another listing.",
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
    founderNote: {
      quote:
        "I also searched for a room in Ancona as a student, without knowing anything about the people I'd end up living with. Coabito is the service I wish I'd had, my first year.",
      attribution: "— Giovanni, founder of Coabito",
    },
    faq: {
      eyebrow: "Frequently asked questions",
      title: "The most common doubts, answered right away",
      items: [
        {
          question: "Is it really free for students?",
          answer:
            "Yes. Chatting with Vesta and seeing the suggested rooms is always free, no credit card required. You only pay the rent for the room you choose, just like renting from anyone else.",
        },
        {
          question: "How does Coabito make money?",
          answer:
            "We're a marketplace: the lease stays direct between student and owner. We earn from value-added services (verification, escrow, optional guarantees, move-in support and partnerships), without becoming a party to the contract.",
        },
        {
          question: "Do I have to pay anything before finding the right room?",
          answer:
            "No, never. There's no sign-up or search fee: you only pay once you actually decide to take a specific room.",
        },
        {
          question: "Who handles the contract?",
          answer:
            "You sign the lease directly with the property owner. Coabito facilitates matching and contact, and may offer trust tools (verification, escrow, mediation) without being a party to the contract.",
        },
        {
          question: "How does the compatibility score work?",
          answer:
            'Vesta compares budget, study hours, living habits and distance from your university campus — not just price and square meters. You can see a real example on the "How it works" page.',
        },
        {
          question: "Is my data safe?",
          answer:
            "Yes, we handle your data according to GDPR. You can read all the details in our Privacy Policy, and you can delete your account at any time, directly from your personal area.",
        },
        {
          question: "I'm a property owner: do I have to pay to list my property?",
          answer:
            "No, listing your property is free. We show you compatible students (and, as soon as available, verified ones): you decide who to sign with directly. Optional services like non-payment cover or escrow will be paid add-ons — without us entering the lease.",
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
      services: "Services",
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
        "Vercel Analytics: helps us understand which pages are visited, in aggregate and anonymous form. We do not use Google Analytics or ads.",
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
        "✓ Check your inbox — we've sent you a link to choose a new password. If you don't see it, check your spam folder too.",
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
      genericError: "Something went wrong, please try again.",
      signUpButton: "Sign up",
      signInButton: "Log in",
      alreadyHaveAccount: "Already have an account? Log in",
      noAccount: "Don't have an account? Sign up",
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
      subtitle: "Your housing assistant · UNIVPM Ancona",
      inputPlaceholder: "Write a message...",
      sendLabel: "Send message",
      progressLabel: "{done}/{total} · {step}",
      progressComplete: "Profile complete",
      progressSteps: {
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
      shareText: "I'm looking for a room in Ancona with Coabito — join the waitlist:",
      loadingLabel: "Loading compatible rooms…",
    },
    notFound: {
      title: "Page not found",
      body: "This address doesn't exist or has moved. Go back home or join the waitlist.",
      home: "Back to home",
      waitlist: "Waitlist",
    },
    listaAttesa: {
      backToHome: "← Back to home",
      title: "Waitlist",
      subtitle:
        "Haven't found the right room yet? Leave your details and we'll notify you as soon as something compatible comes up.",
      nameLabel: "Full name *",
      emailLabel: "Email",
      phoneLabel: "Phone / WhatsApp",
      contactHint: "At least one of email or phone is required.",
      facoltaLabel: "Degree course",
      poloLabel: "University campus",
      budgetLabel: "Maximum budget (€/month)",
      privacyPrefix: "I have read and accept the",
      privacyLink: "Privacy Policy",
      privacyRequired: "You must accept the Privacy Policy to sign up.",
      submit: "Join the waitlist",
      submitting: "Submitting...",
      successTitle: "You're on the list!",
      successBody:
        "We'll notify you as soon as a compatible place becomes available. In the meantime, feel free to share the link with friends looking for a room in Ancona.",
      pendingTitle: "Check your email",
      pendingBody:
        "We've sent you a confirmation link. Click it within 7 days to activate your signup — we'll only notify you about compatible rooms after that.",
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
