-- Preferred UI language for each user (IT/EN).
-- Synced from the client while the student navigates, so server-side
-- actions (proactive Vesta room alerts, AI move-in checklist) can write
-- in the right language without reading a browser cookie.

alter table public.users
  add column if not exists preferred_locale text not null default 'it'
  check (preferred_locale in ('it', 'en'));

comment on column public.users.preferred_locale is
  'UI language preference (it|en), synced from the language switcher cookie.';
