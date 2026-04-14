create extension if not exists pgcrypto;

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  is_admin boolean not null default false,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do update
  set email = excluded.email;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((
    select is_admin
    from public.profiles
    where id = auth.uid()
  ), false);
$$;

create table if not exists public.alteration_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.collection_points (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  location_type text not null default 'pickup',
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric(10,2) not null check (price > 0),
  type text not null check (type in ('Ajustement', 'Réparation')),
  category_id uuid references public.alteration_categories (id) on delete set null,
  stripe_product_id text,
  stripe_price_id text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  constraint articles_category_required
    check (
      (type = 'Ajustement' and category_id is not null)
      or (type = 'Réparation' and category_id is null)
    )
);

create table if not exists public.availabilities (
  id uuid primary key default gen_random_uuid(),
  collection_point_id uuid not null references public.collection_points (id) on delete cascade,
  day_of_week text not null check (day_of_week in ('Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche')),
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  constraint availabilities_time_range check (end_time > start_time)
);

create index if not exists idx_articles_type_active on public.articles (type, is_active, sort_order, name);
create index if not exists idx_articles_category on public.articles (category_id);
create index if not exists idx_collection_points_active on public.collection_points (is_active, name);
create index if not exists idx_availabilities_collection_point on public.availabilities (collection_point_id, day_of_week, start_time);

drop trigger if exists handle_profiles_updated_at on public.profiles;
create trigger handle_profiles_updated_at
before update on public.profiles
for each row execute procedure public.handle_updated_at();

drop trigger if exists handle_alteration_categories_updated_at on public.alteration_categories;
create trigger handle_alteration_categories_updated_at
before update on public.alteration_categories
for each row execute procedure public.handle_updated_at();

drop trigger if exists handle_collection_points_updated_at on public.collection_points;
create trigger handle_collection_points_updated_at
before update on public.collection_points
for each row execute procedure public.handle_updated_at();

drop trigger if exists handle_articles_updated_at on public.articles;
create trigger handle_articles_updated_at
before update on public.articles
for each row execute procedure public.handle_updated_at();

drop trigger if exists handle_availabilities_updated_at on public.availabilities;
create trigger handle_availabilities_updated_at
before update on public.availabilities
for each row execute procedure public.handle_updated_at();

alter table public.profiles enable row level security;
alter table public.alteration_categories enable row level security;
alter table public.collection_points enable row level security;
alter table public.articles enable row level security;
alter table public.availabilities enable row level security;

drop policy if exists "profiles_select_self_or_admin" on public.profiles;
create policy "profiles_select_self_or_admin"
on public.profiles
for select
using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_update_self_or_admin" on public.profiles;
create policy "profiles_update_self_or_admin"
on public.profiles
for update
using (auth.uid() = id or public.is_admin())
with check (auth.uid() = id or public.is_admin());

drop policy if exists "categories_public_read" on public.alteration_categories;
create policy "categories_public_read"
on public.alteration_categories
for select
using (is_active or public.is_admin());

drop policy if exists "categories_admin_all" on public.alteration_categories;
create policy "categories_admin_all"
on public.alteration_categories
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "collection_points_public_read" on public.collection_points;
create policy "collection_points_public_read"
on public.collection_points
for select
using (is_active or public.is_admin());

drop policy if exists "collection_points_admin_all" on public.collection_points;
create policy "collection_points_admin_all"
on public.collection_points
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "articles_public_read" on public.articles;
create policy "articles_public_read"
on public.articles
for select
using (is_active or public.is_admin());

drop policy if exists "articles_admin_all" on public.articles;
create policy "articles_admin_all"
on public.articles
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "availabilities_public_read" on public.availabilities;
create policy "availabilities_public_read"
on public.availabilities
for select
using (true);

drop policy if exists "availabilities_admin_all" on public.availabilities;
create policy "availabilities_admin_all"
on public.availabilities
for all
using (public.is_admin())
with check (public.is_admin());
