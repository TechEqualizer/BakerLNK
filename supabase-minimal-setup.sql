-- Minimal Supabase Setup - Run this in SQL Editor
-- This gets your app working without complex storage policies

-- 1. Enable RLS on main tables
ALTER TABLE IF EXISTS bakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS themes ENABLE ROW LEVEL SECURITY;

-- 2. Basic policies for public access (needed for showcase)
CREATE POLICY IF NOT EXISTS "Public read bakers" 
ON bakers FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Public read gallery" 
ON gallery FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Public create orders" 
ON orders FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Public read themes" 
ON themes FOR SELECT USING (true);

-- 3. Auth user policies
CREATE POLICY IF NOT EXISTS "Auth create bakers" 
ON bakers FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Auth update own baker" 
ON bakers FOR UPDATE USING (user_id = auth.uid()::text);

-- 4. Create user trigger
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (NEW.id::text, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email), 'baker')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();