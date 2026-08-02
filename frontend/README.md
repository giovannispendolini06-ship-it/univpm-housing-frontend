# univpm-housing-frontend

App Next.js (App Router) con chat assistant **Dado** (OpenAI), matching stanze e Supabase.

## Struttura

```
frontend/
├── app/
│   ├── layout.tsx              # root layout + font (Space Grotesk + Inter)
│   ├── globals.css             # stili globali, focus-visible, scrollbar
│   ├── dashboard/page.tsx      # schermata principale (chat + stanze)
│   └── api/chat/route.ts       # route backend: OpenAI + Supabase + matching
├── components/
│   ├── ChatPanel.tsx
│   ├── ChatBubble.tsx
│   ├── TypingIndicator.tsx
│   ├── MatchScoreRing.tsx
│   ├── RoomCard.tsx
│   └── RoomList.tsx
├── lib/
│   ├── types.ts
│   ├── mock-data.ts            # dati di esempio (da rimuovere in produzione)
│   ├── openai.ts               # client OpenAI + OPENAI_API_KEY
│   ├── system-prompt.ts
│   ├── matching.ts
│   └── supabase/server.ts
└── supabase/migration_room_tenancies.sql
```

## Setup

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000) (redirect a `/dashboard`).

### Variabili d’ambiente

| Variabile | Uso |
|-----------|-----|
| `OPENAI_API_KEY` | Chat OpenAI. Se assente, fallback euristico offline. |
| `OPENAI_MODEL` | Modello (default `gpt-4o-mini`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Progetto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client auth / RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | Fetch stanze server-side |
| `USE_MOCK_DATA` | `true` per usare `lib/mock-data.ts` |

### Database

Esegui `supabase/migration_room_tenancies.sql` sul progetto Supabase, poi imposta `USE_MOCK_DATA=false`.

## Flusso

1. L’utente scrive in chat (`ChatPanel`).
2. `POST /api/chat` chiama OpenAI con il system prompt di Dado, estrae le preferenze e interroga le stanze.
3. `lib/matching.ts` calcola il match score e restituisce le stanze ordinate.
4. `RoomList` / `RoomCard` mostrano i risultati con `MatchScoreRing`.
