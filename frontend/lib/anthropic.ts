import Anthropic from "@anthropic-ai/sdk";

export function getAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY non configurata");
  }
  return new Anthropic({ apiKey });
}

export const DADO_MODEL =
  process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-20250514";
