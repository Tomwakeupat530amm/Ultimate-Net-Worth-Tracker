-- 1. Dọn dẹp dữ liệu trùng lặp nếu có trước khi thêm constraint
DELETE FROM public.category_groups a 
USING public.category_groups b 
WHERE a.id > b.id 
  AND a.user_id = b.user_id 
  AND a.name = b.name;

-- 2. Thêm unique constraint (kiểm tra trước khi thêm)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'category_groups_user_id_name_key') THEN
        ALTER TABLE public.category_groups ADD CONSTRAINT category_groups_user_id_name_key UNIQUE (user_id, name);
    END IF;
END $$;
