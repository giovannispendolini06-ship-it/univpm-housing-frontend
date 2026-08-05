export type Locale = "it" | "en";

export const translations = {
  it: {
    nav: {
      forStudents: "Per gli studenti",
      forOwners: "Per i proprietari",
      howItWorks: "Come funziona",
      installApp: "Installa l'app",
      login: "Accedi",
      waitlist: "Lista d'attesa",
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
    },
    roomCard: {
      perMonth: "/mese",
      plusUtilities: "+ {utilities}€ spese",
      total: "Totale: {total}€/mese",
      viewListing: "Vedi annuncio",
      availableFrom: "Libera dal {date}",
      otherCampus: "Altro polo",
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
      successTitle: "Sei in lista! 🎉",
      successBody:
        "Ti avviseremo appena arriva un immobile compatibile con le tue preferenze. Nel frattempo, puoi condividere il link con chi cerca casa ad Ancona.",
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
      installApp: "Install the app",
      login: "Log in",
      waitlist: "Waitlist",
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
    },
    roomCard: {
      perMonth: "/month",
      plusUtilities: "+ €{utilities} utilities",
      total: "Total: €{total}/month",
      viewListing: "View listing",
      availableFrom: "Available from {date}",
      otherCampus: "Other campus",
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
      successTitle: "You're on the list! 🎉",
      successBody:
        "We'll notify you as soon as a compatible place becomes available. In the meantime, feel free to share the link with friends looking for a room in Ancona.",
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
