-- BakerLNK Complete Database Setup
-- Copy and paste this entire script into your Supabase SQL Editor
-- This will set up all tables, policies, and sample data with proper UUID types

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- STEP 1: CREATE TABLES
-- ===========================================

-- Create themes table
CREATE TABLE IF NOT EXISTS public.themes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    theme_name TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'modern',
    css_variables TEXT,
    light_mode_variables TEXT,
    dark_mode_variables TEXT,
    background_texture_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create bakers table
CREATE TABLE IF NOT EXISTS public.bakers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    tagline TEXT,
    description TEXT,
    email TEXT,
    phone_number TEXT,
    location TEXT,
    logo_url TEXT,
    hero_image_url TEXT,
    selected_theme_id UUID REFERENCES public.themes(id),
    lead_time_days INTEGER DEFAULT 7,
    max_orders_per_day INTEGER,
    deposit_percentage INTEGER,
    instagram_url TEXT,
    facebook_url TEXT,
    tiktok_url TEXT,
    website_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create customers table
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    baker_id UUID NOT NULL REFERENCES public.bakers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    notes TEXT,
    tags TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    baker_id UUID NOT NULL REFERENCES public.bakers(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'inquiry',
    event_date TIMESTAMPTZ,
    event_type TEXT,
    serves_count INTEGER,
    budget_min DECIMAL(10,2),
    budget_max DECIMAL(10,2),
    cake_description TEXT,
    special_requests TEXT,
    quoted_price DECIMAL(10,2),
    deposit_amount DECIMAL(10,2),
    deposit_paid BOOLEAN DEFAULT false,
    baker_notes TEXT,
    priority TEXT DEFAULT 'medium',
    pickup_delivery TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create gallery table
CREATE TABLE IF NOT EXISTS public.gallery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    baker_id UUID NOT NULL REFERENCES public.bakers(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    category TEXT,
    tags TEXT,
    featured BOOLEAN DEFAULT false,
    price_range TEXT,
    serves_count INTEGER,
    hearts_count INTEGER DEFAULT 0,
    inquiries_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    baker_id UUID NOT NULL REFERENCES public.bakers(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    sender_type TEXT NOT NULL,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create gallery_inquiries table
CREATE TABLE IF NOT EXISTS public.gallery_inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    gallery_item_id UUID NOT NULL REFERENCES public.gallery(id) ON DELETE CASCADE,
    created_date TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_user_gallery_inquiry UNIQUE(user_id, gallery_item_id, created_date)
);

-- Create files table
CREATE TABLE IF NOT EXISTS public.files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size_bytes BIGINT NOT NULL,
    file_path TEXT NOT NULL,
    uploaded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'handle_themes_updated_at') THEN
        CREATE TRIGGER handle_themes_updated_at
            BEFORE UPDATE ON public.themes
            FOR EACH ROW
            EXECUTE FUNCTION public.handle_updated_at();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'handle_bakers_updated_at') THEN
        CREATE TRIGGER handle_bakers_updated_at
            BEFORE UPDATE ON public.bakers
            FOR EACH ROW
            EXECUTE FUNCTION public.handle_updated_at();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'handle_customers_updated_at') THEN
        CREATE TRIGGER handle_customers_updated_at
            BEFORE UPDATE ON public.customers
            FOR EACH ROW
            EXECUTE FUNCTION public.handle_updated_at();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'handle_orders_updated_at') THEN
        CREATE TRIGGER handle_orders_updated_at
            BEFORE UPDATE ON public.orders
            FOR EACH ROW
            EXECUTE FUNCTION public.handle_updated_at();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'handle_gallery_updated_at') THEN
        CREATE TRIGGER handle_gallery_updated_at
            BEFORE UPDATE ON public.gallery
            FOR EACH ROW
            EXECUTE FUNCTION public.handle_updated_at();
    END IF;
END
$$;

-- ===========================================
-- STEP 2: ENABLE ROW LEVEL SECURITY
-- ===========================================

ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- STEP 3: CREATE RLS POLICIES
-- ===========================================

-- Themes policies (public read access)
DROP POLICY IF EXISTS "Anyone can view themes" ON public.themes;
CREATE POLICY "Anyone can view themes"
    ON public.themes FOR SELECT
    USING (true);

-- Bakers policies (users can manage their own baker profile)
DROP POLICY IF EXISTS "Anyone can view bakers" ON public.bakers;
CREATE POLICY "Anyone can view bakers"
    ON public.bakers FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can create their baker profile" ON public.bakers;
CREATE POLICY "Users can create their baker profile"
    ON public.bakers FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their baker profile" ON public.bakers;
CREATE POLICY "Users can update their baker profile"
    ON public.bakers FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their baker profile" ON public.bakers;
CREATE POLICY "Users can delete their baker profile"
    ON public.bakers FOR DELETE
    USING (auth.uid() = user_id);

-- Customers policies (bakers can manage their customers)
DROP POLICY IF EXISTS "Bakers can view their customers" ON public.customers;
CREATE POLICY "Bakers can view their customers"
    ON public.customers FOR SELECT
    USING (
        baker_id IN (
            SELECT id FROM public.bakers WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Bakers can create customers" ON public.customers;
CREATE POLICY "Bakers can create customers"
    ON public.customers FOR INSERT
    WITH CHECK (
        baker_id IN (
            SELECT id FROM public.bakers WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Bakers can update their customers" ON public.customers;
CREATE POLICY "Bakers can update their customers"
    ON public.customers FOR UPDATE
    USING (
        baker_id IN (
            SELECT id FROM public.bakers WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Bakers can delete their customers" ON public.customers;
CREATE POLICY "Bakers can delete their customers"
    ON public.customers FOR DELETE
    USING (
        baker_id IN (
            SELECT id FROM public.bakers WHERE user_id = auth.uid()
        )
    );

-- Gallery policies (public read, bakers manage their own)
DROP POLICY IF EXISTS "Anyone can view gallery items" ON public.gallery;
CREATE POLICY "Anyone can view gallery items"
    ON public.gallery FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Bakers can create gallery items" ON public.gallery;
CREATE POLICY "Bakers can create gallery items"
    ON public.gallery FOR INSERT
    WITH CHECK (
        baker_id IN (
            SELECT id FROM public.bakers WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Bakers can update their gallery items" ON public.gallery;
CREATE POLICY "Bakers can update their gallery items"
    ON public.gallery FOR UPDATE
    USING (
        baker_id IN (
            SELECT id FROM public.bakers WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Bakers can delete their gallery items" ON public.gallery;
CREATE POLICY "Bakers can delete their gallery items"
    ON public.gallery FOR DELETE
    USING (
        baker_id IN (
            SELECT id FROM public.bakers WHERE user_id = auth.uid()
        )
    );

-- Gallery inquiries policies (users manage their own)
DROP POLICY IF EXISTS "Users can view their gallery inquiries" ON public.gallery_inquiries;
CREATE POLICY "Users can view their gallery inquiries"
    ON public.gallery_inquiries FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create gallery inquiries" ON public.gallery_inquiries;
CREATE POLICY "Users can create gallery inquiries"
    ON public.gallery_inquiries FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their gallery inquiries" ON public.gallery_inquiries;
CREATE POLICY "Users can delete their gallery inquiries"
    ON public.gallery_inquiries FOR DELETE
    USING (auth.uid() = user_id);

-- Files policies (users manage their uploads)
DROP POLICY IF EXISTS "Users can view their files" ON public.files;
CREATE POLICY "Users can view their files"
    ON public.files FOR SELECT
    USING (auth.uid() = uploaded_by);

DROP POLICY IF EXISTS "Users can create files" ON public.files;
CREATE POLICY "Users can create files"
    ON public.files FOR INSERT
    WITH CHECK (auth.uid() = uploaded_by);

DROP POLICY IF EXISTS "Users can delete their files" ON public.files;
CREATE POLICY "Users can delete their files"
    ON public.files FOR DELETE
    USING (auth.uid() = uploaded_by);

-- ===========================================
-- STEP 4: INSERT SAMPLE DATA
-- ===========================================

-- Insert sample themes
INSERT INTO public.themes (theme_name, description, category, light_mode_variables, dark_mode_variables) 
VALUES 
(
    'Classic Elegance', 
    'Timeless sophistication with warm tones', 
    'elegant',
    ':root { --background: 60 9.1% 97.8%; --foreground: 20 14.3% 4.1%; --primary: 33 94% 62%; --primary-foreground: 60 9.1% 97.8%; }',
    '.dark { --background: 20 14.3% 4.1%; --foreground: 60 9.1% 97.8%; --primary: 33 94% 62%; --primary-foreground: 60 9.1% 97.8%; }'
),
(
    'Modern Minimalist', 
    'Clean lines with contemporary appeal', 
    'modern',
    ':root { --background: 0 0% 100%; --foreground: 224 71.4% 4.1%; --primary: 210 40% 60%; --primary-foreground: 0 0% 98%; }',
    '.dark { --background: 0 0% 8%; --foreground: 0 0% 98%; --primary: 210 40% 60%; --primary-foreground: 0 0% 98%; }'
),
(
    'Rustic Charm', 
    'Warm, inviting atmosphere with natural elements', 
    'rustic',
    ':root { --background: 36 39% 88%; --foreground: 36 45% 15%; --primary: 25 95% 53%; --primary-foreground: 30 10% 95%; }',
    '.dark { --background: 30 20% 7%; --foreground: 30 10% 95%; --primary: 25 95% 53%; --primary-foreground: 30 10% 95%; }'
)
ON CONFLICT (id) DO NOTHING;

-- ===========================================
-- STEP 5: CREATE STORAGE BUCKET
-- ===========================================

-- Create uploads bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('uploads', 'uploads', true, 52428800, '{"image/*","application/pdf"}')
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
DROP POLICY IF EXISTS "Anyone can view uploaded files" ON storage.objects;
CREATE POLICY "Anyone can view uploaded files"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'uploads');

DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
CREATE POLICY "Authenticated users can upload files"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'uploads' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update their own uploads" ON storage.objects;
CREATE POLICY "Users can update their own uploads"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can delete their own uploads" ON storage.objects;
CREATE POLICY "Users can delete their own uploads"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ===========================================
-- SETUP COMPLETE!
-- ===========================================

SELECT 
    'BakerLNK Database Setup Complete! 🎉' as status,
    'All tables created with proper UUID types' as schema_status,
    'RLS policies enabled and configured' as security_status,
    'Sample themes and storage bucket created' as data_status;