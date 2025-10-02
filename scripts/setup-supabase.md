# Supabase Setup Guide

Follow these steps to set up your Supabase project:

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/log in
2. Create a new project
3. Wait for the project to be provisioned

## 2. Get Project Credentials

1. Go to Project Settings > API
2. Copy your Project URL and anon public key
3. Copy your service role key (keep this secure!)
4. Update your `.env.local` file with these values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## 3. Set Up Database Schema

1. Go to the SQL Editor in your Supabase dashboard
2. Copy and paste the contents of `supabase/schema.sql`
3. Run the query to create all tables, types, and policies

## 4. Set Up Storage

1. Go to Storage in your Supabase dashboard
2. Copy and paste the contents of `supabase/storage.sql`
3. Run the query to create the storage bucket and policies

Alternatively, you can create the bucket manually:
- Go to Storage > Buckets
- Create a new bucket named `poetry-images`
- Make it public
- Set file size limit to 5MB
- Allow these MIME types: `image/jpeg,image/jpg,image/png,image/webp,image/gif`

## 5. Configure Authentication

1. Go to Authentication > Settings
2. Configure your site URL: `http://localhost:9002` (for development)
3. Add production URL when deploying
4. Enable email authentication
5. Optionally configure email templates

## 6. Test the Setup

1. Start your development server: `npm run dev`
2. Go to `/login` and try creating an account
3. Upload some poetry with images
4. Test likes and comments functionality

## Migration from Firebase

If you have existing Firebase data, you can:

1. Export your Firebase data
2. Transform it to match the Supabase schema
3. Use the Supabase API or SQL to import the data

The app maintains compatibility with existing file-based data during the transition.