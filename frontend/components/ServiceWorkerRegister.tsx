"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Se fallisce, il sito funziona comunque normalmente — l'unica
        // cosa che manca è il fallback offline, non è mai bloccante.
      });
    }
  }, []);

  return null;
}
