-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- Migration: 00000_init_schema.sql
-- ==========================================

-- 1. Create a public.users table to mirror auth.users
create table if not exists public.users (
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

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
        create trigger on_auth_user_created
          after insert on auth.users
          for each row execute procedure public.handle_new_user();
    END IF;
END $$;

-- 2. Create user_settings table
create table if not exists public.user_settings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null unique,
  starting_month integer not null check (starting_month between 1 and 12),
  starting_year integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create categories table
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'category_type') THEN
        create type public.category_type as enum ('asset', 'liability');
    END IF;
END $$;

create table if not exists public.categories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  name text not null,
  type public.category_type not null,
  is_active boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Allow users to have unique category names per type
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'categories_user_id_name_type_idx') THEN
        create unique index categories_user_id_name_type_idx on public.categories (user_id, name, type);
    END IF;
END $$;

-- Setup Row Level Security (RLS)
alter table public.users enable row level security;
alter table public.user_settings enable row level security;
alter table public.categories enable row level security;

-- Policies for public.users
DROP POLICY IF EXISTS "Users can view their own profile." ON public.users;
create policy "Users can view their own profile."
  on public.users for select
  using ( auth.uid() = id );

DROP POLICY IF EXISTS "Users can update their own profile." ON public.users;
create policy "Users can update their own profile."
  on public.users for update
  using ( auth.uid() = id );

-- Policies for public.user_settings
DROP POLICY IF EXISTS "Users can view their own settings." ON public.user_settings;
create policy "Users can view their own settings."
  on public.user_settings for select
  using ( auth.uid() = user_id );

DROP POLICY IF EXISTS "Users can insert their own settings." ON public.user_settings;
create policy "Users can insert their own settings."
  on public.user_settings for insert
  with check ( auth.uid() = user_id );

DROP POLICY IF EXISTS "Users can update their own settings." ON public.user_settings;
create policy "Users can update their own settings."
  on public.user_settings for update
  using ( auth.uid() = user_id );

-- Policies for public.categories
DROP POLICY IF EXISTS "Users can view their own categories." ON public.categories;
create policy "Users can view their own categories."
  on public.categories for select
  using ( auth.uid() = user_id );

DROP POLICY IF EXISTS "Users can insert their own categories." ON public.categories;
create policy "Users can insert their own categories."
  on public.categories for insert
  with check ( auth.uid() = user_id );

DROP POLICY IF EXISTS "Users can update their own categories." ON public.categories;
create policy "Users can update their own categories."
  on public.categories for update
  using ( auth.uid() = user_id );

DROP POLICY IF EXISTS "Users can delete their own categories." ON public.categories;
create policy "Users can delete their own categories."
  on public.categories for delete
  using ( auth.uid() = user_id );

-- Seed default categories for new users using a trigger on public.users
create or replace function public.seed_default_categories()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  default_asset_group uuid;
  default_liability_group uuid;
begin
  -- Create Default Groups
  insert into public.category_groups (user_id, name, type) 
  values (new.id, 'Asset Categories', 'asset') 
  on conflict (user_id, name) do nothing;

  insert into public.category_groups (user_id, name, type) 
  values (new.id, 'Liability Categories', 'liability') 
  on conflict (user_id, name) do nothing;

  select id into default_asset_group from public.category_groups where user_id = new.id and name = 'Asset Categories' limit 1;
  select id into default_liability_group from public.category_groups where user_id = new.id and name = 'Liability Categories' limit 1;

  -- Assets
  insert into public.categories (user_id, name, type, group_id, is_active) values
    (new.id, 'Cash', 'asset', default_asset_group, true),
    (new.id, 'Equities', 'asset', default_asset_group, true),
    (new.id, 'Bonds', 'asset', default_asset_group, true),
    (new.id, 'Real Estate', 'asset', default_asset_group, true),
    (new.id, 'Pensions', 'asset', default_asset_group, true),
    (new.id, 'Collectibles', 'asset', default_asset_group, true),
    (new.id, 'Vehicles', 'asset', default_asset_group, true)
  on conflict (user_id, name, type) do nothing;

  -- Liabilities
  insert into public.categories (user_id, name, type, group_id, is_active) values
    (new.id, 'Credit Card Debt', 'liability', default_liability_group, true),
    (new.id, 'Mortgage', 'liability', default_liability_group, true),
    (new.id, 'Student Loans', 'liability', default_liability_group, true),
    (new.id, 'Personal Loans', 'liability', default_liability_group, true),
    (new.id, 'Car Loans', 'liability', default_liability_group, true)
  on conflict (user_id, name, type) do nothing;

  -- Set default user settings
  insert into public.user_settings (user_id, starting_month, starting_year) 
  values (new.id, extract(month from current_date), extract(year from current_date))
  on conflict (user_id) do nothing;
    
  return new;
end;
$$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_public_user_created') THEN
        create trigger on_public_user_created
          after insert on public.users
          for each row execute procedure public.seed_default_categories();
    END IF;
END $$;


-- ==========================================
-- Migration: 00001_net_worth_entries.sql
-- ==========================================

create table if not exists public.net_worth_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete cascade not null,
  month integer not null check (month between 1 and 12),
  year integer not null,
  value numeric(14, 2) default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'net_worth_entries_user_category_month_year_idx') THEN
        create unique index net_worth_entries_user_category_month_year_idx 
        on public.net_worth_entries (user_id, category_id, month, year);
    END IF;
END $$;

alter table public.net_worth_entries enable row level security;

DROP POLICY IF EXISTS "Users can manage their own net worth entries." ON public.net_worth_entries;
create policy "Users can manage their own net worth entries."
  on public.net_worth_entries for all
  using ( auth.uid() = user_id );


-- ==========================================
-- Migration: 00005_advanced_schema.sql
-- ==========================================

-- 1. Alter user_settings
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS latest_month_mode TEXT CHECK (latest_month_mode IN ('strict', 'lazy')) DEFAULT 'strict',
ADD COLUMN IF NOT EXISTS leverage_ratio_mode TEXT CHECK (leverage_ratio_mode IN ('simple', 'advanced')) DEFAULT 'simple',
ADD COLUMN IF NOT EXISTS liquid_categories UUID[] DEFAULT '{}';

-- 2. Create category_groups
CREATE TABLE IF NOT EXISTS category_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('asset', 'liability')) NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (user_id, name)
);

ALTER TABLE category_groups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own category groups" ON category_groups;
CREATE POLICY "Users can manage their own category groups" ON category_groups FOR ALL USING (auth.uid() = user_id);

-- 3. Alter categories
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES category_groups(id) ON DELETE SET NULL;

-- 4. Create goals table
CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    target_amount NUMERIC(14,2) NOT NULL,
    target_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own goals" ON goals;
CREATE POLICY "Users can manage their own goals" ON goals FOR ALL USING (auth.uid() = user_id);

-- 5. Create contribution_transactions
CREATE TABLE IF NOT EXISTS contribution_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    amount NUMERIC(14,2) NOT NULL,
    details TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('asset', 'liability')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE contribution_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own contribution_transactions" ON contribution_transactions;
CREATE POLICY "Users can manage their own contribution_transactions" ON contribution_transactions FOR ALL USING (auth.uid() = user_id);


-- ==========================================
-- Migration: 00009_rpc_calculations.sql
-- ==========================================

CREATE OR REPLACE FUNCTION public.get_filled_net_worth_entries(
    p_user_id UUID,
    p_start_date DATE,
    p_end_date DATE,
    p_lazy_mode BOOLEAN
)
RETURNS TABLE (
    month_date DATE,
    category_id UUID,
    category_type TEXT,
    is_liquid BOOLEAN,
    value NUMERIC
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN QUERY
    WITH months AS (
        SELECT generate_series(
            date_trunc('month', p_start_date),
            date_trunc('month', p_end_date),
            '1 month'::interval
        )::date AS m_date
    ),
    user_cats AS (
        SELECT c.id, c.type::text as type, 
               (c.id = ANY (COALESCE((SELECT liquid_categories FROM user_settings WHERE user_id = p_user_id), '{}'::uuid[]))) AS is_liquid
        FROM categories c
        WHERE c.user_id = p_user_id AND c.is_active = true
    ),
    grid AS (
        SELECT m.m_date as month_date, u.id as category_id, u.type as category_type, u.is_liquid
        FROM months m CROSS JOIN user_cats u
    ),
    raw_entries AS (
        SELECT 
            make_date(n.year, n.month, 1) AS month_date,
            n.category_id,
            n.value
        FROM net_worth_entries n
        WHERE n.user_id = p_user_id
    ),
    joined AS (
        SELECT 
            g.month_date, g.category_id, g.category_type, g.is_liquid, r.value
        FROM grid g
        LEFT JOIN raw_entries r 
            ON g.month_date = r.month_date AND g.category_id = r.category_id
    ),
    partitioned AS (
        SELECT 
            j.month_date, j.category_id, j.category_type, j.is_liquid, j.value,
            SUM(CASE WHEN j.value IS NOT NULL THEN 1 ELSE 0 END) OVER (
                PARTITION BY j.category_id ORDER BY j.month_date
            ) as value_partition
        FROM joined j
    )
    SELECT 
        p.month_date, 
        p.category_id, 
        p.category_type, 
        p.is_liquid,
        COALESCE(
            CASE 
                WHEN p_lazy_mode THEN 
                    first_value(p.value) OVER (
                        PARTITION BY p.category_id, p.value_partition 
                        ORDER BY p.month_date
                    )
                ELSE p.value
            END, 
        0) AS value
    FROM partitioned p;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_dashboard_timeline(
    p_start_date DATE,
    p_end_date DATE,
    p_lazy_mode BOOLEAN DEFAULT true
)
RETURNS TABLE (
    month_date DATE,
    total_assets NUMERIC,
    total_liabilities NUMERIC,
    total_liquid_assets NUMERIC,
    month_asset_contributions NUMERIC,
    month_liability_contributions NUMERIC,
    cum_asset_contributions NUMERIC,
    cum_liability_contributions NUMERIC
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_user_id UUID := auth.uid();
BEGIN
    RETURN QUERY
    WITH filled_entries AS (
        SELECT * FROM public.get_filled_net_worth_entries(v_user_id, p_start_date, p_end_date, p_lazy_mode)
    ),
    monthly_nw AS (
        SELECT 
            fe.month_date,
            SUM(CASE WHEN fe.category_type = 'asset' THEN fe.value ELSE 0 END) as total_assets,
            SUM(CASE WHEN fe.category_type = 'liability' THEN fe.value ELSE 0 END) as total_liabilities,
            SUM(CASE WHEN fe.is_liquid THEN fe.value ELSE 0 END) as total_liquid_assets
        FROM filled_entries fe
        GROUP BY fe.month_date
    ),
    monthly_trans AS (
        SELECT 
            date_trunc('month', t.date)::date as month_date,
            SUM(CASE WHEN t.type = 'asset' THEN t.amount ELSE 0 END) as m_asset_contributions,
            SUM(CASE WHEN t.type = 'liability' THEN t.amount ELSE 0 END) as m_liability_contributions
        FROM contribution_transactions t
        WHERE t.user_id = v_user_id
          AND t.date >= date_trunc('month', p_start_date)
          AND t.date < (date_trunc('month', p_end_date) + '1 month'::interval)
        GROUP BY date_trunc('month', t.date)::date
    ),
    grid AS (
        SELECT m.month_date, 
               COALESCE(nw.total_assets, 0) as total_assets,
               COALESCE(nw.total_liabilities, 0) as total_liabilities,
               COALESCE(nw.total_liquid_assets, 0) as total_liquid_assets,
               COALESCE(mt.m_asset_contributions, 0) as month_asset_contributions,
               COALESCE(mt.m_liability_contributions, 0) as month_liability_contributions
        FROM (
            SELECT generate_series(
                date_trunc('month', p_start_date),
                date_trunc('month', p_end_date),
                '1 month'::interval
            )::date AS month_date
        ) m
        LEFT JOIN monthly_nw nw ON m.month_date = nw.month_date
        LEFT JOIN monthly_trans mt ON m.month_date = mt.month_date
    )
    SELECT 
        g.month_date,
        g.total_assets,
        g.total_liabilities,
        g.total_liquid_assets,
        g.month_asset_contributions,
        g.month_liability_contributions,
        SUM(g.month_asset_contributions) OVER (ORDER BY g.month_date) AS cum_asset_contributions,
        SUM(g.month_liability_contributions) OVER (ORDER BY g.month_date) AS cum_liability_contributions
    FROM grid g
    ORDER BY g.month_date;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_detailed_analysis(
    p_start_date DATE,
    p_end_date DATE,
    p_lazy_mode BOOLEAN DEFAULT true
)
RETURNS TABLE (
    category_id UUID,
    category_type TEXT,
    category_name TEXT,
    start_value NUMERIC,
    current_value NUMERIC,
    total_contributions NUMERIC,
    gain_or_cost NUMERIC
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_user_id UUID := auth.uid();
BEGIN
    RETURN QUERY
    WITH filled_entries AS (
        SELECT * FROM public.get_filled_net_worth_entries(v_user_id, p_start_date, p_end_date, p_lazy_mode)
    ),
    start_entries AS (
        SELECT f.category_id, f.value as start_val
        FROM filled_entries f
        WHERE f.month_date = date_trunc('month', p_start_date)::date
    ),
    current_entries AS (
        SELECT f.category_id, f.value as current_val
        FROM filled_entries f
        WHERE f.month_date = date_trunc('month', p_end_date)::date
    ),
    cat_trans AS (
        SELECT 
            t.category_id,
            SUM(t.amount) as total_contributions
        FROM contribution_transactions t
        WHERE t.user_id = v_user_id
          AND t.date >= date_trunc('month', p_start_date)
          AND t.date < (date_trunc('month', p_end_date) + '1 month'::interval)
        GROUP BY t.category_id
    )
    SELECT 
        c.id AS category_id,
        c.type::text AS category_type,
        c.name AS category_name,
        COALESCE(se.start_val, 0) AS start_value,
        COALESCE(ce.current_val, 0) AS current_value,
        COALESCE(ct.total_contributions, 0) AS total_contributions,
        CASE 
            WHEN c.type = 'asset' THEN 
                COALESCE(ce.current_val, 0) - COALESCE(se.start_val, 0) - COALESCE(ct.total_contributions, 0)
            ELSE 
                COALESCE(se.start_val, 0) - COALESCE(ce.current_val, 0) - COALESCE(ct.total_contributions, 0)
        END AS gain_or_cost
    FROM categories c
    LEFT JOIN start_entries se ON c.id = se.category_id
    LEFT JOIN current_entries ce ON c.id = ce.category_id
    LEFT JOIN cat_trans ct ON c.id = ct.category_id
    WHERE c.user_id = v_user_id AND c.is_active = true
    ORDER BY c.type, COALESCE(ce.current_val, 0) DESC;
END;
$$;
