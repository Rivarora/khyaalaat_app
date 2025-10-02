-- Create storage bucket for poetry images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'poetry-images',
  'poetry-images', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
);

-- RLS policies for storage
CREATE POLICY "Anyone can view poetry images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'poetry-images');

CREATE POLICY "Authenticated users can upload poetry images" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'poetry-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update own uploaded images" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'poetry-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own uploaded images" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'poetry-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);