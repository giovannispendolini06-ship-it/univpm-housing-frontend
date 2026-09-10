-- ============================================================================
-- REVIEWS (recensioni reciproche verificate) + report flag
-- Sblocco solo a fine soggiorno: room_tenancies.ended_at IS NOT NULL
-- (nel prodotto non esiste status='ended'; ended_at null = attivo).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Flag invite email (evita doppi invii dal cron)
-- ---------------------------------------------------------------------------
alter table public.room_tenancies
  add column if not exists review_invite_sent_at timestamptz;

comment on column public.room_tenancies.review_invite_sent_at is
  'When set, student + landlord already received the post-stay review invite email.';

-- ---------------------------------------------------------------------------
-- reviews
-- ---------------------------------------------------------------------------
create table if not exists public.reviews (
  id           uuid primary key default gen_random_uuid(),
  tenancy_id   uuid not null references public.room_tenancies (id) on delete cascade,
  author_id    uuid not null references public.users (id) on delete cascade,
  -- landlord = studente → proprietario/annuncio (pubblico sul listing)
  -- student  = proprietario → studente (privato, solo altri owner in candidatura)
  target_type  text not null check (target_type in ('landlord', 'student')),
  target_id    uuid not null references public.users (id) on delete cascade,
  room_id      uuid not null references public.rooms (id) on delete cascade,
  rating       smallint not null check (rating between 1 and 5),
  comment      text not null check (char_length(btrim(comment)) >= 1 and char_length(comment) <= 500),
  created_at   timestamptz not null default now(),
  constraint reviews_author_tenancy_target_unique
    unique (author_id, tenancy_id, target_type)
);

create index if not exists idx_reviews_room_id on public.reviews (room_id);
create index if not exists idx_reviews_target
  on public.reviews (target_type, target_id);
create index if not exists idx_reviews_tenancy_id on public.reviews (tenancy_id);
create index if not exists idx_reviews_author_id on public.reviews (author_id);

alter table public.reviews enable row level security;

-- Public read of landlord reviews only (listing page, even anon).
drop policy if exists "reviews_select_landlord_public" on public.reviews;
create policy "reviews_select_landlord_public" on public.reviews
  for select
  to anon, authenticated
  using (target_type = 'landlord');

-- Authors can always read their own rows (any target_type).
drop policy if exists "reviews_select_own" on public.reviews;
create policy "reviews_select_own" on public.reviews
  for select
  to authenticated
  using (author_id = auth.uid());

-- Owners may read student reviews about applicants who applied to their rooms
-- (enforced again in app layer; RLS: target is student AND owner of a room
-- that received an application from that student, OR owner of the reviewed tenancy room).
drop policy if exists "reviews_select_student_for_owners" on public.reviews;
create policy "reviews_select_student_for_owners" on public.reviews
  for select
  to authenticated
  using (
    target_type = 'student'
    and (
      -- Owner of the tenancy's room
      exists (
        select 1
        from public.rooms r
        join public.properties p on p.id = r.property_id
        where r.id = reviews.room_id
          and p.owner_id = auth.uid()
      )
      or exists (
        select 1
        from public.room_applications ra
        join public.rooms r on r.id = ra.room_id
        join public.properties p on p.id = r.property_id
        where ra.student_id = reviews.target_id
          and p.owner_id = auth.uid()
      )
      or public.is_admin()
    )
  );

-- INSERT: ended tenancy + author is student or property owner
drop policy if exists "reviews_insert_ended_party" on public.reviews;
create policy "reviews_insert_ended_party" on public.reviews
  for insert
  to authenticated
  with check (
    author_id = auth.uid()
    and exists (
      select 1
      from public.room_tenancies t
      join public.rooms r on r.id = t.room_id
      join public.properties p on p.id = r.property_id
      where t.id = reviews.tenancy_id
        and t.ended_at is not null
        and t.room_id = reviews.room_id
        and (
          (reviews.target_type = 'landlord'
            and t.student_id = auth.uid()
            and reviews.target_id = p.owner_id)
          or
          (reviews.target_type = 'student'
            and p.owner_id = auth.uid()
            and reviews.target_id = t.student_id)
        )
    )
  );

-- DELETE: author only, within 48 hours of created_at
drop policy if exists "reviews_delete_own_48h" on public.reviews;
create policy "reviews_delete_own_48h" on public.reviews
  for delete
  to authenticated
  using (
    author_id = auth.uid()
    and created_at > (now() - interval '48 hours')
  );

-- No UPDATE policy → reviews immutable after publish
revoke all on public.reviews from anon;
grant select on public.reviews to anon, authenticated;
grant insert, delete on public.reviews to authenticated;
grant all on public.reviews to service_role;

-- ---------------------------------------------------------------------------
-- review_reports (flag → email a info@coabito.it; no moderation dashboard)
-- ---------------------------------------------------------------------------
create table if not exists public.review_reports (
  id          uuid primary key default gen_random_uuid(),
  review_id   uuid not null references public.reviews (id) on delete cascade,
  reporter_id uuid references public.users (id) on delete set null,
  reason      text not null check (char_length(btrim(reason)) >= 3 and char_length(reason) <= 500),
  created_at  timestamptz not null default now()
);

create index if not exists idx_review_reports_review_id
  on public.review_reports (review_id);

alter table public.review_reports enable row level security;

drop policy if exists "review_reports_insert_auth" on public.review_reports;
create policy "review_reports_insert_auth" on public.review_reports
  for insert
  to authenticated
  with check (reporter_id = auth.uid());

drop policy if exists "review_reports_select_admin" on public.review_reports;
create policy "review_reports_select_admin" on public.review_reports
  for select
  to authenticated
  using (public.is_admin());

revoke all on public.review_reports from anon;
grant insert on public.review_reports to authenticated;
grant select on public.review_reports to authenticated;
grant all on public.review_reports to service_role;

comment on table public.reviews is
  'Bidirectional post-stay reviews. Writable only when room_tenancies.ended_at is set.';
comment on table public.review_reports is
  'Abuse flags on reviews; notified by email — no moderation UI in-product yet.';
