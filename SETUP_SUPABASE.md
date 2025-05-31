# Supabase Setup for Monster Tracker

Your image upload feature requires two things to be created in your Supabase database:

## 1. Storage Bucket

Go to your Supabase Dashboard → Storage → Create a new bucket:
- **Bucket ID**: `can_images`
- **Public**: ✅ Enabled
- **File size limit**: 50MB
- **Allowed MIME types**: `image/*`

## 2. Database Table

Go to your Supabase Dashboard → SQL Editor and run this SQL:

```sql
-- Create storage bucket for can images
INSERT INTO storage.buckets (id, name, public)
VALUES ('can_images', 'can_images', true)
ON CONFLICT (id) DO NOTHING;

-- Create can_images table
CREATE TABLE IF NOT EXISTS can_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  can_name TEXT NOT NULL,
  series TEXT NOT NULL,
  image_url TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(can_name, series, user_id)
);

-- Enable RLS
ALTER TABLE can_images ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can only see their own can images" ON can_images
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own can images" ON can_images
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own can images" ON can_images
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own can images" ON can_images
  FOR DELETE USING (auth.uid() = user_id);

-- Storage policies for can_images bucket
CREATE POLICY "Users can upload can images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'can_images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view can images" ON storage.objects
  FOR SELECT USING (bucket_id = 'can_images');

CREATE POLICY "Users can update their own can images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'can_images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'can_images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own can images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'can_images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

## 3. Verify Setup

After running the SQL:
1. Check that `can_images` table appears in Database → Tables
2. Check that `can_images` bucket appears in Storage
3. Try uploading an image in your app

## Troubleshooting

If you still get errors:
- Make sure your `.env` file has the correct `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Check that RLS policies are enabled and working
- Verify that your user is authenticated when uploading images

## Current Fallback

Until you set up Supabase storage, images are being saved to localStorage as Base64 strings, which is why they work temporarily but don't persist across browser sessions or show up after refresh. 