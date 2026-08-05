export type Locale = "it" | "en";

export const translations = {
  it: {
    nav: {
      forStudents: "Per gli studenti",
      forOwners: "Per i proprietari",
      howItWorks: "Come funziona",
      installApp: "Installa l'app",
      login: "Accedi",
    },
    hero: {
      badge: "🎓 Pensato per chi studia fuori sede",
      titlePart1: "Trova casa ",
      titleHighlight: "chattando",
      titlePart2: ", non scorrendo annunci a caso.",
      subtitle:
        "Racconta a Vesta la tua facoltà, il tuo budget e le tue abitudini di convivenza. Ti proponiamo solo le stanze davvero compatibili con te, vicino al tuo ateneo.",
      ctaStudent: "Sono uno studente →",
      ctaOwner: "Sono un proprietario",
      freeNote: "Gratis per gli studenti. Nessuna carta di credito richiesta.",
      seeExample: "Vedi un esempio",
      liveCompatibility: "Compatibilità calcolata in tempo reale",
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
      title: "Affitta senza gestire tu le trattative",
      ctaLabel: "Proponi il tuo immobile",
      steps: [
        {
          number: "1",
          title: "Ci mandi l'immobile",
          description:
            "Indirizzo, prezzo, foto: lo carichiamo noi sul tuo profilo e lo pubblichiamo anche sui portali principali.",
        },
        {
          number: "2",
          title: "Filtriamo noi gli interessati",
          description:
            "Solo studenti già verificati e compatibili con la tua casa arrivano fino a te: niente perditempo.",
        },
        {
          number: "3",
          title: "Tu decidi, noi gestiamo il resto",
          description:
            "Ti aggiorniamo su ogni richiesta seria. Chiudi l'affitto quando sei pronto, ai tuoi tempi.",
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
            "Applichiamo un piccolo margine tra quello che paga lo studente e quello che versiamo al proprietario — lo stesso modello di chi gestisce affitti per conto terzi, reso più semplice e veloce grazie alla chat.",
        },
        {
          question: "Devo pagare qualcosa prima di trovare la stanza giusta?",
          answer:
            "No, mai. Non c'è nessun costo di iscrizione o di ricerca: paghi solo quando decidi davvero di prendere una stanza specifica.",
        },
        {
          question: "Chi si occupa del contratto?",
          answer:
            "Ce ne occupiamo noi: gestiamo il rapporto con il proprietario, tu firmi solo il contratto per la tua stanza, senza dover trattare direttamente ogni dettaglio.",
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
            "No, proporre il tuo immobile è gratuito. Ci pensiamo noi a trovare studenti compatibili e verificati: tu decidi solo con chi firmare, quando sei pronto.",
        },
      ],
    },
    footer: {
      tagline:
        "Piattaforma indipendente per studenti fuori sede e proprietari di casa. Non affiliata a nessuna università.",
      rights: "Tutti i diritti riservati.",
      privacy: "Privacy",
      terms: "Termini di servizio",
    },
    common: {
      loading: "Un attimo...",
      backToHome: "← Torna alla home",
      admin: "Admin",
      signOut: "Esci",
      genericError: "Qualcosa è andato storto, riprova.",
      deleteAccount: {
        buttonLabel: "Elimina il mio account",
        deletingLabel: "Eliminazione...",
        warningStudent:
          "Eliminare definitivamente il tuo account? Tutti i tuoi dati (chat con Vesta, profilo) verranno cancellati. L'azione non si può annullare.",
        warningOwner:
          "Eliminare definitivamente il tuo account? Verranno eliminati anche TUTTI i tuoi immobili e i relativi dati. L'azione non si può annullare.",
        confirmAgain: "Sei sicuro? Non potrai recuperare l'account dopo.",
      },
    },
    login: {
      signInTitle: "Bentornato",
      signInSubtitle: "Accedi per continuare",
      signUpTitle: "Crea il tuo account",
      signUpSubtitle: "Per parlare con Vesta e vedere le stanze consigliate",
      roleStudent: "Sono studente",
      roleOwner: "Sono proprietario",
      fullNamePlaceholder: "Nome e cognome",
      emailPlaceholder: "Email",
      passwordPlaceholder: "Password (minimo 6 caratteri)",
      forgotPassword: "Password dimenticata?",
      consentPrefix: "Ho letto e accetto la",
      consentAnd: "e i",
      consentSuffix: ".",
      signInButton: "Accedi",
      signUpButton: "Registrati",
      switchToSignIn: "Hai già un account? Accedi",
      switchToSignUp: "Non hai un account? Registrati",
      consentRequired: "Devi accettare Privacy e Termini di servizio per registrarti.",
      forgotTitle: "Password dimenticata",
      forgotSubtitle: "Ti mandiamo un link per reimpostarla.",
      forgotEmailPlaceholder: "Email con cui ti sei registrato",
      forgotSubmit: "Invia link di reset",
      forgotSent:
        "✓ Controlla la tua casella email — ti abbiamo mandato un link per scegliere una nuova password. Se non lo vedi, guarda anche nello spam.",
      backToLogin: "← Torna al login",
    },
    onboarding: {
      title: "Ultimo passaggio",
      subtitleStudent: "Qualche dato in più prima di parlare con Vesta.",
      subtitleOwner: "Qualche dato in più prima di iniziare a gestire i tuoi immobili.",
      avatarLabel: "Foto profilo *",
      avatarPreviewAlt: "Anteprima foto profilo",
      phoneLabel: "Numero di telefono *",
      phonePlaceholder: "Es. +39 333 1234567",
      fiscalCodeStudent: "Codice fiscale *",
      fiscalCodeOwner: "Codice fiscale o P.IVA *",
      dateOfBirthLabel: "Data di nascita *",
      continueButton: "Continua",
    },
    dashboard: {
      welcomeMessage: "Ehi! 👋 Sono Vesta, ti aiuto a trovare casa qui ad Ancona. Che facoltà fai?",
      tabChat: "Chat",
      tabRooms: "Stanze",
      loadingChat: "Sto ritrovando la tua chat...",
      notLoggedIn: "Devi effettuare il login per parlare con me — ricarica la pagina.",
      chatError: "Qualcosa è andato storto dal mio lato, riprova tra poco.",
    },
    chat: {
      title: "Vesta",
      subtitle: "Il tuo assistente casa · UNIVPM Ancona",
      placeholder: "Scrivi un messaggio...",
      sendAriaLabel: "Invia messaggio",
      errorMessage: "Uhm, qualcosa è andato storto dal mio lato. Puoi riprovare tra un attimo?",
    },
    roomCard: {
      poloLabels: {
        monte_dago: "Monte Dago",
        torrette: "Torrette",
        centro_economia_giurisprudenza: "Economia · Villarey",
        altro: "Altro polo",
      },
      perMonthUtilities: "/mese + {utilities}€ spese",
      totalPerMonth: "Totale: {total}€/mese",
      availableFrom: "Libera dal {date}",
      viewListing: "Vedi annuncio",
    },
    roomList: {
      emptyTitle: "Ancora nessuna stanza da mostrarti",
      emptyDescription:
        "Continua a chattare con Vesta: appena avrà budget, polo e abitudini troverà le stanze più compatibili con te.",
      title: "Stanze consigliate per te",
      resultsCount: "{count} risultati ordinati per compatibilità",
    },
    myHomeCard: {
      title: "🏠 La mia casa",
      paymentStatus: {
        da_registrare: "In attesa di conferma",
        pagato: "Pagato questo mese ✓",
        in_ritardo: "In ritardo",
      },
      rentLabel: "Affitto",
      utilitiesLabel: "Utenze stimate",
      totalLabel: "Totale/mese",
      tenantSince: "Inquilino dal {date}",
      checklistToggle: "📋 La tua checklist di trasloco",
    },
    esempi: {
      metaTitle: "Come funziona, con esempi | Coabito",
      metaDescription:
        "Un esempio vero di conversazione con Vesta e di come leggere il punteggio di compatibilità di una stanza.",
      title: "Come funziona, in pratica",
      subtitle:
        "Due esempi concreti di quello che vedi usando la piattaforma. Nessun dato vero: solo per farti capire il tono e il tipo di risultato.",
      chatSectionTitle: "Una conversazione con Vesta",
      chatSectionSubtitle:
        "Bastano due minuti di chat, in un tono normale — come scriveresti a un amico, non come compili un modulo.",
      matchSectionTitle: "Come leggiamo la compatibilità",
      matchSectionSubtitle:
        "Ogni stanza mostra un punteggio e il motivo dietro — non solo prezzo e metri quadri.",
      scoreGuideTitle: "Come si legge il punteggio",
      scoreHigh: "compatibilità alta — budget, orari e abitudini si allineano bene",
      scoreMedium: "compatibilità media — vale la pena dare un'occhiata, con qualche compromesso",
      scoreLow: "resta un'opzione valida, solo meno allineata alle tue preferenze — mai un errore",
      scoreRangeHigh: "85-100%:",
      scoreRangeMedium: "65-84%:",
      scoreRangeLow: "Sotto il 65%:",
      cta: "Prova tu stesso →",
      exampleMessages: [
        {
          role: "assistant" as const,
          content: "Ehi! 👋 Sono Vesta, ti aiuto a trovare casa. Che facoltà fai?",
        },
        {
          role: "user" as const,
          content: "Ciao! Ingegneria Informatica, secondo anno",
        },
        {
          role: "assistant" as const,
          content:
            "Top, quindi Monte Dago. Con la linea 65 (University Link) o la 46/ ci arrivi comodo. Budget mensile realistico?",
        },
        {
          role: "user" as const,
          content: "Diciamo max 420, spese escluse",
        },
        {
          role: "assistant" as const,
          content:
            "Perfetto, ho già trovato qualcosa di interessante qui a destra 👉 Dai un'occhiata alle stanze che ho selezionato per te.",
        },
      ],
      exampleRoom: {
        title: "Singola luminosa con balcone",
        zone: "Baraccola",
        distanceLabel: "9 min · Linea 46/",
        availableFrom: "1 ottobre",
        servicesIncluded: ["Wifi", "Lavatrice", "Riscaldamento centralizzato"],
        matchReasons: [
          {
            label: "Budget compatibile",
            detail: "380€ rientra nei tuoi 420€ massimi",
            weight: "alto" as const,
          },
          {
            label: "Orari di studio",
            detail: "Coinquilino attuale studia in silenzio la sera, come te",
            weight: "alto" as const,
          },
          {
            label: "Vicinanza al polo",
            detail: "9 minuti da Monte Dago con la 46/",
            weight: "medio" as const,
          },
        ],
      },
    },
    resetPassword: {
      title: "Nuova password",
      subtitle: "Scegline una nuova per il tuo account.",
      success: "✓ Password aggiornata! Ti stiamo portando dentro...",
      verifying:
        "Verifica del link in corso... Se questa schermata resta ferma, il link potrebbe essere scaduto: torna al",
      loginLink: "login",
      verifyingSuffix: "e richiedine uno nuovo.",
      passwordPlaceholder: "Nuova password (minimo 6 caratteri)",
      confirmPlaceholder: "Ripeti la nuova password",
      submit: "Salva nuova password",
      passwordTooShort: "La password deve avere almeno 6 caratteri.",
      passwordMismatch: "Le due password non coincidono.",
    },
    installa: {
      title: "Installa Coabito sul tuo telefono",
      subtitle:
        "Niente App Store: bastano quattro tocchi per avere un'icona vera sulla schermata Home, che si apre a schermo intero come un'app.",
      platformIos: "iPhone",
      platformAndroid: "Android",
      notePrefix: "Da sapere:",
      noteBody:
        "il sito resta identico a prima anche senza installarlo — questo passaggio aggiunge solo un'icona comoda, non cambia nulla di come funziona Coabito.",
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
      installApp: "Install the app",
      login: "Log in",
    },
    hero: {
      badge: "🎓 Made for out-of-town students",
      titlePart1: "Find a home by ",
      titleHighlight: "chatting",
      titlePart2: ", not scrolling endless listings.",
      subtitle:
        "Tell Vesta your degree course, your budget, and your living habits. We'll only suggest rooms that are truly compatible with you, close to your university.",
      ctaStudent: "I'm a student →",
      ctaOwner: "I'm a property owner",
      freeNote: "Free for students. No credit card required.",
      seeExample: "See an example",
      liveCompatibility: "Compatibility calculated in real time",
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
      title: "Rent out without handling negotiations yourself",
      ctaLabel: "List your property",
      steps: [
        {
          number: "1",
          title: "Send us your property",
          description:
            "Address, price, photos: we upload it to your profile and publish it on the main listing sites too.",
        },
        {
          number: "2",
          title: "We filter the interested students",
          description:
            "Only verified students compatible with your home reach you: no time-wasters.",
        },
        {
          number: "3",
          title: "You decide, we handle the rest",
          description:
            "We keep you updated on every serious request. Close the deal whenever you're ready, on your own time.",
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
            "We apply a small margin between what the student pays and what we pass on to the property owner — the same model used by anyone managing rentals on someone else's behalf, made simpler and faster through chat.",
        },
        {
          question: "Do I have to pay anything before finding the right room?",
          answer:
            "No, never. There's no sign-up or search fee: you only pay once you actually decide to take a specific room.",
        },
        {
          question: "Who handles the contract?",
          answer:
            "We do: we manage the relationship with the property owner, you only sign the contract for your room, without having to negotiate every detail yourself.",
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
            "No, listing your property is free. We take care of finding compatible, verified students: you only decide who to sign with, when you're ready.",
        },
      ],
    },
    footer: {
      tagline:
        "Independent platform for out-of-town students and property owners. Not affiliated with any university.",
      rights: "All rights reserved.",
      privacy: "Privacy",
      terms: "Terms of service",
    },
    common: {
      loading: "One moment...",
      backToHome: "← Back to home",
      admin: "Admin",
      signOut: "Sign out",
      genericError: "Something went wrong, please try again.",
      deleteAccount: {
        buttonLabel: "Delete my account",
        deletingLabel: "Deleting...",
        warningStudent:
          "Permanently delete your account? All your data (chat with Vesta, profile) will be removed. This cannot be undone.",
        warningOwner:
          "Permanently delete your account? ALL your properties and related data will also be deleted. This cannot be undone.",
        confirmAgain: "Are you sure? You won't be able to recover your account afterwards.",
      },
    },
    login: {
      signInTitle: "Welcome back",
      signInSubtitle: "Log in to continue",
      signUpTitle: "Create your account",
      signUpSubtitle: "To chat with Vesta and see recommended rooms",
      roleStudent: "I'm a student",
      roleOwner: "I'm a property owner",
      fullNamePlaceholder: "Full name",
      emailPlaceholder: "Email",
      passwordPlaceholder: "Password (at least 6 characters)",
      forgotPassword: "Forgot your password?",
      consentPrefix: "I have read and accept the",
      consentAnd: "and the",
      consentSuffix: ".",
      signInButton: "Log in",
      signUpButton: "Sign up",
      switchToSignIn: "Already have an account? Log in",
      switchToSignUp: "Don't have an account? Sign up",
      consentRequired: "You must accept the Privacy Policy and Terms of Service to sign up.",
      forgotTitle: "Forgot password",
      forgotSubtitle: "We'll send you a link to reset it.",
      forgotEmailPlaceholder: "Email you signed up with",
      forgotSubmit: "Send reset link",
      forgotSent:
        "✓ Check your inbox — we've sent you a link to choose a new password. If you don't see it, check your spam folder too.",
      backToLogin: "← Back to login",
    },
    onboarding: {
      title: "One last step",
      subtitleStudent: "A few more details before you chat with Vesta.",
      subtitleOwner: "A few more details before you start managing your properties.",
      avatarLabel: "Profile photo *",
      avatarPreviewAlt: "Profile photo preview",
      phoneLabel: "Phone number *",
      phonePlaceholder: "E.g. +39 333 1234567",
      fiscalCodeStudent: "Tax ID code *",
      fiscalCodeOwner: "Tax ID or VAT number *",
      dateOfBirthLabel: "Date of birth *",
      continueButton: "Continue",
    },
    dashboard: {
      welcomeMessage: "Hey! 👋 I'm Vesta, I'll help you find a place here in Ancona. What degree are you studying?",
      tabChat: "Chat",
      tabRooms: "Rooms",
      loadingChat: "Loading your chat...",
      notLoggedIn: "You need to log in to talk to me — please reload the page.",
      chatError: "Something went wrong on my end, please try again in a moment.",
    },
    chat: {
      title: "Vesta",
      subtitle: "Your housing assistant · UNIVPM Ancona",
      placeholder: "Write a message...",
      sendAriaLabel: "Send message",
      errorMessage: "Hmm, something went wrong on my end. Can you try again in a moment?",
    },
    roomCard: {
      poloLabels: {
        monte_dago: "Monte Dago",
        torrette: "Torrette",
        centro_economia_giurisprudenza: "Economics · Villarey",
        altro: "Other campus",
      },
      perMonthUtilities: "/month + €{utilities} utilities",
      totalPerMonth: "Total: €{total}/month",
      availableFrom: "Available from {date}",
      viewListing: "View listing",
    },
    roomList: {
      emptyTitle: "No rooms to show you yet",
      emptyDescription:
        "Keep chatting with Vesta: once she has your budget, campus and habits, she'll find the most compatible rooms for you.",
      title: "Recommended rooms for you",
      resultsCount: "{count} results sorted by compatibility",
    },
    myHomeCard: {
      title: "🏠 My home",
      paymentStatus: {
        da_registrare: "Awaiting confirmation",
        pagato: "Paid this month ✓",
        in_ritardo: "Overdue",
      },
      rentLabel: "Rent",
      utilitiesLabel: "Est. utilities",
      totalLabel: "Total/month",
      tenantSince: "Tenant since {date}",
      checklistToggle: "📋 Your move-in checklist",
    },
    esempi: {
      metaTitle: "How it works, with examples | Coabito",
      metaDescription:
        "A real example of a conversation with Vesta and how to read a room's compatibility score.",
      title: "How it works, in practice",
      subtitle:
        "Two concrete examples of what you see on the platform. No real data — just to show you the tone and the kind of result you get.",
      chatSectionTitle: "A conversation with Vesta",
      chatSectionSubtitle:
        "Just a couple of minutes of chat, in a normal tone — like texting a friend, not filling out a form.",
      matchSectionTitle: "How we read compatibility",
      matchSectionSubtitle:
        "Every room shows a score and the reason behind it — not just price and square meters.",
      scoreGuideTitle: "How to read the score",
      scoreHigh: "high compatibility — budget, hours and habits align well",
      scoreMedium: "medium compatibility — worth a look, with some trade-offs",
      scoreLow: "still a valid option, just less aligned with your preferences — never a mistake",
      scoreRangeHigh: "85-100%:",
      scoreRangeMedium: "65-84%:",
      scoreRangeLow: "Below 65%:",
      cta: "Try it yourself →",
      exampleMessages: [
        {
          role: "assistant" as const,
          content: "Hey! 👋 I'm Vesta, I'll help you find a place. What degree are you studying?",
        },
        {
          role: "user" as const,
          content: "Hi! Computer Engineering, second year",
        },
        {
          role: "assistant" as const,
          content:
            "Great, so Monte Dago. Line 65 (University Link) or the 46/ bus gets you there easily. What's a realistic monthly budget?",
        },
        {
          role: "user" as const,
          content: "Let's say max 420, utilities excluded",
        },
        {
          role: "assistant" as const,
          content:
            "Perfect, I've already found something interesting on the right 👉 Take a look at the rooms I've picked for you.",
        },
      ],
      exampleRoom: {
        title: "Bright single room with balcony",
        zone: "Baraccola",
        distanceLabel: "9 min · Line 46/",
        availableFrom: "1 October",
        servicesIncluded: ["Wifi", "Washing machine", "Central heating"],
        matchReasons: [
          {
            label: "Budget compatible",
            detail: "€380 fits within your €420 maximum",
            weight: "alto" as const,
          },
          {
            label: "Study hours",
            detail: "Current roommate studies in silence in the evening, like you",
            weight: "alto" as const,
          },
          {
            label: "Campus proximity",
            detail: "9 minutes from Monte Dago on the 46/ bus",
            weight: "medio" as const,
          },
        ],
      },
    },
    resetPassword: {
      title: "New password",
      subtitle: "Choose a new one for your account.",
      success: "✓ Password updated! Taking you in...",
      verifying:
        "Verifying the link... If this screen stays here, the link may have expired: go back to",
      loginLink: "login",
      verifyingSuffix: "and request a new one.",
      passwordPlaceholder: "New password (at least 6 characters)",
      confirmPlaceholder: "Repeat the new password",
      submit: "Save new password",
      passwordTooShort: "Password must be at least 6 characters.",
      passwordMismatch: "The two passwords don't match.",
    },
    installa: {
      title: "Install Coabito on your phone",
      subtitle:
        "No App Store needed: just four taps to get a real icon on your Home screen that opens full-screen like an app.",
      platformIos: "iPhone",
      platformAndroid: "Android",
      notePrefix: "Good to know:",
      noteBody:
        "the site works exactly the same without installing — this step only adds a handy icon, it doesn't change how Coabito works.",
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
