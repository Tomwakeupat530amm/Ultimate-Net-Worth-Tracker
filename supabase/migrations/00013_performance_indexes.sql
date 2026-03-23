-- Migration: 00013_performance_indexes.sql
-- Description: Adds indexes to optimize dashboard data fetching and sorting.

-- 1. Index for net_worth_entries sorting and range queries
-- Optimized for: .order('year', { ascending: false }).order('month', { ascending: false })
-- and filtering by user_id
CREATE INDEX IF NOT EXISTS idx_net_worth_entries_user_year_month 
ON public.net_worth_entries (user_id, year DESC, month DESC);

-- 2. Index for contribution_transactions date filtering
-- Optimized for: .where('user_id', user.id).where('date', '>=', start).where('date', '<', end)
CREATE INDEX IF NOT EXISTS idx_contribution_transactions_user_date
ON public.contribution_transactions (user_id, date DESC);

-- 3. Additional index for category filtering in transactions
CREATE INDEX IF NOT EXISTS idx_contribution_transactions_category
ON public.contribution_transactions (category_id, date DESC);
