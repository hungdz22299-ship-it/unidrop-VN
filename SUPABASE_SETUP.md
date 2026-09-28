# UniDrop + Supabase setup

## 1. Environment variables

Create `.env.local` locally:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
VITE_AI_API_URL=/api/ai
```

For Netlify, add the same `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` values in Environment variables. Never commit `.env.local` or a service-role key.

## 2. Storage

In Supabase Storage create a **public** bucket named:

`product-images`

## 3. Database and policies

Open Supabase SQL Editor and run:

`supabase/setup.sql`

The included policies are intentionally permissive so the current UniDrop demo (which uses its own local admin login instead of Supabase Auth) can work from the browser. Before using this as a real production store, replace the public insert/update/delete policies with authenticated admin-only RLS policies.

## 4. What the new code does

- Product catalog is loaded from `public.products` on app startup.
- Admin product create/edit/delete writes to Supabase.
- Product images are compressed in the browser and uploaded to `product-images`.
- The primary image and gallery URLs are stored in `products.image` / `products.images`.
- A small LocalStorage cache remains as a fallback so the current UI can keep its synchronous search/filter helpers.
- Existing checkout/order logic continues to update the local cache and synchronizes product stock changes to Supabase in the background.
- AI calls default to `/api/ai`, which works with the included Netlify function and `netlify.toml`.
