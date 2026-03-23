-- ==========================================================
-- MASTER BACKEND SETUP: Ultimate Net Worth Tracker
-- Version: 1.1 (Includes Performance & Advanced Features)
-- ==========================================================

-- 0. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Core Users Table (Sync with Auth)
CREATE TABLE IF NOT EXISTS public.users (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL PRIMARY KEY,
  email text,
  full_name text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger: Sync Auth users to public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name'
  );
  RETURN new;
END;
$$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
        CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
    END IF;
END $$;

-- 2. User Settings
CREATE TABLE IF NOT EXISTS public.user_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  starting_month integer NOT NULL CHECK (starting_month BETWEEN 1 AND 12),
  starting_year integer NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  latest_month_mode TEXT CHECK (latest_month_mode IN ('strict', 'lazy')) DEFAULT 'strict',
  leverage_ratio_mode TEXT CHECK (leverage_ratio_mode IN ('simple', 'advanced')) DEFAULT 'simple',
  liquid_categories UUID[] DEFAULT '{}',
  custom_kpi_expenses NUMERIC(14,2) DEFAULT 3000,
  custom_kpi_return NUMERIC(5,4) DEFAULT 0.07,
  custom_kpi_withdrawal NUMERIC(5,4) DEFAULT 0.03
);

-- 3. Category Groups & Categories
CREATE TABLE IF NOT EXISTS public.category_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('asset', 'liability')) NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (user_id, name)
);

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'category_type') THEN
        CREATE TYPE public.category_type AS ENUM ('asset', 'liability');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type public.category_type NOT NULL,
  group_id UUID REFERENCES public.category_groups(id) ON DELETE SET NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'categories_user_id_name_type_idx') THEN
        CREATE UNIQUE INDEX categories_user_id_name_type_idx ON public.categories (user_id, name, type);
    END IF;
END $$;

-- 4. Net Worth Entries
CREATE TABLE IF NOT EXISTS public.net_worth_entries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  category_id uuid REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
  month integer NOT NULL CHECK (month BETWEEN 1 AND 12),
  year integer NOT NULL,
  value numeric(14, 2) DEFAULT 0 NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'net_worth_entries_user_category_month_year_idx') THEN
        CREATE UNIQUE INDEX net_worth_entries_user_category_month_year_idx 
        ON public.net_worth_entries (user_id, category_id, month, year);
    END IF;
END $$;

-- 5. Goals
CREATE TABLE IF NOT EXISTS public.goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    target_amount NUMERIC(14,2) NOT NULL,
    target_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Contribution Transactions
CREATE TABLE IF NOT EXISTS public.contribution_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    amount NUMERIC(14,2) NOT NULL,
    details TEXT,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('asset', 'liability')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.net_worth_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contribution_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own profile" ON public.users;
CREATE POLICY "Users can manage their own profile" ON public.users FOR ALL USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can manage their own settings" ON public.user_settings;
CREATE POLICY "Users can manage their own settings" ON public.user_settings FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own category groups" ON public.category_groups;
CREATE POLICY "Users can manage their own category groups" ON public.category_groups FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own categories" ON public.categories;
CREATE POLICY "Users can manage their own categories" ON public.categories FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own net worth entries" ON public.net_worth_entries;
CREATE POLICY "Users can manage their own net worth entries" ON public.net_worth_entries FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own goals" ON public.goals;
CREATE POLICY "Users can manage their own goals" ON public.goals FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own contribution_transactions" ON public.contribution_transactions;
CREATE POLICY "Users can manage their own contribution_transactions" ON public.contribution_transactions FOR ALL USING (auth.uid() = user_id);

-- 8. Seed Default Function
CREATE OR REPLACE FUNCTION public.seed_default_categories()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  default_asset_group uuid;
  default_liability_group uuid;
BEGIN
  -- Create Default Groups
  INSERT INTO public.category_groups (user_id, name, type) 
  VALUES (new.id, 'Asset Categories', 'asset'), (new.id, 'Liability Categories', 'liability')
  ON CONFLICT (user_id, name) DO NOTHING;

  SELECT id INTO default_asset_group FROM public.category_groups WHERE user_id = new.id AND name = 'Asset Categories' LIMIT 1;
  SELECT id INTO default_liability_group FROM public.category_groups WHERE user_id = new.id AND name = 'Liability Categories' LIMIT 1;

  -- Assets
  INSERT INTO public.categories (user_id, name, type, group_id, is_active) VALUES
    (NEW.id, 'Cash', 'asset', default_asset_group, true),
    (NEW.id, 'Bank Accounts', 'asset', default_asset_group, true),
    (NEW.id, 'Investments', 'asset', default_asset_group, true),
    (NEW.id, 'Real Estate', 'asset', default_asset_group, true)
  ON CONFLICT (user_id, name, type) DO NOTHING;

  -- Liabilities
  INSERT INTO public.categories (user_id, name, type, group_id, is_active) VALUES
    (NEW.id, 'Credit Cards', 'liability', default_liability_group, true),
    (NEW.id, 'Mortgage', 'liability', default_liability_group, true),
    (NEW.id, 'Personal Loans', 'liability', default_liability_group, true)
  ON CONFLICT (user_id, name, type) DO NOTHING;

  -- Settings
  INSERT INTO public.user_settings (user_id, starting_month, starting_year, custom_kpi_expenses, custom_kpi_return, custom_kpi_withdrawal) 
  VALUES (NEW.id, EXTRACT(month from CURRENT_DATE), EXTRACT(year from CURRENT_DATE), 3000, 0.07, 0.03)
  ON CONFLICT (user_id) DO NOTHING;

  -- Goals
  INSERT INTO public.goals (user_id, name, target_amount) VALUES
    (NEW.id, 'First 100k', 100000),
    (NEW.id, 'First 250k', 250000),
    (NEW.id, 'First 1M', 1000000),
    (NEW.id, 'FIRE', 2500000)
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_public_user_created') THEN
        CREATE TRIGGER on_public_user_created
          AFTER INSERT ON public.users
          FOR EACH ROW EXECUTE PROCEDURE public.seed_default_categories();
    END IF;
END $$;

-- 9. RPC Functions (Complex Aggregations)
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
            first_value(p.value) OVER (
                PARTITION BY p.category_id, p.value_partition 
                ORDER BY p.month_date
            ), 
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

-- 10. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_net_worth_entries_user_year_month 
ON public.net_worth_entries (user_id, year DESC, month DESC);

CREATE INDEX IF NOT EXISTS idx_contribution_transactions_user_date
ON public.contribution_transactions (user_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_contribution_transactions_category
ON public.contribution_transactions (category_id, date DESC);
