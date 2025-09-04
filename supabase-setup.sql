-- BakerLNK Supabase Setup
-- Run this in your Supabase SQL Editor

-- 1. First, run the schema creation from supabase-schema.sql

-- 2. Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies

-- Users policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id);

-- Bakers policies
CREATE POLICY "Public can view all bakers" ON bakers
  FOR SELECT USING (true);

CREATE POLICY "Users can create own baker profile" ON bakers
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own baker profile" ON bakers
  FOR UPDATE USING (auth.uid()::text = user_id);

-- Gallery policies  
CREATE POLICY "Public can view all gallery items" ON gallery
  FOR SELECT USING (true);

CREATE POLICY "Bakers can manage own gallery" ON gallery
  FOR ALL USING (
    baker_id IN (
      SELECT id FROM bakers WHERE user_id = auth.uid()::text
    )
  );

-- Customers policies
CREATE POLICY "Bakers can view own customers" ON customers
  FOR SELECT USING (
    baker_id IN (
      SELECT id FROM bakers WHERE user_id = auth.uid()::text
    )
  );

CREATE POLICY "Bakers can create customers" ON customers
  FOR INSERT WITH CHECK (
    baker_id IN (
      SELECT id FROM bakers WHERE user_id = auth.uid()::text
    )
  );

-- Orders policies
CREATE POLICY "Bakers can view own orders" ON orders
  FOR SELECT USING (
    baker_id IN (
      SELECT id FROM bakers WHERE user_id = auth.uid()::text
    )
  );

CREATE POLICY "Anyone can create orders" ON orders
  FOR INSERT WITH CHECK (true);

-- Themes policies
CREATE POLICY "Public can view active themes" ON themes
  FOR SELECT USING (is_active = true);

-- 4. Create storage bucket for uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('uploads', 'uploads', true);

-- 5. Storage policies
CREATE POLICY "Anyone can upload files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'uploads');

CREATE POLICY "Public can view uploaded files" ON storage.objects
  FOR SELECT USING (bucket_id = 'uploads');

-- 6. Create a function to handle user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    NEW.id::text,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    'baker'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Trigger to create user record on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 8. Update sequences to use UUID
ALTER TABLE users ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE bakers ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE customers ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE orders ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE gallery ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE themes ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE messages ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE gallery_inquiries ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE files ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;