-- 1. Create a public.users table to mirror auth.users
create table public.users (
  id uuid references auth.users(id) on delete cascade not null primary key,
  email text,
  full_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Use a trigger to automatically populate public.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.users (id, email, full_name)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Create user_settings table
create table public.user_settings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null unique,
  starting_month integer not null check (starting_month between 1 and 12),
  starting_year integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create categories table
create type public.category_type as enum ('asset', 'liability');

create table public.categories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  name text not null,
  type public.category_type not null,
  is_active boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Allow users to have unique category names per type
create unique index categories_user_id_name_type_idx on public.categories (user_id, name, type);

-- Setup Row Level Security (RLS)
alter table public.users enable row level security;
alter table public.user_settings enable row level security;
alter table public.categories enable row level security;

-- Policies for public.users
create policy "Users can view their own profile."
  on public.users for select
  using ( auth.uid() = id );

create policy "Users can update their own profile."
  on public.users for update
  using ( auth.uid() = id );

-- Policies for public.user_settings
create policy "Users can view their own settings."
  on public.user_settings for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own settings."
  on public.user_settings for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own settings."
  on public.user_settings for update
  using ( auth.uid() = user_id );

-- Policies for public.categories
create policy "Users can view their own categories."
  on public.categories for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own categories."
  on public.categories for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own categories."
  on public.categories for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own categories."
  on public.categories for delete
  using ( auth.uid() = user_id );

-- Seed default categories for new users using a trigger on public.users
create or replace function public.seed_default_categories()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  -- Assets
  insert into public.categories (user_id, name, type, is_active) values
    (new.id, 'Cash', 'asset', true),
    (new.id, 'Bank Accounts', 'asset', true),
    (new.id, 'Investments', 'asset', true),
    (new.id, 'Real Estate', 'asset', true);

  -- Liabilities
  insert into public.categories (user_id, name, type, is_active) values
    (new.id, 'Credit Cards', 'liability', true),
    (new.id, 'Mortgage', 'liability', true),
    (new.id, 'Personal Loans', 'liability', true);

  -- Set default user settings
  insert into public.user_settings (user_id, starting_month, starting_year) values
    (new.id, extract(month from current_date), extract(year from current_date));
    
  return new;
end;
$$;

create trigger on_public_user_created
  after insert on public.users
  for each row execute procedure public.seed_default_categories();
