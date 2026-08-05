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
  },
} as const;
