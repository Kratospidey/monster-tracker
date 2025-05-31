-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create drinks table
create table if not exists public.drinks (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default now(),
  name text not null,
  series text not null,
  volume_ml integer not null,
  cost numeric not null,
  rating integer not null check (rating between 1 and 5),
  notes text,
  user_id uuid not null references auth.users(id)
);

-- Enable Row Level Security
alter table public.drinks enable row level security;

-- Create policy for users to only access their own drinks
create policy "Users can only access their own drinks"
  on public.drinks for all
  using (auth.uid() = user_id); 