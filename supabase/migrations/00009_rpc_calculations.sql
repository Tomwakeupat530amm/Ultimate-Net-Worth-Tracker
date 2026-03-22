-- Migration: 00009_rpc_calculations.sql
-- Description: Creates RPC functions to compute Net Worth Time Series with Lazy Mode (Fill Forward)
-- and category-level Gain/Cost calculations, moving complex logic to the database layer.

-- 1. Helper Function: get_filled_net_worth_entries
-- This function generates a grid of all months between start and end,
-- and fills missing values forward if p_lazy_mode is true.
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


-- 2. Function: get_dashboard_timeline
-- Returns aggregated assets, liabilities, and cumulative contributions per month
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


-- 3. Function: get_detailed_analysis
-- Returns category-level Start Value, Current Value, Total Contributions, and Gain/Cost
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
