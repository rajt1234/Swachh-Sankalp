-- Swachh Sankalp Database Schema
-- Run this in Supabase SQL Editor

-- IMPORTANT: After running this SQL, create a Storage bucket named 'complaints' in Supabase Studio
-- Go to: Supabase Dashboard > Storage > Create a new bucket > Name: 'complaints' > Public bucket: ON

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
   full_name text,
   phone text check (phone ~ '^\+91[0-9]{10}$'),
   avatar_url text,
  role text default 'citizen' check (role in ('citizen', 'admin', 'municipality', 'recycler')),
  city text,
  state text,
  points int default 0,
  user_id text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Waste categories
create table public.waste_categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  name_hi text,
  color text not null,
  icon text,
  description text,
  description_hi text
);

-- Complaints / Issue reports
create table public.complaints (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  category_id uuid references public.waste_categories(id),
  description text,
  image_url text,
  latitude double precision,
  longitude double precision,
  location_text text,
  address text,
  pin_code text,
  city text,
  state text,
  ai_category text,
  ai_verified boolean,
  ai_severity text check (ai_severity in ('high', 'medium', 'low')),
  ai_recommendation text,
  status text default 'pending' check (status in ('pending', 'in_progress', 'resolved', 'rejected')),
  assigned_to uuid references public.profiles(id),
  tracking_id text unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create sequence public.complaints_tracking_seq;

create or replace function public.generate_tracking_id()
returns text as $$
declare
  next_num int;
  year_str text;
  tracking_id text;
begin
  year_str := to_char(now(), 'YYYY');
  next_num := nextval('public.complaints_tracking_seq');
  tracking_id := 'SWA-' || year_str || '-' || lpad(next_num::text, 6, '0');
  return tracking_id;
end;
$$ language plpgsql;

create or replace function public.set_tracking_id()
returns trigger as $$
begin
  if new.tracking_id is null then
    new.tracking_id := public.generate_tracking_id();
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_tracking_id_trigger on public.complaints;
create trigger set_tracking_id_trigger
  before insert on public.complaints
  for each row
  execute function public.set_tracking_id();

-- Waste tracking records
create table public.waste_records (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  category_id uuid references public.waste_categories(id) not null,
  weight_kg double precision,
  collected_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Recycling centers
create table public.recycling_centers (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  name_hi text,
  address text,
  latitude double precision,
  longitude double precision,
  accepts jsonb,
  phone text,
  email text,
  operating_hours text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Pickup bookings
create table public.pickup_bookings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  center_id uuid references public.recycling_centers(id),
  waste_type text,
  preferred_date date,
  preferred_time text,
  status text default 'scheduled' check (status in ('scheduled', 'completed', 'cancelled')),
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- E-waste schedules
create table public.ewaste_schedules (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  item_type text,
  quantity int,
  preferred_date date,
  address text,
  status text default 'scheduled' check (status in ('scheduled', 'collected', 'cancelled')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Reward transactions
create table public.rewards (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  points int not null,
  reason text,
  related_id uuid,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Chat messages
create table public.chat_messages (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  message text not null,
  response text,
  is_bot boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- City leaderboard
create table public.city_stats (
  id uuid default uuid_generate_v4() primary key,
  city text not null,
  state text not null,
  complaints_resolved int default 0,
  waste_collected_kg double precision default 0,
  citizens_active int default 0,
  recycling_rate double precision default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(city, state)
);

-- Smart bins
create table public.smart_bins (
  id uuid default uuid_generate_v4() primary key,
  location_text text,
  latitude double precision,
  longitude double precision,
  fill_level int default 0 check (fill_level between 0 and 100),
  category text,
  last_emptied timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.waste_categories enable row level security;
alter table public.complaints enable row level security;
alter table public.waste_records enable row level security;
alter table public.recycling_centers enable row level security;
alter table public.pickup_bookings enable row level security;
alter table public.ewaste_schedules enable row level security;
alter table public.rewards enable row level security;
alter table public.chat_messages enable row level security;
alter table public.city_stats enable row level security;
alter table public.smart_bins enable row level security;

-- RLS Policies
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

create policy "Waste categories are viewable by everyone" on public.waste_categories for select using (true);
create policy "Waste categories manageable by admins" on public.waste_categories for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'municipality'))
);

create policy "Users can view own complaints" on public.complaints for select using (
  auth.uid() = user_id or exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'municipality'))
);
create policy "Tracking ID lookup is public" on public.complaints for select using (
  tracking_id is not null
);
create policy "Users can create complaints" on public.complaints for insert with check (auth.uid() = user_id);
create policy "Admins can update complaints" on public.complaints for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'municipality'))
);

create policy "Users can view own waste records" on public.waste_records for select using (
  auth.uid() = user_id or exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'municipality'))
);
create policy "Users can create waste records" on public.waste_records for insert with check (auth.uid() = user_id);

create policy "Recycling centers viewable by everyone" on public.recycling_centers for select using (true);
create policy "Admins manage recycling centers" on public.recycling_centers for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'municipality'))
);

create policy "Users manage own bookings" on public.pickup_bookings for all using (auth.uid() = user_id);

create policy "Users manage own ewaste schedules" on public.ewaste_schedules for all using (auth.uid() = user_id);

create policy "Users can view own rewards" on public.rewards for select using (auth.uid() = user_id);

create policy "Users can view own chat messages" on public.chat_messages for select using (
  auth.uid() = user_id or user_id is null
);
create policy "Anyone can create chat messages" on public.chat_messages for insert with check (true);

create policy "City stats viewable by everyone" on public.city_stats for select using (true);
create policy "Admins manage city stats" on public.city_stats for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'municipality'))
);

create policy "Smart bins viewable by everyone" on public.smart_bins for select using (true);
create policy "Admins manage smart bins" on public.smart_bins for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'municipality'))
);

-- Seed waste categories
insert into public.waste_categories (name, name_hi, color, icon, description, description_hi) values
  ('Organic', 'कच्चा कचरा', '#22c55e', '🍂', 'Biodegradable waste like food scraps, leaves, and garden waste', 'भोजन के टुकड़े, पत्तियां और बगीचे का कचरा'),
  ('Plastic', 'प्लास्टिक', '#3b82f6', '🥤', 'Plastic bottles, bags, containers, and packaging', 'प्लास्टिक की बोतलें, बैग, कंटेनर और पैकेजिंग'),
  ('Paper', 'कागज', '#f59e0b', '📄', 'Newspapers, cardboard, office paper, and magazines', 'अखबार, कार्डबोर्ड, ऑफिस पेपर और मैगजीन'),
  ('Metal', 'धातु', '#6366f1', '🥫', 'Aluminum cans, steel items, and metal containers', 'एल्यूमिनियम के कैन, स्टील की वस्तुएं और धातु के कंटेनर'),
  ('Glass', 'कांच', '#06b6d4', '🍾', 'Glass bottles, jars, and broken glass items', 'कांच की बोतलें, जार और टूटे कांच की वस्तुएं'),
  ('E-Waste', 'ई-वेस्ट', '#ef4444', '💻', 'Electronics, batteries, and electronic components', 'इलेक्ट्रॉनिक्स, बैटरी और इलेक्ट्रॉनिक घटक'),
  ('Mixed Waste', 'मिश्रित कचरा', '#ec4899', '🗑️', 'A combination of different waste types that cannot be separated easily', 'विभिन्न प्रकार के कचरे का संयोजन जिसे आसानी से अलग नहीं किया जा सकता');

-- Seed recycling centers (sample data)
insert into public.recycling_centers (name, name_hi, address, latitude, longitude, accepts, phone, operating_hours) values
  ('GreenCycle Recycling Center', 'ग्रीनसाइकल रीसाइक्लिंग सेंटर', 'MG Road, Delhi', 28.6139, 77.2090, '["plastic","paper","metal"]', '+91-11-12345678', '9:00 AM - 6:00 PM'),
  ('EcoWaste Solutions', 'इकोवेस्ट सॉल्यूशंस', 'Bandra West, Mumbai', 19.0544, 72.8406, '["organic","plastic","glass"]', '+91-22-87654321', '8:00 AM - 7:00 PM'),
  ('Swachh Recycling Hub', 'स्वच्छ रीसाइक्लिंग हब', 'Koramangala, Bangalore', 12.9352, 77.6245, '["e-waste","metal","plastic"]', '+91-80-11223344', '9:00 AM - 5:00 PM');

-- Seed city stats
insert into public.city_stats (city, state, complaints_resolved, waste_collected_kg, citizens_active, recycling_rate) values
  ('Delhi', 'Delhi', 15420, 125000, 45000, 65.5),
  ('Mumbai', 'Maharashtra', 18900, 178000, 52000, 72.3),
  ('Bangalore', 'Karnataka', 12300, 95000, 38000, 68.7),
  ('Chennai', 'Tamil Nadu', 11200, 88000, 34000, 61.2),
  ('Kolkata', 'West Bengal', 9800, 72000, 28000, 55.8),
  ('Hyderabad', 'Telangana', 10500, 81000, 31000, 63.4);

-- Seed smart bins
insert into public.smart_bins (location_text, latitude, longitude, fill_level, category, last_emptied) values
  ('Connaught Place, Delhi', 28.6315, 77.2167, 75, 'mixed', now() - interval '2 days'),
  ('India Gate, Delhi', 28.6129, 77.2295, 45, 'organic', now() - interval '1 day'),
  ('Marine Drive, Mumbai', 18.9432, 72.8235, 88, 'mixed', now() - interval '3 days'),
  ('Cubbon Park, Bangalore', 12.9743, 77.5910, 32, 'organic', now() - interval '6 hours'),
  ('Marina Beach, Chennai', 13.0500, 80.2824, 92, 'mixed', now() - interval '4 days'),
  ('Victoria Memorial, Kolkata', 22.5448, 88.3426, 67, 'mixed', now() - interval '2 days');
