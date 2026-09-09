import type { GeoCity } from "./types";

/**
 * Catalogo città → università → poli per Vesta multi-città.
 * Solo Ancona è `active`; le altre sono `coming_soon` (nessun matching operativo).
 * countryCode è sempre IT oggi — schema pronto per altri paesi.
 */
export const ITALY_GEO_CATALOG: readonly GeoCity[] = [
  // --- Marche ---
  {
    slug: "ancona",
    name: "Ancona",
    region: "Marche",
    countryCode: "IT",
    status: "active",
    universities: [
      {
        slug: "univpm",
        name: "Università Politecnica delle Marche",
        poles: [
          {
            slug: "monte_dago",
            name: "Monte Dago",
            faculties: ["Ingegneria", "Agraria", "Scienze"],
          },
          {
            slug: "torrette",
            name: "Torrette",
            faculties: ["Medicina"],
          },
          {
            slug: "villarey",
            name: "Villarey / centro (Economia Giorgio Fuà)",
            faculties: ["Economia"],
          },
        ],
      },
    ],
  },
  {
    slug: "urbino",
    name: "Urbino",
    region: "Marche",
    countryCode: "IT",
    status: "coming_soon",
    universities: [
      { slug: "uniurb", name: "Università di Urbino Carlo Bo", poles: [] },
    ],
  },
  {
    slug: "macerata",
    name: "Macerata",
    region: "Marche",
    countryCode: "IT",
    status: "coming_soon",
    universities: [
      { slug: "unimc", name: "Università di Macerata", poles: [] },
    ],
  },
  {
    slug: "camerino",
    name: "Camerino",
    region: "Marche",
    countryCode: "IT",
    status: "coming_soon",
    universities: [
      { slug: "unicam", name: "Università di Camerino", poles: [] },
    ],
  },

  // --- Piemonte ---
  {
    slug: "torino",
    name: "Torino",
    region: "Piemonte",
    countryCode: "IT",
    status: "coming_soon",
    universities: [
      {
        slug: "unito",
        name: "Università di Torino",
        poles: [
          { slug: "cle", name: "Campus Luigi Einaudi" },
          { slug: "molinette", name: "Molinette (Medicina)" },
        ],
      },
      {
        slug: "polito",
        name: "Politecnico di Torino",
        poles: [{ slug: "cittadella", name: "Cittadella Politecnico" }],
      },
    ],
  },

  // --- Lombardia ---
  {
    slug: "milano",
    name: "Milano",
    region: "Lombardia",
    countryCode: "IT",
    status: "coming_soon",
    universities: [
      {
        slug: "unimi",
        name: "Università degli Studi di Milano (Statale)",
        poles: [{ slug: "citta_studi", name: "Città Studi" }],
      },
      {
        slug: "unimib",
        name: "Università di Milano-Bicocca",
        poles: [{ slug: "bicocca", name: "Bicocca" }],
      },
      {
        slug: "polimi",
        name: "Politecnico di Milano",
        poles: [{ slug: "citta_studi", name: "Città Studi" }],
      },
      {
        slug: "bocconi",
        name: "Università Bocconi",
        poles: [{ slug: "porta_romana", name: "Porta Romana / Bocconi" }],
      },
      {
        slug: "unicatt-mi",
        name: "Università Cattolica del Sacro Cuore",
        poles: [{ slug: "centro", name: "Centro" }],
      },
    ],
  },
  {
    slug: "pavia",
    name: "Pavia",
    region: "Lombardia",
    countryCode: "IT",
    status: "coming_soon",
    universities: [
      { slug: "unipv", name: "Università di Pavia", poles: [] },
    ],
  },
  {
    slug: "bergamo",
    name: "Bergamo",
    region: "Lombardia",
    countryCode: "IT",
    status: "coming_soon",
    universities: [
      { slug: "unibg", name: "Università di Bergamo", poles: [] },
    ],
  },
  {
    slug: "brescia",
    name: "Brescia",
    region: "Lombardia",
    countryCode: "IT",
    status: "coming_soon",
    universities: [
      { slug: "unibs", name: "Università di Brescia", poles: [] },
    ],
  },
  {
    slug: "varese-como",
    name: "Varese / Como",
    region: "Lombardia",
    countryCode: "IT",
    status: "coming_soon",
    universities: [
      { slug: "uninsubria", name: "Università dell'Insubria", poles: [] },
    ],
  },

  // --- Veneto ---
  {
    slug: "padova",
    name: "Padova",
    region: "Veneto",
    countryCode: "IT",
    status: "coming_soon",
    universities: [
      {
        slug: "unipd",
        name: "Università di Padova",
        poles: [
          { slug: "centro", name: "Centro storico" },
          { slug: "agripolis", name: "Agripolis (Agraria)" },
          { slug: "terza_torre", name: "Terza Torre (Ingegneria)" },
        ],
      },
    ],
  },
  {
    slug: "venezia",
    name: "Venezia",
    region: "Veneto",
    countryCode: "IT",
    status: "coming_soon",
    universities: [
      { slug: "unive", name: "Università Ca' Foscari Venezia", poles: [] },
      { slug: "iuav", name: "Università Iuav di Venezia", poles: [] },
    ],
  },
  {
    slug: "verona",
    name: "Verona",
    region: "Veneto",
    countryCode: "IT",
    status: "coming_soon",
    universities: [
      { slug: "univr", name: "Università di Verona", poles: [] },
    ],
  },

  // --- Trentino-Alto Adige ---
  {
    slug: "trento",
    name: "Trento",
    region: "Trentino-Alto Adige",
    countryCode: "IT",
    status: "coming_soon",
    universities: [
      { slug: "unitn", name: "Università di Trento", poles: [] },
    ],
  },
  {
    slug: "bolzano",
    name: "Bolzano",
    region: "Trentino-Alto Adige",
    countryCode: "IT",
    status: "coming_soon",
    universities: [
      { slug: "unibz", name: "Libera Università di Bolzano", poles: [] },
    ],
  },

  // --- Friuli-Venezia Giulia ---
  {
    slug: "trieste",
    name: "Trieste",
    region: "Friuli-Venezia Giulia",
    countryCode: "IT",
    status: "coming_soon",
    universities: [
      { slug: "units", name: "Università di Trieste", poles: [] },
    ],
  },
  {
    slug: "udine",
    name: "Udine",
    region: "Friuli-Venezia Giulia",
    countryCode: "IT",
    status: "coming_soon",
    universities: [
      { slug: "uniud", name: "Università di Udine", poles: [] },
    ],
  },

  // --- Liguria ---
  {
    slug: "genova",
    name: "Genova",
    region: "Liguria",
    countryCode: "IT",
    status: "coming_soon",
    universities: [
      { slug: "unige", name: "Università di Genova", poles: [] },
    ],
  },

  // --- Emilia-Romagna ---
  {
    slug: "bologna",
    name: "Bologna",
    region: "Emilia-Romagna",
    countryCode: "IT",
    status: "coming_soon",
    universities: [
      {
        slug: "unibo",
        name: "Università di Bologna",
        poles: [
          { slug: "scienze", name: "Scienze (Zona universitaria / San Donato)" },
          { slug: "ingegneria", name: "Ingegneria (Zona universitaria)" },
          { slug: "economia", name: "Economia (San Donato)" },
          { slug: "medicina", name: "Medicina (Policlinico Sant'Orsola)" },
          { slug: "giurisprudenza", name: "Giurisprudenza (centro)" },
          { slug: "lettere", name: "Lettere (centro)" },
        ],
      },
    ],
  },
  {
    slug: "parma",
    name: "Parma",
    region: "Emilia-Romagna",
    countryCode: "IT",
    status: "coming_soon",
    universities: [
      { slug: "unipr", name: "Università di Parma", poles: [] },
    ],
  },
  {
    slug: "modena-reggio",
    name: "Modena e Reggio Emilia",
    region: "Emilia-Romagna",
    countryCode: "IT",
    status: "coming_soon",
    universities: [
      {
        slug: "unimore",
        name: "Università degli Studi di Modena e Reggio Emilia",
        poles: [],
      },
    ],
  },
  {
    slug: "ferrara",
    name: "Ferrara",
    region: "Emilia-Romagna",
    countryCode: "IT",
    status: "coming_soon",
    universities: [
      { slug: "unife", name: "Università di Ferrara", poles: [] },
    ],
  },

  // --- Toscana ---
  {
    slug: "firenze",
    name: "Firenze",
    region: "Toscana",
    countryCode: "IT",
    status: "coming_soon",
    universities: [
      {
        slug: "unifi",
        name: "Università di Firenze",
        poles: [
          { slug: "centro", name: "Centro storico" },
          { slug: "careggi", name: "Careggi (Medicina)" },
          { slug: "novoli", name: "Novoli (Scienze sociali)" },
        ],
      },
    ],
  },
  {
    slug: "pisa",
    name: "Pisa",
    region: "Toscana",
    countryCode: "IT",
    status: "coming_soon",
    universities: [
      {
        slug: "unipi",
        name: "Università di Pisa",
        poles: [
          { slug: "centro", name: "Centro storico" },
          { slug: "san_rossore", name: "San Rossore (Ingegneria)" },
          { slug: "cisanello", name: "Cisanello (Medicina)" },
        ],
      },
      { slug: "sns", name: "Scuola Normale Superiore", poles: [] },
      { slug: "santanna", name: "Scuola Superiore Sant'Anna", poles: [] },
    ],
  },
  {
    slug: "siena",
    name: "Siena",
    region: "Toscana",
    countryCode: "IT",
    status: "coming_soon",
    universities: [
      { slug: "unisi", name: "Università di Siena", poles: [] },
    ],
  },
  {
    slug: "arezzo",
    name: "Arezzo",
    region: "Toscana",
    countryCode: "IT",
    status: "coming_soon",
    universities: [
      {
        slug: "unisi-arezzo",
        name: "Università di Siena (sede di Arezzo)",
        poles: [],
      },
    ],
  },

  // --- Umbria ---
  {
    slug: "perugia",
    name: "Perugia",
    region: "Umbria",
    countryCode: "IT",
    status: "coming_soon",
    universities: [
      {
        slug: "unipg",
        name: "Università di Perugia",
        poles: [
          { slug: "centro", name: "Centro storico" },
          { slug: "monteluce", name: "Monteluce" },
        ],
      },
    ],
  },

  // --- Lazio ---
  {
    slug: "roma",
    name: "Roma",
    region: "Lazio",
    countryCode: "IT",
    status: "coming_soon",
    universities: [
      {
        slug: "uniroma1",
        name: "Sapienza Università di Roma",
        poles: [
          {
            slug: "san_lorenzo",
            name: "San Lorenzo / Città Universitaria",
          },
        ],
      },
      {
        slug: "uniroma3",
        name: "Università Roma Tre",
        poles: [{ slug: "ostiense", name: "Ostiense" }],
      },
      {
        slug: "uniroma2",
        name: "Università di Roma Tor Vergata",
        poles: [{ slug: "tor_vergata", name: "Tor Vergata (sud-est)" }],
      },
      {
        slug: "luiss",
        name: "LUISS Guido Carli",
        poles: [{ slug: "parioli", name: "Parioli" }],
      },
    ],
  },
  {
    slug: "viterbo",
    name: "Viterbo",
    region: "Lazio",
    countryCode: "IT",
    status: "coming_soon",
    universities: [
      { slug: "unitus", name: "Università della Tuscia", poles: [] },
    ],
  },
  {
    slug: "cassino",
    name: "Cassino",
    region: "Lazio",
    countryCode: "IT",
    status: "coming_soon",
    universities: [
      {
        slug: "unicas",
        name: "Università di Cassino e del Lazio Meridionale",
        poles: [],
      },
    ],
  },

  // --- Abruzzo ---
  {
    slug: "laquila",
    name: "L'Aquila",
    region: "Abruzzo",
    countryCode: "IT",
    status: "coming_soon",
    universities: [
      { slug: "univaq", name: "Università dell'Aquila", poles: [] },
    ],
  },
  {
    slug: "chieti-pescara",
    name: "Chieti-Pescara",
    region: "Abruzzo",
    countryCode: "IT",
    status: "coming_soon",
    universities: [
      {
        slug: "unich",
        name: 'Università degli Studi "G. d\'Annunzio" Chieti-Pescara',
        poles: [],
      },
    ],
  },
  {
    slug: "teramo",
    name: "Teramo",
    region: "Abruzzo",
    countryCode: "IT",
    status: "coming_soon",
    universities: [
      { slug: "unite", name: "Università di Teramo", poles: [] },
    ],
  },

  // --- Molise ---
  {
    slug: "campobasso",
    name: "Campobasso",
    region: "Molise",
    countryCode: "IT",
    status: "coming_soon",
    universities: [
      { slug: "unimol", name: "Università del Molise", poles: [] },
    ],
  },

  // --- Campania ---
  {
    slug: "napoli",
    name: "Napoli",
    region: "Campania",
    countryCode: "IT",
    status: "coming_soon",
    universities: [
      {
        slug: "unina",
        name: "Università di Napoli Federico II",
        poles: [
          { slug: "centro", name: "Centro storico" },
          { slug: "fuorigrotta", name: "Fuorigrotta (Ingegneria)" },
          { slug: "policlinico", name: "Policlinico" },
        ],
      },
      {
        slug: "uniparthenope",
        name: "Università di Napoli Parthenope",
        poles: [],
      },
      {
        slug: "unicampania",
        name: "Università della Campania Luigi Vanvitelli",
        poles: [],
      },
    ],
  },
  {
    slug: "salerno",
    name: "Salerno",
    region: "Campania",
    countryCode: "IT",
    status: "coming_soon",
    universities: [
      { slug: "unisa", name: "Università di Salerno", poles: [] },
    ],
  },
  {
    slug: "benevento",
    name: "Benevento",
    region: "Campania",
    countryCode: "IT",
    status: "coming_soon",
    universities: [
      { slug: "unisannio", name: "Università del Sannio", poles: [] },
    ],
  },
  {
    slug: "caserta",
    name: "Caserta",
    region: "Campania",
    countryCode: "IT",
    status: "coming_soon",
    universities: [
      {
        slug: "unicampania-caserta",
        name: "Università della Campania Luigi Vanvitelli (Caserta)",
        poles: [],
      },
    ],
  },

  // --- Puglia ---
  {
    slug: "bari",
    name: "Bari",
    region: "Puglia",
    countryCode: "IT",
    status: "coming_soon",
    universities: [
      {
        slug: "uniba",
        name: "Università di Bari Aldo Moro",
        poles: [
          { slug: "poggiofranco", name: "Poggiofranco" },
          {
            slug: "centro",
            name: "Centro (Giurisprudenza / Economia)",
          },
        ],
      },
      {
        slug: "poliba",
        name: "Politecnico di Bari",
        poles: [],
      },
    ],
  },
  {
    slug: "lecce",
    name: "Lecce",
    region: "Puglia",
    countryCode: "IT",
    status: "coming_soon",
    universities: [
      { slug: "unisalento", name: "Università del Salento", poles: [] },
    ],
  },
  {
    slug: "foggia",
    name: "Foggia",
    region: "Puglia",
    countryCode: "IT",
    status: "coming_soon",
    universities: [
      { slug: "unifg", name: "Università di Foggia", poles: [] },
    ],
  },

  // --- Basilicata ---
  {
    slug: "potenza",
    name: "Potenza",
    region: "Basilicata",
    countryCode: "IT",
    status: "coming_soon",
    universities: [
      { slug: "unibas", name: "Università della Basilicata", poles: [] },
    ],
  },

  // --- Calabria ---
  {
    slug: "cosenza",
    name: "Cosenza",
    region: "Calabria",
    countryCode: "IT",
    status: "coming_soon",
    universities: [
      { slug: "unical", name: "Università della Calabria", poles: [] },
    ],
  },
  {
    slug: "reggio-calabria",
    name: "Reggio Calabria",
    region: "Calabria",
    countryCode: "IT",
    status: "coming_soon",
    universities: [
      {
        slug: "unirc",
        name: "Università Mediterranea di Reggio Calabria",
        poles: [],
      },
    ],
  },
  {
    slug: "catanzaro",
    name: "Catanzaro",
    region: "Calabria",
    countryCode: "IT",
    status: "coming_soon",
    universities: [
      {
        slug: "unicz",
        name: 'Università "Magna Graecia" di Catanzaro',
        poles: [],
      },
    ],
  },

  // --- Sicilia ---
  {
    slug: "palermo",
    name: "Palermo",
    region: "Sicilia",
    countryCode: "IT",
    status: "coming_soon",
    universities: [
      {
        slug: "unipa",
        name: "Università di Palermo",
        poles: [
          { slug: "viale_delle_scienze", name: "Viale delle Scienze" },
          { slug: "centro", name: "Centro storico" },
        ],
      },
    ],
  },
  {
    slug: "catania",
    name: "Catania",
    region: "Sicilia",
    countryCode: "IT",
    status: "coming_soon",
    universities: [
      {
        slug: "unict",
        name: "Università di Catania",
        poles: [
          { slug: "centro", name: "Centro storico" },
          {
            slug: "citta_universitaria",
            name: "Città Universitaria (viale Andrea Doria)",
          },
        ],
      },
    ],
  },
  {
    slug: "messina",
    name: "Messina",
    region: "Sicilia",
    countryCode: "IT",
    status: "coming_soon",
    universities: [
      { slug: "unime", name: "Università di Messina", poles: [] },
    ],
  },
  {
    slug: "enna",
    name: "Enna",
    region: "Sicilia",
    countryCode: "IT",
    status: "coming_soon",
    universities: [
      { slug: "unikore", name: 'Università "Kore" di Enna', poles: [] },
    ],
  },

  // --- Sardegna ---
  {
    slug: "cagliari",
    name: "Cagliari",
    region: "Sardegna",
    countryCode: "IT",
    status: "coming_soon",
    universities: [
      {
        slug: "unica",
        name: "Università di Cagliari",
        poles: [
          { slug: "centro", name: "Centro storico" },
          {
            slug: "monserrato",
            name: "Cittadella Universitaria di Monserrato",
          },
        ],
      },
    ],
  },
  {
    slug: "sassari",
    name: "Sassari",
    region: "Sardegna",
    countryCode: "IT",
    status: "coming_soon",
    universities: [
      { slug: "uniss", name: "Università di Sassari", poles: [] },
    ],
  },
] as const;
