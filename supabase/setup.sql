-- UniDrop: products + public product image storage.
-- For a real production shop, replace the public write policies with
-- authenticated admin-only policies after Supabase Auth/RLS is enabled.

create table if not exists public.products (
  id text primary key,
  name text not null,
  slug text not null,
  category text not null,
  price numeric not null default 0,
  old_price numeric,
  image text,
  images jsonb not null default '[]'::jsonb,
  rating numeric not null default 5,
  reviews integer not null default 0,
  sold integer not null default 0,
  stock integer not null default 0,
  description text default '',
  description_sections jsonb not null default '[]'::jsonb,
  tags jsonb not null default '[]'::jsonb,
  featured boolean not null default false,
  bestseller boolean not null default false,
  is_new boolean not null default true,
  on_sale boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

drop policy if exists "Products public read" on public.products;
drop policy if exists "Products public insert" on public.products;
drop policy if exists "Products public update" on public.products;
drop policy if exists "Products public delete" on public.products;

create policy "Products public read" on public.products for select to public using (true);
create policy "Products public insert" on public.products for insert to public with check (true);
create policy "Products public update" on public.products for update to public using (true) with check (true);
create policy "Products public delete" on public.products for delete to public using (true);

-- Storage bucket must be created in the Supabase dashboard as a PUBLIC bucket:
-- product-images

drop policy if exists "Product images public read" on storage.objects;
drop policy if exists "Product images public upload" on storage.objects;
drop policy if exists "Product images public update" on storage.objects;
drop policy if exists "Product images public delete" on storage.objects;

create policy "Product images public read" on storage.objects for select to public using (bucket_id = 'product-images');
create policy "Product images public upload" on storage.objects for insert to public with check (bucket_id = 'product-images');
create policy "Product images public update" on storage.objects for update to public using (bucket_id = 'product-images') with check (bucket_id = 'product-images');
create policy "Product images public delete" on storage.objects for delete to public using (bucket_id = 'product-images');

-- UniDrop combos: admins can assemble bundles from existing products.
create table if not exists public.combos (
  id text primary key,
  name text not null,
  slug text not null,
  description text default '',
  image text,
  items jsonb not null default '[]'::jsonb,
  price numeric not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.combos enable row level security;
drop policy if exists "Combos public read" on public.combos;
drop policy if exists "Combos public insert" on public.combos;
drop policy if exists "Combos public update" on public.combos;
drop policy if exists "Combos public delete" on public.combos;
create policy "Combos public read" on public.combos for select to public using (true);
create policy "Combos public insert" on public.combos for insert to public with check (true);
create policy "Combos public update" on public.combos for update to public using (true) with check (true);
create policy "Combos public delete" on public.combos for delete to public using (true);
