-- Cập nhật hàm trigger tạo mặc định theo danh sách chuẩn từ bản Excel mẫu
create or replace function public.seed_default_categories()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  default_asset_group uuid;
  default_liability_group uuid;
begin
  -- Create Default Groups để các Category luôn có nhóm (Sub-Total)
  insert into public.category_groups (user_id, name, type) 
  values (new.id, 'Asset Categories', 'asset') 
  returning id into default_asset_group;

  insert into public.category_groups (user_id, name, type) 
  values (new.id, 'Liability Categories', 'liability') 
  returning id into default_liability_group;

  -- Insert Khớp hoàn toàn với Danh sách File Excel Mẫu (Assets)
  insert into public.categories (user_id, name, type, group_id, is_active) values
    (new.id, 'Cash', 'asset', default_asset_group, true),
    (new.id, 'Equities', 'asset', default_asset_group, true),
    (new.id, 'Bonds', 'asset', default_asset_group, true),
    (new.id, 'Real Estate', 'asset', default_asset_group, true),
    (new.id, 'Pensions', 'asset', default_asset_group, true),
    (new.id, 'Collectibles', 'asset', default_asset_group, true),
    (new.id, 'Vehicles', 'asset', default_asset_group, true);

  -- Insert Khớp hoàn toàn với Danh sách File Excel Mẫu (Liabilities)
  insert into public.categories (user_id, name, type, group_id, is_active) values
    (new.id, 'Credit Card Debt', 'liability', default_liability_group, true),
    (new.id, 'Mortgage', 'liability', default_liability_group, true),
    (new.id, 'Student Loans', 'liability', default_liability_group, true),
    (new.id, 'Personal Loans', 'liability', default_liability_group, true),
    (new.id, 'Car Loans', 'liability', default_liability_group, true);

  -- Handle user_settings upsert to avoid duplicate errors nếu trigger bị chạy nhiều lần
  insert into public.user_settings (user_id, starting_month, starting_year) 
  values (new.id, extract(month from current_date), extract(year from current_date))
  on conflict (user_id) do nothing;
    
  return new;
end;
$$;

-- Seed script cho các User Đang Tồn Tại (Ví dụ bạn đã đăng ký tài khoản từ trước và vừa chạy reset_data_00006 làm trống DB)
DO $$ 
DECLARE
    user_record RECORD;
    has_categories BOOLEAN;
    default_asset_group uuid;
    default_liability_group uuid;
BEGIN
    FOR user_record IN SELECT id FROM public.users LOOP
        -- Kiểm tra xem user có category nào chưa (để tránh tạo trùng)
        SELECT EXISTS (
            SELECT 1 FROM public.categories WHERE user_id = user_record.id
        ) INTO has_categories;
        
        IF NOT has_categories THEN
            -- Tạo Group Asset
            INSERT INTO public.category_groups (user_id, name, type) 
            VALUES (user_record.id, 'Asset Categories', 'asset') 
            RETURNING id INTO default_asset_group;

            -- Tạo Group Liability
            INSERT INTO public.category_groups (user_id, name, type) 
            VALUES (user_record.id, 'Liability Categories', 'liability') 
            RETURNING id INTO default_liability_group;
            
            -- Assets
            INSERT INTO public.categories (user_id, name, type, group_id, is_active) VALUES
                (user_record.id, 'Cash', 'asset', default_asset_group, true),
                (user_record.id, 'Equities', 'asset', default_asset_group, true),
                (user_record.id, 'Bonds', 'asset', default_asset_group, true),
                (user_record.id, 'Real Estate', 'asset', default_asset_group, true),
                (user_record.id, 'Pensions', 'asset', default_asset_group, true),
                (user_record.id, 'Collectibles', 'asset', default_asset_group, true),
                (user_record.id, 'Vehicles', 'asset', default_asset_group, true);

            -- Liabilities
            INSERT INTO public.categories (user_id, name, type, group_id, is_active) VALUES
                (user_record.id, 'Credit Card Debt', 'liability', default_liability_group, true),
                (user_record.id, 'Mortgage', 'liability', default_liability_group, true),
                (user_record.id, 'Student Loans', 'liability', default_liability_group, true),
                (user_record.id, 'Personal Loans', 'liability', default_liability_group, true),
                (user_record.id, 'Car Loans', 'liability', default_liability_group, true);
                
            -- Ensure user_settings exists
            INSERT INTO public.user_settings (user_id, starting_month, starting_year) 
            VALUES (user_record.id, extract(month from current_date), extract(year from current_date))
            ON CONFLICT (user_id) DO NOTHING;
                
        END IF;
    END LOOP;
END $$;
