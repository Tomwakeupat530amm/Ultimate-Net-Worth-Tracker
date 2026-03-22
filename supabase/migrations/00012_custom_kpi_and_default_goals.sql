-- 1. Add Custom KPI columns to user_settings
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS custom_kpi_expenses NUMERIC(14,2) DEFAULT 3000,
ADD COLUMN IF NOT EXISTS custom_kpi_return NUMERIC(5,4) DEFAULT 0.07,
ADD COLUMN IF NOT EXISTS custom_kpi_withdrawal NUMERIC(5,4) DEFAULT 0.03;

-- 2. Update the default seed function to include goals
CREATE OR REPLACE FUNCTION public.seed_default_categories()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Assets
  INSERT INTO public.categories (user_id, name, type, is_active) VALUES
    (NEW.id, 'Cash', 'asset', true),
    (NEW.id, 'Bank Accounts', 'asset', true),
    (NEW.id, 'Investments', 'asset', true),
    (NEW.id, 'Real Estate', 'asset', true);

  -- Liabilities
  INSERT INTO public.categories (user_id, name, type, is_active) VALUES
    (NEW.id, 'Credit Cards', 'liability', true),
    (NEW.id, 'Mortgage', 'liability', true),
    (NEW.id, 'Personal Loans', 'liability', true);

  -- Settings
  INSERT INTO public.user_settings (user_id, starting_month, starting_year, custom_kpi_expenses, custom_kpi_return, custom_kpi_withdrawal) 
  VALUES (NEW.id, EXTRACT(month from CURRENT_DATE), EXTRACT(year from CURRENT_DATE), 3000, 0.07, 0.03);

  -- Goals
  INSERT INTO public.goals (user_id, name, target_amount) VALUES
    (NEW.id, 'First 100k', 100000),
    (NEW.id, 'First 250k', 250000),
    (NEW.id, 'First 1M', 1000000),
    (NEW.id, 'FIRE', 2500000);

  RETURN NEW;
END;
$$;

-- 3. Backfill default goals for existing users who do not have them
DO $$
DECLARE
    u RECORD;
BEGIN
    FOR u IN SELECT id FROM public.users
    LOOP
        IF NOT EXISTS (SELECT 1 FROM public.goals WHERE user_id = u.id AND name = 'First 100k') THEN
            INSERT INTO public.goals (user_id, name, target_amount) VALUES (u.id, 'First 100k', 100000);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM public.goals WHERE user_id = u.id AND name = 'First 250k') THEN
            INSERT INTO public.goals (user_id, name, target_amount) VALUES (u.id, 'First 250k', 250000);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM public.goals WHERE user_id = u.id AND name = 'First 1M') THEN
            INSERT INTO public.goals (user_id, name, target_amount) VALUES (u.id, 'First 1M', 1000000);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM public.goals WHERE user_id = u.id AND name = 'FIRE') THEN
            INSERT INTO public.goals (user_id, name, target_amount) VALUES (u.id, 'FIRE', 2500000);
        END IF;
    END LOOP;
END $$;
