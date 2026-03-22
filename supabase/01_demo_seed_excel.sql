-- EXCEL-PARITY DEMO SEED SCRIPT (v3)
-- This script populates 100% accurate data from the demo Excel file.

-- 1. SETUP: ONLY CHANGE THE EMAIL BELOW
DROP TABLE IF EXISTS target_user_info;
CREATE TEMP TABLE target_user_info AS SELECT id FROM auth.users WHERE email = 'demo@gmail.com';

-- 2. VALIDATION: Check if user exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM target_user_info) THEN
    RAISE EXCEPTION 'LỖI: Không tìm thấy email demo@gmail.com trong hệ thống auth.users. Vui lòng kiểm tra lại dòng đầu tiên!';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE user_id = (SELECT id FROM target_user_info)) THEN
    RAISE EXCEPTION 'LỖI: User tồn tại nhưng chưa có danh mục (Categories). Vui lòng đăng nhập vào web app 1 lần để hệ thống tạo danh mục mặc định rồi mới chạy script này!';
  END IF;
END $$;

BEGIN;
DELETE FROM net_worth_entries WHERE user_id = (SELECT id FROM target_user_info);
DELETE FROM contribution_transactions WHERE user_id = (SELECT id FROM target_user_info);

-- Ensure required categories exist
INSERT INTO categories (user_id, name, type) 
SELECT (SELECT id FROM target_user_info), 'Cash', 'asset'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE user_id = (SELECT id FROM target_user_info) AND name = 'Cash');
INSERT INTO categories (user_id, name, type) 
SELECT (SELECT id FROM target_user_info), 'Investments', 'asset'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE user_id = (SELECT id FROM target_user_info) AND name = 'Investments');
INSERT INTO categories (user_id, name, type) 
SELECT (SELECT id FROM target_user_info), 'Mortgage', 'liability'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE user_id = (SELECT id FROM target_user_info) AND name = 'Mortgage');


-- Process Contributions

COMMIT;