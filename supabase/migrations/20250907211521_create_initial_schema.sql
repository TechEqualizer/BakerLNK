-- Create initial schema for BakerLNK with proper UUID types
-- This migration creates all required tables with consistent typing

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
CREATE TRIGGER handle_themes_updated_at
    BEFORE UPDATE ON public.themes
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_bakers_updated_at
    BEFORE UPDATE ON public.bakers
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_customers_updated_at
    BEFORE UPDATE ON public.customers
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_gallery_updated_at
    BEFORE UPDATE ON public.gallery
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();