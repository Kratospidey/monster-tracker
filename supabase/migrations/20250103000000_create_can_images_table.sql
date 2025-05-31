-- Create storage bucket for can images
INSERT INTO storage.buckets (id, name, public)
VALUES ('can-images', 'can-images', true)
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

-- Storage policies for can-images bucket
CREATE POLICY "Users can upload can images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'can-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view can images" ON storage.objects
  FOR SELECT USING (bucket_id = 'can-images');

CREATE POLICY "Users can update their own can images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'can-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'can-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own can images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'can-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  ); 