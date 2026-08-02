// lib/supabase/client.ts
//
// Client Supabase da usare nei Client Component (browser). Usa i cookie
// per salvare la sessione, così le Route Handler lato server (vedi
// lib/supabase/server.ts) possono leggerla dalla stessa richiesta.

import { createBrowserClient } from "@supabase/ssr";

export function createClientSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
