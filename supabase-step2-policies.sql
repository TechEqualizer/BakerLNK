-- Step 2: Create RLS Policies
-- Copy and paste this into Supabase SQL Editor

-- Public can view all bakers (for showcase)
CREATE POLICY "Public can view all bakers" 
ON bakers
FOR SELECT 
TO public
USING (true);

-- Public can view all gallery items (for showcase)  
CREATE POLICY "Public can view all gallery items" 
ON gallery
FOR SELECT 
TO public
USING (true);

-- Anyone can create orders (for public inquiries)
CREATE POLICY "Anyone can create orders" 
ON orders
FOR INSERT 
TO public
WITH CHECK (true);

-- Public can view active themes
CREATE POLICY "Public can view active themes" 
ON themes
FOR SELECT 
TO public
USING (is_active = true);

-- Authenticated users can create customers
CREATE POLICY "Auth users can create customers" 
ON customers
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Authenticated users can create bakers
CREATE POLICY "Auth users can create bakers" 
ON bakers
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Authenticated users can update their own baker profile
CREATE POLICY "Users can update own baker profile" 
ON bakers
FOR UPDATE 
TO authenticated
USING (user_id = auth.uid()::text);

-- Authenticated users can create gallery items
CREATE POLICY "Auth users can create gallery items" 
ON gallery
FOR INSERT 
TO authenticated
WITH CHECK (true);