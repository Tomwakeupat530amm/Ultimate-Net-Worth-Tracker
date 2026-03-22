-- FILE: reset_data.sql
-- HƯỚNG DẪN: Chạy lệnh này để QUÉT SẠCH toàn bộ số tiền đã nhập, trả App về trạng thái trống trơn như mới trước khi bàn giao cho Khách Hàng.

DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- 1. THAY EMAIL TÀI KHOẢN KHÁCH HÀNG VÀO ĐÂY
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'your_email@example.com' LIMIT 1;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Không tìm thấy User. Vui lòng check lại Email!';
  END IF;

  -- 2. CHỈ xóa data nhập tay (Net Worth và Contributions)
  DELETE FROM public.net_worth_entries WHERE user_id = v_user_id;
  DELETE FROM public.contributions WHERE user_id = v_user_id;
  
  -- 3. Reset lịch bắt đầu về Tháng 1, Năm 2026
  UPDATE public.user_settings 
  SET starting_month = 1, starting_year = 2026 
  WHERE user_id = v_user_id;
  
  -- LƯU Ý: Không xóa Categories và Users. Để khách hàng không phải setup danh mục lại từ đầu.
END $$;
