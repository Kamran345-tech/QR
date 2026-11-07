-- Suthra Punjab Beat QR Management — Supabase schema
-- This file mirrors the SQL migration applied in the Supabase SQL Editor.
-- Do not store passwords here; Supabase Auth manages credentials.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  role_label text not null default 'Operations Manager',
  permissions jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.office_contacts (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  role text not null check (role in ('TM','FMO','Supervisor')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.beats (
  id uuid primary key default gen_random_uuid(),
  beat_number text not null,
  union_council text not null,
  tehsil text not null,
  district text not null,
  status text not null default 'Active' check (status in ('Active','Inactive')),
  map_url text,
  assigned_vehicle text,
  tm_contact_id uuid references public.office_contacts(id) on delete set null,
  fmo_contact_id uuid references public.office_contacts(id) on delete set null,
  supervisor_contact_id uuid references public.office_contacts(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (beat_number, union_council, tehsil, district)
);

create table if not exists public.beat_workers (
  id uuid primary key default gen_random_uuid(),
  beat_id uuid not null references public.beats(id) on delete cascade,
  full_name text not null,
  photo_url text,
  designation text not null default 'Sanitary Worker',
  shift text not null default 'Morning',
  attendance_time time,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.complaints (
  id uuid primary key default gen_random_uuid(),
  beat_id uuid references public.beats(id) on delete set null,
  beat_number text not null,
  category text not null,
  citizen_name text not null,
  mobile text not null,
  comments text,
  photo_urls jsonb not null default '[]'::jsonb,
  status text not null default 'Pending'
    check (status in ('Pending','In Progress','Resolved','Rejected')),
  created_at timestamptz not null default now()
);

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  beat_id uuid references public.beats(id) on delete set null,
  beat_number text not null,
  rating smallint not null check (rating between 1 and 5),
  comments text,
  created_at timestamptz not null default now()
);

create index if not exists beats_status_idx on public.beats(status);
create index if not exists workers_beat_idx on public.beat_workers(beat_id);
create index if not exists complaints_created_idx on public.complaints(created_at desc);
create index if not exists complaints_beat_idx on public.complaints(beat_number);

create or replace function public.has_permission(required_permission text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.is_active = true
      and (p.role_label = 'Administrator' or p.permissions ? required_permission)
  );
$$;

create or replace function public.is_active_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_active = true
  );
$$;

alter table public.profiles enable row level security;
alter table public.office_contacts enable row level security;
alter table public.beats enable row level security;
alter table public.beat_workers enable row level security;
alter table public.complaints enable row level security;
alter table public.feedback enable row level security;

create policy "Users can view own profile"
on public.profiles for select to authenticated
using (id = auth.uid() or public.has_permission('Manage admins'));

create policy "Admins can manage profiles"
on public.profiles for all to authenticated
using (public.has_permission('Manage admins'))
with check (public.has_permission('Manage admins'));

create policy "Public can view active contacts"
on public.office_contacts for select to anon, authenticated
using (is_active = true);

create policy "Authorized users manage contacts"
on public.office_contacts for all to authenticated
using (public.has_permission('Manage contact directory'))
with check (public.has_permission('Manage contact directory'));

create policy "Public can view active beats"
on public.beats for select to anon, authenticated
using (status = 'Active');

create policy "Authorized users manage beats"
on public.beats for all to authenticated
using (public.has_permission('Manage beats'))
with check (public.has_permission('Manage beats'));

create policy "Public can view workers of active beats"
on public.beat_workers for select to anon, authenticated
using (exists (
  select 1 from public.beats b
  where b.id = beat_workers.beat_id and b.status = 'Active'
));

create policy "Authorized users manage workers"
on public.beat_workers for all to authenticated
using (public.has_permission('Manage workers'))
with check (public.has_permission('Manage workers'));

create policy "Public can submit complaints"
on public.complaints for insert to anon, authenticated
with check (length(trim(citizen_name)) > 0 and length(trim(mobile)) > 0);

create policy "Authorized users view complaints"
on public.complaints for select to authenticated
using (public.has_permission('View complaints'));

create policy "Authorized users update complaints"
on public.complaints for update to authenticated
using (public.has_permission('View complaints'))
with check (public.has_permission('View complaints'));

create policy "Public can submit feedback"
on public.feedback for insert to anon, authenticated
with check (rating between 1 and 5);

create policy "Authorized users view feedback"
on public.feedback for select to authenticated
using (public.has_permission('View complaints'));

revoke all on public.profiles from anon;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.office_contacts to authenticated;
grant select, insert, update, delete on public.beats to authenticated;
grant select, insert, update, delete on public.beat_workers to authenticated;
grant select, insert, update on public.complaints to authenticated;
grant insert, select on public.feedback to authenticated;
grant select on public.office_contacts, public.beats, public.beat_workers to anon;
grant insert on public.complaints, public.feedback to anon;
