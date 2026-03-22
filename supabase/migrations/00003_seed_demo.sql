-- FILE: seed_demo.sql
-- HƯỚNG DẪN: Đăng ký một tài khoản trên Web App của bạn trước. Sau đó thay chữ 'your_email@example.com' bằng email bạn vừa đăng nhập và chạy script này trong Supabase.

DO $$
DECLARE
  v_user_id uuid;
  v_cat record;
  v_val numeric;
  v_inflow numeric;
  v_outflow numeric;
BEGIN
  -- 1. THAY EMAIL CỦA BẠN VÀO ĐÂY
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'your_email@example.com' LIMIT 1;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Không tìm thấy User. Vui lòng tạo tài khoản trên Web trước!';
  END IF;

  -- 2. Dọn dẹp dữ liệu rác cũ
  DELETE FROM public.net_worth_entries WHERE user_id = v_user_id;
  DELETE FROM public.contributions WHERE user_id = v_user_id;

  -- 3. Tạo data tự động cho 12 tháng (Bắt đầu từ Jan 2026)
  FOR v_cat IN SELECT id, type FROM public.categories WHERE user_id = v_user_id AND is_active = true LOOP
    FOR m IN 1..12 LOOP
      -- Thuật toán tạo số ngẫu nhiên khá logic
      IF v_cat.type = 'asset' THEN
         v_val := 50000000 + (m * 4000000) + (random() * 2000000);
         v_inflow := 1000000 + (random() * 500000);
         v_outflow := 0;
      ELSE
         v_val := 150000000 - (m * 3000000) + (random() * 1000000);
         v_inflow := 0;
         v_outflow := 2000000 + (random() * 500000);
      END IF;
      
      -- Insert Net Worth
      INSERT INTO public.net_worth_entries (user_id, category_id, month, year, value)
      VALUES (v_user_id, v_cat.id, m, 2026, v_val);

      -- Insert Contributions
      INSERT INTO public.contributions (user_id, category_id, month, year, inflow, outflow)
      VALUES (v_user_id, v_cat.id, m, 2026, v_inflow, v_outflow);
    END LOOP;
  END LOOP;
END $$;
