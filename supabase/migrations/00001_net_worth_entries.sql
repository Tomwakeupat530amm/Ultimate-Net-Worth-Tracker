create table public.net_worth_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete cascade not null,
  month integer not null check (month between 1 and 12),
  year integer not null,
  value numeric(14, 2) default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure a user can only have one entry per category per month/year
create unique index net_worth_entries_user_category_month_year_idx 
on public.net_worth_entries (user_id, category_id, month, year);

alter table public.net_worth_entries enable row level security;

create policy "Users can view their own net worth entries."
  on public.net_worth_entries for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own net worth entries."
  on public.net_worth_entries for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own net worth entries."
  on public.net_worth_entries for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own net worth entries."
  on public.net_worth_entries for delete
  using ( auth.uid() = user_id );
