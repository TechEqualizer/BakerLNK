-- Export your current schema from Prisma
-- This matches your existing Prisma schema

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Bakers can manage own data" ON bakers
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Bakers can manage own customers" ON customers
  FOR ALL USING (baker_id IN (
    SELECT id FROM bakers WHERE user_id = auth.uid()
  ));

CREATE POLICY "Public can view baker profiles" ON bakers
  FOR SELECT USING (true);

CREATE POLICY "Public can view gallery" ON gallery
  FOR SELECT USING (true);