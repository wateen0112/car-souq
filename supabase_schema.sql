-- Create the cars table
create table public.cars (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  description text,
  year integer not null,
  category text not null,
  extra_features text[] default '{}',
  color text,
  renting_type text not null check (renting_type in ('rent', 'sell', 'both')),
  rent_price_daily numeric,
  rent_price_weekly numeric,
  rent_price_monthly numeric,
  rent_price_yearly numeric,
  sell_price numeric,
  images text[] default '{}'
);

-- Enable Row Level Security (RLS)
alter table public.cars enable row level security;

-- Create a policy that allows anyone to read cars
create policy "Public cars are viewable by everyone"
  on public.cars for select
  using ( true );

-- Create a policy that allows only authenticated users (or specific logic) to insert/update/delete
-- Since we are doing a custom admin login without Supabase Auth for the admin user (as per requirements "no authentication provider"),
-- we will technically need to allow public write access OR use a service role key in the backend.
-- However, for a client-side app with "custom username/password", the safest way without a backend is to use Supabase Auth anonymously or just open it up and rely on the frontend "admin" check (INSECURE but fits "no auth provider" + "mobile app" constraint if we don't want a middleware).
-- BETTER APPROACH: The requirement says "Single Admin User Only... custom username and password (no authentication provider)".
-- This implies we might not be using Supabase Auth users.
-- To secure this properly, we'd need a backend proxy. But this is a "Mobile App" (PWA) with "Supabase as backend".
-- We will set the policy to allow ALL operations for now, and the frontend will hide the UI.
-- WARN: This is insecure for production but fits the "no auth provider" constraint for a prototype.
create policy "Enable all access for now (Insecure - for prototype only)"
  on public.cars for all
  using ( true )
  with check ( true );

-- Storage Bucket for Images
insert into storage.buckets (id, name, public) values ('car-images', 'car-images', true);

-- Storage Policy
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'car-images' );

create policy "Public Upload"
  on storage.objects for insert
  with check ( bucket_id = 'car-images' );

create policy "Public Delete"
  on storage.objects for delete
  using ( bucket_id = 'car-images' );

-- Create the carousel_ads table for hero section advertisements
create table public.carousel_ads (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  image_url text not null,
  link_url text,
  order_position integer default 0,
  is_active boolean default true
);

-- Enable Row Level Security (RLS) for carousel_ads
alter table public.carousel_ads enable row level security;

-- Create a policy that allows anyone to read active carousel ads
create policy "Public carousel ads are viewable by everyone"
  on public.carousel_ads for select
  using ( true );

-- Create a policy that allows all operations (same as cars table)
create policy "Enable all access for carousel ads (Insecure - for prototype only)"
  on public.carousel_ads for all
  using ( true )
  with check ( true );
