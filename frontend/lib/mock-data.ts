// lib/mock-data.ts
// Dati fittizi: in produzione sostituisci con fetch a Supabase
// (join tra rooms, properties e match_scores per lo studente loggato).

import type { ChatMessage, RecommendedRoom } from "./types";

export const initialMessages: ChatMessage[] = [
  {
    id: "m1",
    role: "assistant",
    content:
      "Ehi! 👋 Sono Domi, ti aiuto a trovare casa qui ad Ancona. Che facoltà fai?",
    createdAt: "2026-08-02T09:00:00.000Z",
  },
  {
    id: "m2",
    role: "user",
    content: "Ciao! Ingegneria Informatica, secondo anno",
    createdAt: "2026-08-02T09:00:20.000Z",
  },
  {
    id: "m3",
    role: "assistant",
    content:
      "Top, quindi Monte Dago. Con la linea 65 (University Link) o la 46/ ci arrivi comodo. Budget mensile realistico?",
    createdAt: "2026-08-02T09:00:35.000Z",
  },
  {
    id: "m4",
    role: "user",
    content: "Diciamo max 420, spese escluse",
    createdAt: "2026-08-02T09:01:10.000Z",
  },
  {
    id: "m5",
    role: "assistant",
    content:
      "Perfetto, ho già trovato qualcosa di interessante qui a destra 👉 Dai un'occhiata alle stanze che ho selezionato per te.",
    createdAt: "2026-08-02T09:01:40.000Z",
  },
];

export const recommendedRooms: RecommendedRoom[] = [
  {
    id: "r1",
    propertyId: "p1",
    title: "Singola luminosa con balcone",
    zone: "Baraccola",
    polo: "monte_dago",
    distanceMinutes: 9,
    distanceLabel: "9 min • Linea 46/",
    priceMonthly: 380,
    estimatedUtilities: 45,
    imageUrl:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800&auto=format&fit=crop",
    matchScore: 92,
    matchReasons: [
      {
        label: "Budget compatibile",
        detail: "380€ rientra nei tuoi 420€ massimi",
        weight: "alto",
      },
      {
        label: "Orari di studio",
        detail: "Coinquilino attuale studia in silenzio la sera, come te",
        weight: "alto",
      },
      {
        label: "Vicinanza al polo",
        detail: "9 minuti da Monte Dago con la 46/",
        weight: "medio",
      },
    ],
    servicesIncluded: ["Wifi", "Lavatrice", "Riscaldamento centralizzato"],
    availableFrom: "1 ottobre",
  },
  {
    id: "r2",
    propertyId: "p2",
    title: "Doppia uso singola, appartamento condiviso",
    zone: "Passo Varano",
    polo: "monte_dago",
    distanceMinutes: 14,
    distanceLabel: "14 min • Linea 46/",
    priceMonthly: 340,
    estimatedUtilities: 40,
    imageUrl:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=800&auto=format&fit=crop",
    matchScore: 81,
    matchReasons: [
      {
        label: "Budget compatibile",
        detail: "340€ è ben sotto il tuo massimo",
        weight: "alto",
      },
      {
        label: "Pulizia",
        detail: "Livello di ordine dichiarato dai coinquilini in linea col tuo",
        weight: "medio",
      },
      {
        label: "Vita sociale",
        detail: "Casa tranquilla, poche feste: come preferisci tu",
        weight: "medio",
      },
    ],
    servicesIncluded: ["Wifi", "Posto auto", "Terrazzo condiviso"],
    availableFrom: "15 settembre",
  },
  {
    id: "r3",
    propertyId: "p3",
    title: "Singola in centro storico",
    zone: "Piazza Cavour",
    polo: "centro_economia_giurisprudenza",
    distanceMinutes: 25,
    distanceLabel: "25 min • Linea 1/4 + 46/",
    priceMonthly: 410,
    estimatedUtilities: 50,
    imageUrl:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=800&auto=format&fit=crop",
    matchScore: 64,
    matchReasons: [
      {
        label: "Budget compatibile",
        detail: "410€ rientra nel tuo massimo, di misura",
        weight: "medio",
      },
      {
        label: "Distanza dal polo",
        detail: "Più lontana da Monte Dago rispetto ad altre opzioni",
        weight: "basso",
      },
      {
        label: "Vita di quartiere",
        detail: "Zona centrale e vivace, utile se ti muovi spesso in città",
        weight: "medio",
      },
    ],
    servicesIncluded: ["Wifi", "Aria condizionata"],
    availableFrom: "1 ottobre",
  },
];
