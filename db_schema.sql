-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Categories Table
create table public.categories (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid default auth.uid(), -- Optional: for RLS if needed later
    name text not null,
    type text check (type in ('income', 'expense')) not null,
    icon text, -- URL or emoji
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Transactions Table
create table public.transactions (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid default auth.uid(),
    amount numeric not null,
    type text check (type in ('income', 'expense')) not null,
    category_id uuid references public.categories(id) on delete set null,
    description text,
    transaction_date date default current_date not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Budgets Table
create table public.budgets (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid default auth.uid(),
    category_id uuid references public.categories(id) on delete cascade,
    amount_limit numeric not null,
    month_year text not null, -- Format 'YYYY-MM'
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(category_id, month_year)
);

-- Initial Categories Seed Data
insert into public.categories (name, type, icon) values
('Salary', 'income', '💰'),
('Freelance', 'income', '💻'),
('Food', 'expense', '🍔'),
('Transport', 'expense', '🚗'),
('Rent', 'expense', '🏠'),
('Entertainment', 'expense', '🎬'),
('Shopping', 'expense', '🛍️'),
('Utilities', 'expense', '💡'),
('Health', 'expense', '🏥'),
('Other', 'expense', '📦');
