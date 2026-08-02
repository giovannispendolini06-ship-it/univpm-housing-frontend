import OpenAI from "openai";

export function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY non configurata");
  }
  return new OpenAI({ apiKey });
}

export const DADO_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
