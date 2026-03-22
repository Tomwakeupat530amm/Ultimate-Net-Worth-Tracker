-- Script để reset toàn bộ dữ liệu, chuẩn bị bàn giao cho khách hàng (Zero State)
-- CẢNH BÁO: Chạy script này sẽ XÓA TOÀN BỘ dữ liệu của TẤT CẢ User trong hệ thống hiện tại.

BEGIN;

TRUNCATE TABLE contribution_transactions CASCADE;
TRUNCATE TABLE net_worth_entries CASCADE;
TRUNCATE TABLE goals CASCADE;
TRUNCATE TABLE categories CASCADE;
TRUNCATE TABLE category_groups CASCADE;
TRUNCATE TABLE user_settings CASCADE;

-- Có thể tùy chọn xóa toàn bộ user trong auth.users nếu cần thiết (cần quền superuser)
-- delete from auth.users;

COMMIT;

-- Lưu ý: Sau khi truncate bảng, để tạo lại dữ liệu demo, có thể chạy lại file 00003_seed_demo.sql (với schema cũ) hoặc tự đăng ký Account mới.
