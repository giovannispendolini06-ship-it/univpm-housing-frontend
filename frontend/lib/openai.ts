// lib/openai.ts
import OpenAI from "openai";

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variabile d'ambiente mancante: ${name}`);
  }
  return value;
}

// Modello di default per uso in produzione. Tienilo in una env var così
// puoi aggiornarlo senza toccare il codice quando OpenAI rilascia una
// nuova versione (es. passaggio da gpt-5.5 a una futura gpt-5.6/6).
export const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-5.5";

let client: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!client) {
    client = new OpenAI({ apiKey: getRequiredEnv("OPENAI_API_KEY") });
  }
  return client;
}
