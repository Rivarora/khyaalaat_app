# Supabase setup

Add these environment variables (e.g., `.env.local`):

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_URL=your-project-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

SQL to create the `poem_requests` table and policies:

```sql
create table if not exists public.poem_requests (
  id text primary key,
  name text not null,
  topic text not null,
  genre text not null check (genre in ('Love','Sad','Motivational','Nature')),
  mood text not null,
  description text not null,
  created_at timestamp with time zone not null default now(),
  completed boolean not null default false
);

-- RLS
alter table public.poem_requests enable row level security;

-- Public can read
create policy "poem_requests_read"
  on public.poem_requests for select
  using (true);

-- Only service role can write (handled server-side)
-- Do NOT add insert/update/delete policies for anon.
```

Notes:
- Client-side reads use the anon key and the read policy.
- Server actions use the service role key via `supabaseAdmin` and bypass RLS for writes.
