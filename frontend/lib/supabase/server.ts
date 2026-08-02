// lib/supabase/server.ts
//
// Due client distinti, per due scopi diversi:
// 1. `createServerSupabaseClient` — legato ai cookie della request, usa
//    la sessione dell'utente loggato. Serve per sapere CHI sta scrivendo
//    (auth) e rispetta le policy RLS.
// 2. `createServiceSupabaseClient` — usa la Service Role Key, bypassa la
//    RLS. Va usato SOLO lato server (mai esposto al client) per operazioni
//    di sistema come scrivere match_scores per conto del motore di matching.

import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Variabile d'ambiente mancante: ${name}. Controlla il file .env.local.`,
    );
  }
  return value;
}

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  const supabaseUrl = getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseAnonKey = getRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(
        cookiesToSet: {
          name: string;
          value: string;
          options?: Parameters<typeof cookieStore.set>[2];
        }[],
      ) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // In un Route Handler chiamato da un Server Component questo può
          // fallire silenziosamente: è gestito dal middleware di refresh.
        }
      },
    },
  });
}

export function createServiceSupabaseClient() {
  const supabaseUrl = getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
