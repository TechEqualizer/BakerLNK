-- Fix the database setup issues

-- 1. Drop the conflicting users table (we use auth.users instead)
DROP TABLE IF EXISTS public.users CASCADE;

-- 2. Drop any conflicting tables we don't need
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;

-- 3. Fix the themes table defaults
ALTER TABLE public.themes ALTER COLUMN id SET DEFAULT uuid_generate_v4();
ALTER TABLE public.themes ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE public.themes ALTER COLUMN updated_at SET DEFAULT now();

-- 4. Clear any existing broken theme data
DELETE FROM public.themes WHERE id IS NULL OR updated_at IS NULL;

-- 5. Add the missing themes with explicit timestamps
INSERT INTO public.themes (theme_name, description, category, light_mode_variables, dark_mode_variables, created_at, updated_at) 
VALUES 
(
    'Classic Elegance', 
    'Timeless sophistication with warm tones', 
    'elegant',
    ':root { --background: 60 9.1% 97.8%; --foreground: 20 14.3% 4.1%; --primary: 33 94% 62%; --primary-foreground: 60 9.1% 97.8%; }',
    '.dark { --background: 20 14.3% 4.1%; --foreground: 60 9.1% 97.8%; --primary: 33 94% 62%; --primary-foreground: 60 9.1% 97.8%; }',
    now(),
    now()
),
(
    'Modern Minimalist', 
    'Clean lines with contemporary appeal', 
    'modern',
    ':root { --background: 0 0% 100%; --foreground: 224 71.4% 4.1%; --primary: 210 40% 60%; --primary-foreground: 0 0% 98%; }',
    '.dark { --background: 0 0% 8%; --foreground: 0 0% 98%; --primary: 210 40% 60%; --primary-foreground: 0 0% 98%; }',
    now(),
    now()
),
(
    'Rustic Charm', 
    'Warm, inviting atmosphere with natural elements', 
    'rustic',
    ':root { --background: 36 39% 88%; --foreground: 36 45% 15%; --primary: 25 95% 53%; --primary-foreground: 30 10% 95%; }',
    '.dark { --background: 30 20% 7%; --foreground: 30 10% 95%; --primary: 25 95% 53%; --primary-foreground: 30 10% 95%; }',
    now(),
    now()
);

-- 6. Ensure all tables have proper defaults (fix any that might be broken)
ALTER TABLE public.bakers ALTER COLUMN id SET DEFAULT uuid_generate_v4();
ALTER TABLE public.bakers ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE public.bakers ALTER COLUMN updated_at SET DEFAULT now();

ALTER TABLE public.customers ALTER COLUMN id SET DEFAULT uuid_generate_v4();
ALTER TABLE public.customers ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE public.customers ALTER COLUMN updated_at SET DEFAULT now();

ALTER TABLE public.orders ALTER COLUMN id SET DEFAULT uuid_generate_v4();
ALTER TABLE public.orders ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE public.orders ALTER COLUMN updated_at SET DEFAULT now();

ALTER TABLE public.gallery ALTER COLUMN id SET DEFAULT uuid_generate_v4();
ALTER TABLE public.gallery ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE public.gallery ALTER COLUMN updated_at SET DEFAULT now();

ALTER TABLE public.messages ALTER COLUMN id SET DEFAULT uuid_generate_v4();
ALTER TABLE public.messages ALTER COLUMN created_at SET DEFAULT now();

ALTER TABLE public.gallery_inquiries ALTER COLUMN id SET DEFAULT uuid_generate_v4();
ALTER TABLE public.gallery_inquiries ALTER COLUMN created_date SET DEFAULT now();

ALTER TABLE public.files ALTER COLUMN id SET DEFAULT uuid_generate_v4();
ALTER TABLE public.files ALTER COLUMN created_at SET DEFAULT now();

-- 7. Create storage bucket if missing
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('uploads', 'uploads', true, 52428800, '{"image/*","application/pdf"}')
ON CONFLICT (id) DO NOTHING;

-- 8. Verify the cleanup and setup
SELECT 'Cleanup Results:' as info;
SELECT COUNT(*) as theme_count FROM public.themes;
SELECT 
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') 
         THEN '❌ STILL EXISTS' 
         ELSE '✅ REMOVED' 
    END as users_table_status;

SELECT 'Sample theme names:' as info;
SELECT theme_name FROM public.themes;

-- 9. Test that we can create records with proper UUIDs now
INSERT INTO public.themes (theme_name, description, category) 
VALUES ('Test Theme', 'This should get a UUID automatically', 'test')
ON CONFLICT DO NOTHING;

SELECT 'UUID Generation Test:' as info;
SELECT id, theme_name FROM public.themes WHERE theme_name = 'Test Theme';

-- 10. Clean up the test theme
DELETE FROM public.themes WHERE theme_name = 'Test Theme';

SELECT '🎉 Setup Complete! Try signup now!' as result;