-- Final Supabase Setup for BakerLNK
-- Run this script in your Supabase SQL Editor

-- 1. Ensure all required tables exist
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    baker_id UUID REFERENCES bakers(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    subject TEXT,
    content TEXT,
    status VARCHAR(50) DEFAULT 'unread',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gallery_inquiries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    gallery_item_id UUID REFERENCES gallery(id) ON DELETE CASCADE,
    baker_id UUID REFERENCES bakers(id) ON DELETE CASCADE,
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    customer_phone VARCHAR(50),
    message TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security on all tables
ALTER TABLE bakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_inquiries ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies if any (to avoid conflicts)
DROP POLICY IF EXISTS "Public read bakers" ON bakers;
DROP POLICY IF EXISTS "Public read gallery" ON gallery;
DROP POLICY IF EXISTS "Public create orders" ON orders;
DROP POLICY IF EXISTS "Public read themes" ON themes;
DROP POLICY IF EXISTS "Auth create bakers" ON bakers;
DROP POLICY IF EXISTS "Auth update own baker" ON bakers;

-- 4. Create comprehensive RLS policies

-- Bakers policies
CREATE POLICY "Public can view bakers" ON bakers
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create bakers" ON bakers
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own baker" ON bakers
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own baker" ON bakers
    FOR DELETE USING (auth.uid()::text = user_id);

-- Gallery policies
CREATE POLICY "Public can view gallery" ON gallery
    FOR SELECT USING (true);

CREATE POLICY "Baker can manage their gallery" ON gallery
    FOR ALL USING (
        baker_id IN (
            SELECT id FROM bakers WHERE user_id = auth.uid()::text
        )
    );

-- Orders policies
CREATE POLICY "Public can create orders" ON orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Bakers can view their orders" ON orders
    FOR SELECT USING (
        baker_id IN (
            SELECT id FROM bakers WHERE user_id = auth.uid()::text
        )
    );

CREATE POLICY "Bakers can update their orders" ON orders
    FOR UPDATE USING (
        baker_id IN (
            SELECT id FROM bakers WHERE user_id = auth.uid()::text
        )
    );

-- Customers policies
CREATE POLICY "Bakers can manage their customers" ON customers
    FOR ALL USING (
        baker_id IN (
            SELECT id FROM bakers WHERE user_id = auth.uid()::text
        )
    );

-- Themes policies
CREATE POLICY "Public can view active themes" ON themes
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admin can manage themes" ON themes
    FOR ALL USING (
        auth.uid() IN (
            SELECT id::uuid FROM users WHERE role = 'admin'
        )
    );

-- Messages policies
CREATE POLICY "Bakers can manage their messages" ON messages
    FOR ALL USING (
        baker_id IN (
            SELECT id FROM bakers WHERE user_id = auth.uid()::text
        )
    );

-- Gallery inquiries policies
CREATE POLICY "Public can create inquiries" ON gallery_inquiries
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Bakers can view their inquiries" ON gallery_inquiries
    FOR SELECT USING (
        baker_id IN (
            SELECT id FROM bakers WHERE user_id = auth.uid()::text
        )
    );

CREATE POLICY "Bakers can update their inquiries" ON gallery_inquiries
    FOR UPDATE USING (
        baker_id IN (
            SELECT id FROM bakers WHERE user_id = auth.uid()::text
        )
    );

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bakers_user_id ON bakers(user_id);
CREATE INDEX IF NOT EXISTS idx_gallery_baker_id ON gallery(baker_id);
CREATE INDEX IF NOT EXISTS idx_orders_baker_id ON orders(baker_id);
CREATE INDEX IF NOT EXISTS idx_customers_baker_id ON customers(baker_id);
CREATE INDEX IF NOT EXISTS idx_messages_baker_id ON messages(baker_id);
CREATE INDEX IF NOT EXISTS idx_gallery_inquiries_baker_id ON gallery_inquiries(baker_id);

-- 6. Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Apply updated_at triggers to all tables
CREATE TRIGGER update_bakers_updated_at BEFORE UPDATE ON bakers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gallery_updated_at BEFORE UPDATE ON gallery
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gallery_inquiries_updated_at BEFORE UPDATE ON gallery_inquiries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. Enable Realtime for specific tables (optional)
-- Run these in the Supabase Dashboard under Database > Replication
-- - Enable replication for: orders, messages, gallery_inquiries

-- 9. Storage bucket setup reminder
-- IMPORTANT: You need to manually create the 'uploads' bucket in Supabase Dashboard:
-- 1. Go to Storage
-- 2. Click "New Bucket"
-- 3. Name it "uploads"
-- 4. Make it PUBLIC
-- 5. Save

-- Once the bucket is created, run this to allow public uploads:
INSERT INTO storage.buckets (id, name, public) 
VALUES ('uploads', 'uploads', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage policy for public access
CREATE POLICY "Public can upload to uploads bucket" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'uploads');

CREATE POLICY "Public can view uploads" ON storage.objects
    FOR SELECT USING (bucket_id = 'uploads');

CREATE POLICY "Users can delete their uploads" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'uploads' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- 10. Success message
SELECT 'BakerLNK Supabase setup completed successfully!' as message;