-- ============================================
-- Marketplace Siguatepeque - Database Schema
-- Run this SQL in your Supabase SQL Editor
-- ============================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================
-- CATEGORIES
-- ============================================
create table public.categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text not null unique,
  icon text not null default '🏪',
  created_at timestamptz default now()
);

alter table public.categories enable row level security;
create policy "Categories are viewable by everyone" on public.categories for select using (true);

-- ============================================
-- BUSINESSES
-- ============================================
create table public.businesses (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text not null unique,
  description text,
  category_id uuid references public.categories(id) on delete set null,
  phone text,
  whatsapp text,
  address text,
  city text default 'Siguatepeque',
  logo text,
  cover text,
  rating numeric(2,1) default 0,
  review_count int default 0,
  featured boolean default false,
  owner_id uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.businesses enable row level security;
create policy "Businesses are viewable by everyone" on public.businesses for select using (true);
create policy "Owners can update their business" on public.businesses for update using (auth.uid() = owner_id);
create policy "Owners can insert their business" on public.businesses for insert with check (auth.uid() = owner_id);

-- ============================================
-- PORTFOLIO
-- ============================================
create table public.portfolio (
  id uuid default uuid_generate_v4() primary key,
  business_id uuid references public.businesses(id) on delete cascade not null,
  image_url text not null,
  description text,
  created_at timestamptz default now()
);

alter table public.portfolio enable row level security;
create policy "Portfolio is viewable by everyone" on public.portfolio for select using (true);
create policy "Owners can manage portfolio" on public.portfolio for insert
  with check (
    exists (
      select 1 from public.businesses where id = business_id and owner_id = auth.uid()
    )
  );
create policy "Owners can delete portfolio" on public.portfolio for delete
  using (
    exists (
      select 1 from public.businesses where id = business_id and owner_id = auth.uid()
    )
  );

-- ============================================
-- REVIEWS
-- ============================================
create table public.reviews (
  id uuid default uuid_generate_v4() primary key,
  business_id uuid references public.businesses(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  rating int not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz default now()
);

alter table public.reviews enable row level security;
create policy "Reviews are viewable by everyone" on public.reviews for select using (true);
create policy "Authenticated users can create reviews" on public.reviews for insert with check (auth.uid() = user_id);

-- ============================================
-- PROFILES (for displaying reviewer names)
-- ============================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  avatar_url text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
create policy "Profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- AUTO-RECALCULATE BUSINESS RATING
-- ============================================
create or replace function public.update_business_rating()
returns trigger as $$
begin
  update public.businesses
  set
    rating = (select coalesce(round(avg(rating)::numeric, 1), 0) from public.reviews where business_id = coalesce(new.business_id, old.business_id)),
    review_count = (select count(*) from public.reviews where business_id = coalesce(new.business_id, old.business_id))
  where id = coalesce(new.business_id, old.business_id);
  return coalesce(new, old);
end;
$$ language plpgsql security definer;

create trigger on_review_change
  after insert or update or delete on public.reviews
  for each row execute procedure public.update_business_rating();

-- ============================================
-- STORAGE BUCKETS (run separately or via dashboard)
-- ============================================
-- insert into storage.buckets (id, name, public) values ('business-logos', 'business-logos', true);
-- insert into storage.buckets (id, name, public) values ('business-covers', 'business-covers', true);
-- insert into storage.buckets (id, name, public) values ('business-portfolio', 'business-portfolio', true);

-- Storage policies (allow public read, authenticated upload)
-- create policy "Public read logos" on storage.objects for select using (bucket_id = 'business-logos');
-- create policy "Auth upload logos" on storage.objects for insert with check (bucket_id = 'business-logos' and auth.role() = 'authenticated');
-- create policy "Public read covers" on storage.objects for select using (bucket_id = 'business-covers');
-- create policy "Auth upload covers" on storage.objects for insert with check (bucket_id = 'business-covers' and auth.role() = 'authenticated');
-- create policy "Public read portfolio" on storage.objects for select using (bucket_id = 'business-portfolio');
-- create policy "Auth upload portfolio" on storage.objects for insert with check (bucket_id = 'business-portfolio' and auth.role() = 'authenticated');

-- ============================================
-- SEED DATA
-- ============================================
insert into public.categories (name, slug, icon) values
  ('Restaurantes', 'restaurantes', '🍽️'),
  ('Cafeterías', 'cafeterias', '☕'),
  ('Tiendas', 'tiendas', '🛍️'),
  ('Salud', 'salud', '🏥'),
  ('Belleza', 'belleza', '💇'),
  ('Tecnología', 'tecnologia', '💻'),
  ('Educación', 'educacion', '📚'),
  ('Servicios', 'servicios', '🔧'),
  ('Deportes', 'deportes', '⚽'),
  ('Hotelería', 'hoteleria', '🏨');
