-- Step 4: Simple Storage Policies
-- IMPORTANT: Create the 'uploads' bucket in Supabase UI first!
-- Copy and paste this into Supabase SQL Editor AFTER creating the bucket

-- Check if storage schema exists first
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'storage') THEN
        RAISE EXCEPTION 'Storage schema not found. Please create a bucket first in the Supabase UI.';
    END IF;
END $$;

-- Allow public uploads to uploads bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('uploads', 'uploads', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

-- Simple storage policies
CREATE POLICY IF NOT EXISTS "Public Access" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'uploads');