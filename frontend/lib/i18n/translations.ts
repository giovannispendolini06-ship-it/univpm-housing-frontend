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
    founderNote: {
      quote:
        "Anche io ho cercato casa ad Ancona da studente, senza sapere nulla delle persone con cui avrei convissuto. Coabito è il servizio che avrei voluto avere io, il primo anno.",
      attribution: "— Giovanni, fondatore di Coabito",
    },
    faq: {
      eyebrow: "Domande frequenti",
      title: "I dubbi più comuni, risolti subito",
      seeAll: "Tutte le FAQ per studenti",
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
        "Ciao! Ho un immobile ad Ancona e vorrei saperne di più su Coabito.",
      waitlist:
        "Ciao! Sto cercando casa da studente ad Ancona e vorrei info su Coabito / la lista d'attesa.",
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
      fullNamePlaceholder: "Nome",
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
      step1Hint: "Solo il nome basta. Cognome e altri dati li aggiungi dopo nel profilo.",
      step2Title: "Email e password",
      step3Title: "Privacy e termini",
      stepContinue: "Continua",
      stepBack: "Indietro",
      stepNameRequired: "Un nome basta per iniziare — anche solo il tuo.",
      stepEmailRequired: "Serve un'email valida per scriverti.",
      stepPasswordRequired: "La password deve avere almeno 6 caratteri.",
      vestaStep1: "Piacere di conoscerti",
      vestaStep2: "Perfetto, ci siamo quasi",
      vestaStep3:
        "Perfetto, {name} — manca solo il consenso privacy, poi entri subito.",
      vestaSignupDone:
        "Perfetto, {name} — account creato. Accedi con email e password, poi ti aspetto per parlare della tua stanza ideale.",
      vestaNameFallback: "ciao",
    },
    onboarding: {
      title: "Arricchisci il profilo",
      subtitleOwner:
        "Opzionale: puoi saltare e completare questi dati più tardi nel profilo.",
      subtitleStudent:
        "Opzionale: puoi saltare e parlare subito con Vesta. I dettagli li aggiungi dopo.",
      optionalBanner:
        "Niente di obbligatorio ora. Codice fiscale, foto e preferenze li puoi completare nel profilo o con Vesta.",
      profilePhoto: "Foto profilo",
      phoneNumber: "Numero di telefono",
      phonePlaceholder: "Es. +39 333 1234567",
      fiscalCodeOwner: "Codice fiscale o P.IVA",
      fiscalCodeStudent: "Codice fiscale",
      dateOfBirth: "Data di nascita",
      continueButton: "Salva e continua",
      skipForNow: "Salta per ora — vai alla chat",
      stepOf: "Passaggio {step} di {total}",
      stepProfile: "Profilo",
      stepPrefs: "Preferenze casa",
      continuePrefs: "Continua — preferenze",
      prefsViaVestaHint:
        "Queste preferenze le puoi anche raccontare a Vesta in chat. Compilarle qui è solo un anticipo.",
      budgetMax: "Budget max mensile (€, utenze escluse)",
      moveInDate: "Data ingresso preferita",
      campus: "Polo / campus",
      selectPlaceholder: "Seleziona",
      cleanliness: "Livello di ordine (1 = rilassato, 5 = molto ordinato)",
      noSmoke: "Non fumo",
      yesSmoke: "Fumo",
      tolerateSmokers: "Tollero chi fuma in casa",
      noSmokeHome: "Preferisco casa no-smoke",
      noPets: "Non ho animali",
      hasPets: "Ho / vorrei animali",
      backToProfile: "← Torna al profilo",
      photoRequired: "La foto profilo è obbligatoria se completi questo passaggio.",
      phoneRequired: "Il numero di telefono è obbligatorio se completi questo passaggio.",
      fiscalRequired: "Il codice fiscale è obbligatorio se completi questo passaggio.",
      dobRequired: "La data di nascita è obbligatoria se completi questo passaggio.",
    },
    dashboard: {
      chatTab: "Chat",
      roomsTab: "Stanze",
      loadingChat: "Sto ritrovando la tua chat...",
    },
    studentHome: {
      eyebrow: "La tua ricerca",
      greeting: "Ciao, {name}",
      subtitle: "Profilo, Vesta e le stanze più adatte a te — tutto in un posto.",
      profileHint: "Aggiungi i dettagli quando ti servono: più completo, più sicuro in candidatura.",
      profileDone: "Profilo completo. Puoi sempre aggiornarlo.",
      completeProfile: "Completa profilo",
      viewProfile: "Vedi profilo",
      vestaTitle: "Vesta",
      vestaStart: "Racconta a Vesta facoltà, budget e abitudini: troverà le stanze compatibili.",
      vestaMatches: "{n} stanze compatibili con il tuo profilo.",
      vestaNoMatches: "Preferenze salvate: ti avvisiamo appena arriva qualcosa di compatibile.",
      vestaProgress: "Profilo chat {done}/{total}",
      vestaCta: "Parla con Vesta",
      vestaResume: "Continua la chat",
      recommendedTitle: "Consigliate per te",
      recommendedSubtitle: "Le tre migliori match dalla chat con Vesta.",
      recommendedEmpty: "Ancora nessuna stanza consigliata",
      recommendedEmptyHint: "Completa qualche preferenza con Vesta per vedere le proposte.",
      seeAll: "Vedi tutte",
      appsTitle: "Le tue candidature",
      appsSubtitle: "Stato delle richieste alle stanze.",
      appsEmpty: "Nessuna candidatura ancora.",
      browseRooms: "Sfoglia le stanze",
      openListing: "Apri",
      savedTitle: "Stanze salvate",
      savedSubtitle: "Le trovi qui sul dispositivo — usa il segnalibro sulle card.",
      savedEmpty: "Nessuna stanza salvata. Tocca il segnalibro su una card per aggiungerla.",
      saveAria: "Salva stanza",
      unsaveAria: "Rimuovi dai salvati",
    },
    profile: {
      title: "Il tuo profilo",
      subtitle: "Completa i dati quando ti serve — non tutto subito.",
      completionAria: "Completamento profilo: {n} percento",
      completionLabel: "Profilo al {n}%",
      completionMeta: "{filled}/{total} campi utili compilati",
      firstName: "Nome",
      lastName: "Cognome",
      phone: "Telefono",
      dateOfBirth: "Data di nascita",
      placeOfBirth: "Luogo di nascita",
      sex: "Sesso",
      sexUnset: "Non indicato",
      sexF: "Donna",
      sexM: "Uomo",
      sexX: "Altro",
      sexPreferNot: "Preferisco non dirlo",
      sexHint: "Serve solo se vorrai calcolare il codice fiscale in candidatura.",
      guarantor: "Hai un garante disponibile?",
      guarantorYes: "Sì",
      guarantorNo: "No",
      guarantorUnset: "Non ancora",
      fiscalOptional: "Codice fiscale (opzionale ora)",
      fiscalHint: "Obbligatorio solo quando candidi a una stanza.",
      fiscalOwner: "Codice fiscale o P.IVA",
      companyName: "Ragione sociale (se società)",
      companyPlaceholder: "Es. Immobiliare Rossi Srl",
      iban: "IBAN per ricevere il canone",
      ibanHint: "Lo usiamo solo per i pagamenti quando saranno attivi.",
      avatarLabel: "Foto profilo",
      avatarHint: "Opzionale, max 5 MB.",
      save: "Salva profilo",
      saved: "Profilo aggiornato.",
      lifestyleTitle: "Preferenze casa (da Vesta)",
      lifestyleHint: "Solo lettura. Per aggiornarle, continua la chat — niente doppio form.",
      lifestyleEmpty: "Ancora nessuna preferenza salvata. Chatta con Vesta per iniziare.",
      budget: "Budget max",
      moveIn: "Ingresso preferito",
      campus: "Polo",
      cleanliness: "Ordine (1–5)",
      social: "Vita sociale",
      smokePets: "Fumo / animali",
      smokes: "Fumo",
      noSmoke: "Non fumo",
      petsYes: "Animali sì",
      petsNo: "No animali",
      openVesta: "Apri Vesta →",
      ownerDocHint:
        "Per il badge proprietario: dopo la richiesta, un admin chiederà il documento di proprietà o delega.",
      backHome: "← Area personale",
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
          "Sto cercando una stanza ad Ancona con Coabito — entra in lista d'attesa con il mio link:",
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
    founderNote: {
      quote:
        "I also searched for a room in Ancona as a student, without knowing anything about the people I'd end up living with. Coabito is the service I wish I'd had, my first year.",
      attribution: "— Giovanni, founder of Coabito",
    },
    faq: {
      eyebrow: "Frequently asked questions",
      title: "The most common doubts, answered right away",
      seeAll: "All student FAQs",
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
        "Hi! I have a property in Ancona and I'd like to know more about Coabito.",
      waitlist:
        "Hi! I'm a student looking for a place in Ancona and I'd like info about Coabito / the waitlist.",
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
      fullNamePlaceholder: "First name",
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
      step1Hint: "First name is enough. Surname and other details come later in your profile.",
      step2Title: "Email and password",
      step3Title: "Privacy and terms",
      stepContinue: "Continue",
      stepBack: "Back",
      stepNameRequired: "A name is enough to start — even just your first name.",
      stepEmailRequired: "We need a valid email to reach you.",
      stepPasswordRequired: "Password must be at least 6 characters.",
      vestaStep1: "Nice to meet you",
      vestaStep2: "Perfect — almost there",
      vestaStep3:
        "Perfect, {name} — just the privacy consent, then you’re in.",
      vestaSignupDone:
        "Perfect, {name} — account created. Sign in with email and password, then I’ll be here to talk about your ideal room.",
      vestaNameFallback: "there",
    },
    onboarding: {
      title: "Enrich your profile",
      subtitleOwner:
        "Optional: you can skip and complete these details later in your profile.",
      subtitleStudent:
        "Optional: skip and chat with Vesta now. Add details later.",
      optionalBanner:
        "Nothing required now. Tax ID, photo and preferences can wait for your profile or Vesta.",
      profilePhoto: "Profile photo",
      phoneNumber: "Phone number",
      phonePlaceholder: "E.g. +39 333 1234567",
      fiscalCodeOwner: "Tax ID or VAT number",
      fiscalCodeStudent: "Tax ID code",
      dateOfBirth: "Date of birth",
      continueButton: "Save and continue",
      skipForNow: "Skip for now — go to chat",
      stepOf: "Step {step} of {total}",
      stepProfile: "Profile",
      stepPrefs: "Home preferences",
      continuePrefs: "Continue — preferences",
      prefsViaVestaHint:
        "You can also tell Vesta these preferences in chat. Filling them here is optional.",
      budgetMax: "Max monthly budget (€, utilities excluded)",
      moveInDate: "Preferred move-in date",
      campus: "Campus / polo",
      selectPlaceholder: "Select",
      cleanliness: "Tidiness level (1 = relaxed, 5 = very tidy)",
      noSmoke: "I don't smoke",
      yesSmoke: "I smoke",
      tolerateSmokers: "I'm fine with smokers at home",
      noSmokeHome: "I prefer a no-smoke home",
      noPets: "No pets",
      hasPets: "I have / would like pets",
      backToProfile: "← Back to profile",
      photoRequired: "Profile photo is required if you complete this step.",
      phoneRequired: "Phone number is required if you complete this step.",
      fiscalRequired: "Tax ID is required if you complete this step.",
      dobRequired: "Date of birth is required if you complete this step.",
    },
    dashboard: {
      chatTab: "Chat",
      roomsTab: "Rooms",
      loadingChat: "Loading your chat...",
    },
    studentHome: {
      eyebrow: "Your search",
      greeting: "Hi, {name}",
      subtitle: "Profile, Vesta and your best-fit rooms — in one place.",
      profileHint: "Add details when you need them: a fuller profile helps at application time.",
      profileDone: "Profile complete. You can update it anytime.",
      completeProfile: "Complete profile",
      viewProfile: "View profile",
      vestaTitle: "Vesta",
      vestaStart: "Tell Vesta your course, budget and habits — she'll find compatible rooms.",
      vestaMatches: "{n} rooms compatible with your profile.",
      vestaNoMatches: "Preferences saved: we'll notify you when something compatible appears.",
      vestaProgress: "Chat profile {done}/{total}",
      vestaCta: "Chat with Vesta",
      vestaResume: "Resume chat",
      recommendedTitle: "Recommended for you",
      recommendedSubtitle: "Top three matches from your chat with Vesta.",
      recommendedEmpty: "No recommended rooms yet",
      recommendedEmptyHint: "Share a few preferences with Vesta to see suggestions.",
      seeAll: "See all",
      appsTitle: "Your applications",
      appsSubtitle: "Status of your room requests.",
      appsEmpty: "No applications yet.",
      browseRooms: "Browse rooms",
      openListing: "Open",
      savedTitle: "Saved rooms",
      savedSubtitle: "Stored on this device — use the bookmark on cards.",
      savedEmpty: "No saved rooms. Tap the bookmark on a card to add one.",
      saveAria: "Save room",
      unsaveAria: "Remove from saved",
    },
    profile: {
      title: "Your profile",
      subtitle: "Add details when you need them — not all at once.",
      completionAria: "Profile completion: {n} percent",
      completionLabel: "Profile {n}%",
      completionMeta: "{filled}/{total} useful fields filled",
      firstName: "First name",
      lastName: "Last name",
      phone: "Phone",
      dateOfBirth: "Date of birth",
      placeOfBirth: "Place of birth",
      sex: "Sex",
      sexUnset: "Not set",
      sexF: "Female",
      sexM: "Male",
      sexX: "Other",
      sexPreferNot: "Prefer not to say",
      sexHint: "Only needed if you later compute your tax ID for an application.",
      guarantor: "Do you have a guarantor available?",
      guarantorYes: "Yes",
      guarantorNo: "No",
      guarantorUnset: "Not yet",
      fiscalOptional: "Tax ID (optional for now)",
      fiscalHint: "Required only when you apply to a room.",
      fiscalOwner: "Tax ID or VAT number",
      companyName: "Company name (if applicable)",
      companyPlaceholder: "E.g. Rossi Properties Ltd",
      iban: "IBAN to receive rent",
      ibanHint: "Used only for payouts once payments go live.",
      avatarLabel: "Profile photo",
      avatarHint: "Optional, max 5 MB.",
      save: "Save profile",
      saved: "Profile updated.",
      lifestyleTitle: "Home preferences (from Vesta)",
      lifestyleHint: "Read-only. Update them in chat — no duplicate form.",
      lifestyleEmpty: "No preferences saved yet. Chat with Vesta to start.",
      budget: "Max budget",
      moveIn: "Preferred move-in",
      campus: "Campus",
      cleanliness: "Tidiness (1–5)",
      social: "Social life",
      smokePets: "Smoking / pets",
      smokes: "I smoke",
      noSmoke: "I don't smoke",
      petsYes: "Pets yes",
      petsNo: "No pets",
      openVesta: "Open Vesta →",
      ownerDocHint:
        "For the verified owner badge: after you request it, an admin will ask for a ownership/delegation document.",
      backHome: "← Your area",
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
          "I'm looking for a room in Ancona with Coabito — join the waitlist with my link:",
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
