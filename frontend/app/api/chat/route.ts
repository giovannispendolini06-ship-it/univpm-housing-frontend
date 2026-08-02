import { NextResponse } from "next/server";
import { DADO_MODEL, getAnthropicClient } from "@/lib/anthropic";
import {
  extractPreferencesBlock,
  mergePreferences,
  rankRooms,
} from "@/lib/matching";
import { fetchAvailableRooms } from "@/lib/supabase/server";
import { DADO_SYSTEM_PROMPT } from "@/lib/system-prompt";
import type { ChatRequestBody, ChatResponseBody, UserPreferences } from "@/lib/types";

export const runtime = "nodejs";

function offlineReply(preferences: UserPreferences): string {
  const bits: string[] = [];
  if (preferences.city) bits.push(`a ${preferences.city}`);
  if (preferences.budgetMax) bits.push(`con budget fino a €${preferences.budgetMax}`);
  if (preferences.neighborhood) bits.push(`verso ${preferences.neighborhood}`);

  if (bits.length) {
    return `Perfetto — sto cercando stanze ${bits.join(", ")}. Dai un’occhiata ai match a destra e dimmi cosa ti convince o cosa aggiusteresti.`;
  }

  return "Raccontami città, budget massimo e quando vorresti entrare: con tre dettagli parto già a proporti delle stanze.";
}

function heuristicPreferences(
  lastUserText: string,
  current: UserPreferences,
): UserPreferences {
  const next: UserPreferences = { ...current };
  const budget = lastUserText.match(/€?\s*(\d{3,4})\s*(€|euro)?/i);
  if (budget) next.budgetMax = Number(budget[1]);

  const cities = ["milano", "roma", "torino", "bologna", "firenze", "napoli"];
  for (const city of cities) {
    if (lastUserText.toLowerCase().includes(city)) {
      next.city = city[0].toUpperCase() + city.slice(1);
      break;
    }
  }

  if (/animali|cane|gatto|pet/i.test(lastUserText)) next.petsOk = true;
  if (/no\s+fumo|non fum/i.test(lastUserText)) next.smokingOk = false;
  if (/tranquill|silenzi|quiet/i.test(lastUserText)) {
    next.noiseTolerance = 2;
    next.lifestyle = [...new Set([...(next.lifestyle ?? []), "tranquillo"])];
  }
  if (/social|aperitiv|fest/i.test(lastUserText)) {
    next.lifestyle = [...new Set([...(next.lifestyle ?? []), "sociale"])];
  }

  return next;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChatRequestBody;
    const incoming = body.messages ?? [];
    let preferences = body.preferences ?? {};

    const lastUser =
      [...incoming].reverse().find((m) => m.role === "user")?.content ?? "";

    let reply = "";

    if (process.env.ANTHROPIC_API_KEY) {
      const anthropic = getAnthropicClient();
      const completion = await anthropic.messages.create({
        model: DADO_MODEL,
        max_tokens: 800,
        system: DADO_SYSTEM_PROMPT,
        messages: incoming.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      });

      const raw = completion.content
        .filter((block) => block.type === "text")
        .map((block) => (block.type === "text" ? block.text : ""))
        .join("\n");

      const extracted = extractPreferencesBlock(raw);
      reply = extracted.cleanText;
      preferences = mergePreferences(preferences, extracted.preferences);
    } else {
      preferences = heuristicPreferences(lastUser, preferences);
      reply = offlineReply(preferences);
    }

    const rooms = await fetchAvailableRooms(preferences.city);
    const ranked = rankRooms(rooms, preferences);

    const payload: ChatResponseBody = {
      reply,
      preferences,
      rooms: ranked,
    };

    return NextResponse.json(payload);
  } catch (error) {
    console.error("POST /api/chat", error);
    return NextResponse.json(
      { error: "Impossibile elaborare la chat" },
      { status: 500 },
    );
  }
}
