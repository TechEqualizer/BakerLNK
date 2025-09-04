-- Step 4: Storage Policies
-- Copy and paste this into Supabase SQL Editor

-- Allow anyone to upload files to uploads bucket
CREATE POLICY "Anyone can upload files" 
ON storage.objects
FOR INSERT 
TO public
WITH CHECK (bucket_id = 'uploads');

-- Allow anyone to view files in uploads bucket
CREATE POLICY "Public can view uploaded files" 
ON storage.objects
FOR SELECT 
TO public
USING (bucket_id = 'uploads');

-- Allow anyone to delete their own files (optional)
CREATE POLICY "Users can delete own files" 
ON storage.objects
FOR DELETE 
TO authenticated
USING (bucket_id = 'uploads');