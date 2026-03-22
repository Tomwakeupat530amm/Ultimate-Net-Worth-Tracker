create table public.contributions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete cascade not null,
  month integer not null check (month between 1 and 12),
  year integer not null,
  inflow numeric(14, 2) default 0 not null,
  outflow numeric(14, 2) default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create unique index contributions_user_category_month_year_idx 
on public.contributions (user_id, category_id, month, year);

alter table public.contributions enable row level security;

create policy "Users can view their own contributions."
  on public.contributions for select using ( auth.uid() = user_id );

create policy "Users can insert their own contributions."
  on public.contributions for insert with check ( auth.uid() = user_id );

create policy "Users can update their own contributions."
  on public.contributions for update using ( auth.uid() = user_id );

create policy "Users can delete their own contributions."
  on public.contributions for delete using ( auth.uid() = user_id );
