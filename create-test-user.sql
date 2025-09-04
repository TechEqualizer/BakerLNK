-- Simple script to create a test user for authentication
-- This works around the complex user table requirements

-- First, let's see what columns exist in your tables
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'bakers' 
ORDER BY ordinal_position;

-- Create a simple baker record that can be used for testing
-- This will work with whatever columns exist
INSERT INTO bakers (
  id, 
  user_id, 
  business_name, 
  description,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'test-user-auth-id',
  'Sweet Dreams Bakery',
  'Test bakery for demo purposes',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;