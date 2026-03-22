-- 1. Alter user_settings
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS latest_month_mode TEXT CHECK (latest_month_mode IN ('strict', 'lazy')) DEFAULT 'strict',
ADD COLUMN IF NOT EXISTS leverage_ratio_mode TEXT CHECK (leverage_ratio_mode IN ('simple', 'advanced')) DEFAULT 'simple',
ADD COLUMN IF NOT EXISTS liquid_categories UUID[] DEFAULT '{}';

-- 2. Create category_groups
CREATE TABLE IF NOT EXISTS category_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('asset', 'liability')) NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE category_groups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own category groups" ON category_groups;
CREATE POLICY "Users can manage their own category groups" ON category_groups FOR ALL USING (auth.uid() = user_id);


-- 3. Alter categories
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES category_groups(id) ON DELETE SET NULL;


-- 4. Create goals table
CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    target_amount NUMERIC(14,2) NOT NULL,
    target_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own goals" ON goals;
CREATE POLICY "Users can manage their own goals" ON goals FOR ALL USING (auth.uid() = user_id);


-- 5. Drop old contributions and create new ledger table
DROP TABLE IF EXISTS contributions CASCADE;

CREATE TABLE IF NOT EXISTS contribution_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    amount NUMERIC(14,2) NOT NULL,
    details TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('asset', 'liability')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE contribution_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own contribution_transactions" ON contribution_transactions;
CREATE POLICY "Users can manage their own contribution_transactions" ON contribution_transactions FOR ALL USING (auth.uid() = user_id);
