-- Kịch bản Seed Data (Giả lập Số liệu 2 năm: Jan 2024 -> Dec 2025)
DO $$ 
DECLARE
  local_user_id uuid;
  asset_group uuid;
  liability_group uuid;
  cat_cash uuid;
  cat_equities uuid;
  cat_bonds uuid;
  cat_real_estate uuid;
  cat_mortgage uuid;
  cat_loans uuid;
  current_month int;
  current_year int;
BEGIN
  -- Lấy chính xác User ID dựa trên email của bạn
  SELECT id INTO local_user_id FROM public.users WHERE email = 'minhnguyentuan31103@gmail.com';
  
  IF local_user_id IS NULL THEN
    RAISE EXCEPTION 'Không tìm thấy tài khoản minhnguyentuan31103@gmail.com trong hệ thống. Hãy đảm bảo bạn đã đăng ký tài khoản này trước.';
  END IF;

  -- 1. XÓA DỮ LIỆU CŨ (Reset toàn bộ rác hoặc phiên bản cũ)
  DELETE FROM public.net_worth_entries WHERE user_id = local_user_id;
  DELETE FROM public.contribution_transactions WHERE user_id = local_user_id;
  DELETE FROM public.goals WHERE user_id = local_user_id;
  DELETE FROM public.categories WHERE user_id = local_user_id;
  DELETE FROM public.category_groups WHERE user_id = local_user_id;

  -- 2. CẤU HÌNH USER SETTINGS (Bắt đầu tracking từ 1/2024)
  INSERT INTO public.user_settings (user_id, starting_month, starting_year, leverage_ratio_mode)
  VALUES (local_user_id, 1, 2024, 'advanced')
  ON CONFLICT (user_id) DO UPDATE SET starting_month = 1, starting_year = 2024, leverage_ratio_mode = 'advanced';

  -- 3. TẠO CATEGORY GROUPS (Nhóm danh mục)
  INSERT INTO public.category_groups (user_id, name, type) VALUES (local_user_id, 'Asset Categories', 'asset') RETURNING id INTO asset_group;
  INSERT INTO public.category_groups (user_id, name, type) VALUES (local_user_id, 'Liability Categories', 'liability') RETURNING id INTO liability_group;

  -- 4. TẠO CATEGORIES (Danh mục cụ thể theo File Excel Mẫu)
  INSERT INTO public.categories (user_id, name, type, group_id, is_active) VALUES (local_user_id, 'Cash', 'asset', asset_group, true) RETURNING id INTO cat_cash;
  INSERT INTO public.categories (user_id, name, type, group_id, is_active) VALUES (local_user_id, 'Equities', 'asset', asset_group, true) RETURNING id INTO cat_equities;
  INSERT INTO public.categories (user_id, name, type, group_id, is_active) VALUES (local_user_id, 'Bonds', 'asset', asset_group, true) RETURNING id INTO cat_bonds;
  INSERT INTO public.categories (user_id, name, type, group_id, is_active) VALUES (local_user_id, 'Real Estate', 'asset', asset_group, true) RETURNING id INTO cat_real_estate;
  
  INSERT INTO public.categories (user_id, name, type, group_id, is_active) VALUES (local_user_id, 'Mortgage', 'liability', liability_group, true) RETURNING id INTO cat_mortgage;
  INSERT INTO public.categories (user_id, name, type, group_id, is_active) VALUES (local_user_id, 'Student Loans', 'liability', liability_group, true) RETURNING id INTO cat_loans;

  -- Đặt Cash & Equities & Bonds làm Liquid Assets (Tài sản thanh khoản cao)
  UPDATE public.user_settings SET liquid_categories = ARRAY[cat_cash, cat_equities, cat_bonds]::uuid[] WHERE user_id = local_user_id;

  -- 5. TẠO GOALS (Mục tiêu Kế hoạch Tracking)
  INSERT INTO public.goals (user_id, name, target_amount, target_date) VALUES 
    (local_user_id, 'First 100k', 100000, '2027-12-31'),
    (local_user_id, 'First 250k', 250000, '2029-12-31'),
    (local_user_id, 'First 1M', 1000000, NULL),
    (local_user_id, 'FIRE', 2500000, NULL);

  -- 6. TẠO LỊCH SỬ THÁNG (24 Tháng - Jan 2024 tới Dec 2025)
  current_month := 1;
  current_year := 2024;
  
  FOR i IN 0..23 LOOP
    -- GIẢ LẬP SỔ TÀI SẢN MỖI THÁNG (Sự tăng giá/giảm giá tự nhiên của thị trường)
    INSERT INTO public.net_worth_entries (user_id, category_id, month, year, value) VALUES
      (local_user_id, cat_cash, current_month, current_year, 5000 + (i * 350)),  -- Tiền mặt tăng dần
      (local_user_id, cat_equities, current_month, current_year, 10000 + (i * i * 80)), -- Chứng khoán lãi kép (Đường cong Exponential)
      (local_user_id, cat_bonds, current_month, current_year, 15000 + (i * 120)), -- Trái phiếu tăng đều (Đường Line tà tà)
      (local_user_id, cat_real_estate, current_month, current_year, 150000 + (i * 800)); -- Bất động sản tăng đều (Market Apprecation)
      
    INSERT INTO public.net_worth_entries (user_id, category_id, month, year, value) VALUES
      (local_user_id, cat_mortgage, current_month, current_year, 120000 - (i * 1200)), -- Trả gốc vay mua nhà (Nợ giảm dần)
      (local_user_id, cat_loans, current_month, current_year, 35000 - (i * 800)); -- Trả gốc vay sinh viên (Nợ giảm dần)
      
    -- GIẢ LẬP SỔ GIAO DỊCH DÒNG TIỀN (Sổ cái Contributions)
    -- Dòng tiền nạp vào Chứng khoán (In-flow Cống hiến)
    IF i % 2 = 0 THEN
       INSERT INTO public.contribution_transactions (user_id, category_id, type, amount, date)
       VALUES (local_user_id, cat_equities, 'asset', 1500, make_date(current_year, current_month, 10));
    END IF;

    -- Dòng tiền trả Nợ vượt tiến độ (In-flow to Net Worth)
    IF i % 3 = 0 THEN
       INSERT INTO public.contribution_transactions (user_id, category_id, type, amount, date)
       VALUES (local_user_id, cat_loans, 'liability', 1000, make_date(current_year, current_month, 20));
    END IF;

    -- Dòng tiền Trích lập Quỹ khẩn cấp (Chuyển tiền mặt)
    INSERT INTO public.contribution_transactions (user_id, category_id, type, amount, date)
    VALUES (local_user_id, cat_cash, 'asset', 500, make_date(current_year, current_month, 5));

    -- Roll-over Tháng (Chuyển tháng/năm)
    current_month := current_month + 1;
    IF current_month > 12 THEN
       current_month := 1;
       current_year := current_year + 1;
    END IF;
  END LOOP;
END $$;
