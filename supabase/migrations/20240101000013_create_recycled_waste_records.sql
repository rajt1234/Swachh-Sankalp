-- Create dedicated recycled_waste_records table
create table public.recycled_waste_records (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  category_id uuid references public.waste_categories(id),
  weight_kg double precision,
  complaint_id uuid references public.complaints(id),
  collected_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.recycled_waste_records enable row level security;

create policy "Recycled waste records viewable by everyone" on public.recycled_waste_records for select using (true);
create policy "Users can create recycled waste records" on public.recycled_waste_records for insert with check (auth.uid() = user_id);
create policy "Users can update own recycled waste records" on public.recycled_waste_records for update using (auth.uid() = user_id);
create policy "Users can delete own recycled waste records" on public.recycled_waste_records for delete using (auth.uid() = user_id);
