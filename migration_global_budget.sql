-- Global Budget Table for 'Single Budget' feature
create table public.global_budgets (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid default auth.uid(),
    amount_limit numeric not null,
    month_year text not null, -- Format 'YYYY-MM'
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, month_year)
);
