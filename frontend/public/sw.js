// public/sw.js
//
// Service worker minimale, scritto a mano (nessuna libreria esterna).
// Obiettivo semplice: se il telefono perde connessione, mostrare comunque
// una pagina della struttura del sito invece di un errore bianco del
// browser. Non salva chat, stanze o dati aggiornati offline — quelli
// richiedono sempre una connessione vera.

const CACHE_NAME = "coabito-shell-v1";
const OFFLINE_URL = "/";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll([OFFLINE_URL])),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Solo per le richieste di navigazione (aprire una pagina), non per
  // dati/API: quelli devono sempre essere aggiornati, mai dalla cache.
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(OFFLINE_URL)),
    );
  }
});
