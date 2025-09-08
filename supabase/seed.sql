-- Seed data for BakerLNK
-- Sample themes, storage buckets, and initial data

-- Insert sample themes
INSERT INTO public.themes (theme_name, description, category, light_mode_variables, dark_mode_variables) 
VALUES 
(
    'Classic Elegance', 
    'Timeless sophistication with warm tones', 
    'elegant',
    ':root {
        --background: 60 9.1% 97.8%;
        --foreground: 20 14.3% 4.1%;
        --card: 60 9.1% 97.8%;
        --card-foreground: 20 14.3% 4.1%;
        --popover: 60 9.1% 97.8%;
        --popover-foreground: 20 14.3% 4.1%;
        --primary: 33 94% 62%;
        --primary-foreground: 60 9.1% 97.8%;
        --secondary: 60 4.8% 95.9%;
        --secondary-foreground: 24 9.8% 10%;
        --muted: 60 4.8% 95.9%;
        --muted-foreground: 25 5.3% 44.7%;
        --accent: 60 4.8% 95.9%;
        --accent-foreground: 24 9.8% 10%;
        --destructive: 0 84.2% 60.2%;
        --destructive-foreground: 60 9.1% 97.8%;
        --border: 20 5.9% 90%;
        --input: 20 5.9% 90%;
        --ring: 33 94% 62%;
        --radius: 0.5rem;
    }',
    '.dark {
        --background: 20 14.3% 4.1%;
        --foreground: 60 9.1% 97.8%;
        --card: 20 14.3% 4.1%;
        --card-foreground: 60 9.1% 97.8%;
        --popover: 20 14.3% 4.1%;
        --popover-foreground: 60 9.1% 97.8%;
        --primary: 33 94% 62%;
        --primary-foreground: 60 9.1% 97.8%;
        --secondary: 12 6.5% 15.1%;
        --secondary-foreground: 60 9.1% 97.8%;
        --muted: 12 6.5% 15.1%;
        --muted-foreground: 24 5.4% 63.9%;
        --accent: 12 6.5% 15.1%;
        --accent-foreground: 60 9.1% 97.8%;
        --destructive: 0 62.8% 30.6%;
        --destructive-foreground: 60 9.1% 97.8%;
        --border: 12 6.5% 15.1%;
        --input: 12 6.5% 15.1%;
        --ring: 33 94% 62%;
    }'
),
(
    'Modern Minimalist', 
    'Clean lines with contemporary appeal', 
    'modern',
    ':root {
        --background: 0 0% 100%;
        --foreground: 224 71.4% 4.1%;
        --card: 0 0% 100%;
        --card-foreground: 224 71.4% 4.1%;
        --popover: 0 0% 100%;
        --popover-foreground: 224 71.4% 4.1%;
        --primary: 210 40% 60%;
        --primary-foreground: 0 0% 98%;
        --secondary: 220 14.3% 95.9%;
        --secondary-foreground: 220.9 39.3% 11%;
        --muted: 220 14.3% 95.9%;
        --muted-foreground: 220 8.9% 46.1%;
        --accent: 220 14.3% 95.9%;
        --accent-foreground: 220.9 39.3% 11%;
        --destructive: 0 84.2% 60.2%;
        --destructive-foreground: 210 20% 98%;
        --border: 220 13% 91%;
        --input: 220 13% 91%;
        --ring: 210 40% 60%;
        --radius: 0.5rem;
    }',
    '.dark {
        --background: 0 0% 8%;
        --foreground: 0 0% 98%;
        --card: 0 0% 8%;
        --card-foreground: 0 0% 98%;
        --popover: 0 0% 8%;
        --popover-foreground: 0 0% 98%;
        --primary: 210 40% 60%;
        --primary-foreground: 0 0% 98%;
        --secondary: 0 0% 14.9%;
        --secondary-foreground: 0 0% 98%;
        --muted: 0 0% 14.9%;
        --muted-foreground: 0 0% 63.9%;
        --accent: 0 0% 14.9%;
        --accent-foreground: 0 0% 98%;
        --destructive: 0 62.8% 30.6%;
        --destructive-foreground: 0 0% 98%;
        --border: 0 0% 14.9%;
        --input: 0 0% 14.9%;
        --ring: 210 40% 60%;
    }'
),
(
    'Rustic Charm', 
    'Warm, inviting atmosphere with natural elements', 
    'rustic',
    ':root {
        --background: 36 39% 88%;
        --foreground: 36 45% 15%;
        --card: 36 39% 88%;
        --card-foreground: 36 45% 15%;
        --popover: 36 39% 88%;
        --popover-foreground: 36 45% 15%;
        --primary: 25 95% 53%;
        --primary-foreground: 30 10% 95%;
        --secondary: 36 33% 75%;
        --secondary-foreground: 36 45% 25%;
        --muted: 36 33% 75%;
        --muted-foreground: 36 35% 35%;
        --accent: 36 33% 75%;
        --accent-foreground: 36 45% 25%;
        --destructive: 0 84.2% 60.2%;
        --destructive-foreground: 30 10% 95%;
        --border: 36 28% 70%;
        --input: 36 28% 70%;
        --ring: 25 95% 53%;
        --radius: 0.5rem;
    }',
    '.dark {
        --background: 30 20% 7%;
        --foreground: 30 10% 95%;
        --card: 30 20% 7%;
        --card-foreground: 30 10% 95%;
        --popover: 30 20% 7%;
        --popover-foreground: 30 10% 95%;
        --primary: 25 95% 53%;
        --primary-foreground: 30 10% 95%;
        --secondary: 30 15% 15%;
        --secondary-foreground: 30 10% 95%;
        --muted: 30 15% 15%;
        --muted-foreground: 30 8% 65%;
        --accent: 30 15% 15%;
        --accent-foreground: 30 10% 95%;
        --destructive: 0 62.8% 30.6%;
        --destructive-foreground: 30 10% 95%;
        --border: 30 15% 15%;
        --input: 30 15% 15%;
        --ring: 25 95% 53%;
    }'
)
ON CONFLICT (id) DO NOTHING;

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('uploads', 'uploads', true, 52428800, '{"image/*","application/pdf"}')
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
DO $$
BEGIN
    -- Check if policies exist before creating them
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Anyone can view uploaded files'
    ) THEN
        CREATE POLICY "Anyone can view uploaded files"
            ON storage.objects FOR SELECT
            USING (bucket_id = 'uploads');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Authenticated users can upload files'
    ) THEN
        CREATE POLICY "Authenticated users can upload files"
            ON storage.objects FOR INSERT
            WITH CHECK (bucket_id = 'uploads' AND auth.role() = 'authenticated');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Users can update their own uploads'
    ) THEN
        CREATE POLICY "Users can update their own uploads"
            ON storage.objects FOR UPDATE
            USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Users can delete their own uploads'
    ) THEN
        CREATE POLICY "Users can delete their own uploads"
            ON storage.objects FOR DELETE
            USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
    END IF;
END
$$;