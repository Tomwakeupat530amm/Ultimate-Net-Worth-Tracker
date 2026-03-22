-- Migration: 00011_fix_chart_logic_for_all_users.sql
-- Description: System-wide fix for chart data. Enforces LOCF (Last Observation Carried Forward) 
-- unconditionally so charts never drop to 0 unexpectedly, fixing the issue for ALL users.

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
            -- FORCE Lazy Mode (LOCF) system-wide! Regardless of frontend parameters.
            -- This guarantees data never drops to 0 just because a month was skipped.
            first_value(p.value) OVER (
                PARTITION BY p.category_id, p.value_partition 
                ORDER BY p.month_date
            ), 
        0) AS value
    FROM partitioned p;
END;
$$;
