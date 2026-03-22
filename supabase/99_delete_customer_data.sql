-- ==============================================================================
-- DELETE CUSTOMER DATA SCRIPT
-- ==============================================================================
-- This script completely wipes all data for a specific user from the database.
-- Because of the 'ON DELETE CASCADE' foreign keys defined in the schema, 
-- deleting the user from the 'auth.users' table will automatically remove:
--   1. Their profile in 'public.users'
--   2. Their settings in 'public.user_settings'
--   3. All their custom categories in 'public.categories'
--   4. All their historical entries in 'public.net_worth_entries'
--   5. All their transactions in 'public.contributions'
--   6. All their category groups & specific contribution transactions
--
-- INSTRUCTIONS:
-- Replace 'customer@example.com' with the email of the customer you want to delete.
-- Then run this in the Supabase SQL Editor.
-- ==============================================================================

-- 1. SETUP: ONLY CHANGE THE EMAIL BELOW
DROP TABLE IF EXISTS target_user_info;
CREATE TEMP TABLE target_user_info AS SELECT id FROM auth.users WHERE email = 'customer@example.com';

-- CHIA LÀM 2 TRƯỜNG HỢP:

/*
-- TRƯỜNG HỢP 1: XÓA TOÀN BỘ (BAO GỒM CẢ TÀI KHOẢN ĐĂNG NHẬP)
DELETE FROM auth.users 
WHERE id = (SELECT id FROM target_user_info);
*/

-- TRƯỜNG HỢP 2: CHỈ XÓA DỮ LIỆU TÀI CHÍNH (GIỮ LẠI TÀI KHOẢN & DANH MỤC)
BEGIN;
DELETE FROM public.net_worth_entries WHERE user_id = (SELECT id FROM target_user_info);
DELETE FROM public.contribution_transactions WHERE user_id = (SELECT id FROM target_user_info);
COMMIT;
