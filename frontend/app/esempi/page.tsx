import type { Metadata } from "next";
import ExamplesContent from "./ExamplesContent";

export const metadata: Metadata = {
  title: "Come funziona, con esempi | Coabito",
  description:
    "Un esempio vero di conversazione con Vesta e di come leggere il punteggio di compatibilità di una stanza.",
};

export default function ExamplesPage() {
  return <ExamplesContent />;
}
