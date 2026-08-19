-- P0 messaging architecture (peer conversations).
-- Full realtime chat UI is deferred; this schema enables threads after application accept.

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.rooms(id) on delete set null,
  application_id uuid references public.room_applications(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.conversation_participants (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  last_read_at timestamptz,
  primary key (conversation_id, user_id)
);

create table if not exists public.peer_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(trim(body)) > 0 and char_length(body) <= 4000),
  created_at timestamptz not null default now()
);

create index if not exists idx_conversation_participants_user
  on public.conversation_participants (user_id);

create index if not exists idx_peer_messages_conversation
  on public.peer_messages (conversation_id, created_at desc);

alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.peer_messages enable row level security;

-- Participants can read their conversations
create policy "participants_select_conversations"
  on public.conversations for select
  using (
    exists (
      select 1 from public.conversation_participants cp
      where cp.conversation_id = conversations.id and cp.user_id = auth.uid()
    )
  );

create policy "participants_select_membership"
  on public.conversation_participants for select
  using (user_id = auth.uid() or exists (
    select 1 from public.conversation_participants cp
    where cp.conversation_id = conversation_participants.conversation_id
      and cp.user_id = auth.uid()
  ));

create policy "participants_select_messages"
  on public.peer_messages for select
  using (
    exists (
      select 1 from public.conversation_participants cp
      where cp.conversation_id = peer_messages.conversation_id and cp.user_id = auth.uid()
    )
  );

create policy "participants_insert_messages"
  on public.peer_messages for insert
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.conversation_participants cp
      where cp.conversation_id = peer_messages.conversation_id and cp.user_id = auth.uid()
    )
  );

-- Inserts into conversations / participants via service role or future RPC only
grant select on public.conversations to authenticated;
grant select on public.conversation_participants to authenticated;
grant select, insert on public.peer_messages to authenticated;
