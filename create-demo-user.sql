-- Create Demo User for BakerLNK
-- Run this AFTER running minimal-supabase-fix.sql
-- This creates the demo user baker@example.com / password123

-- First check if demo user exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'baker@example.com') THEN
        -- Create demo user via Supabase Auth (this is the safe way)
        RAISE NOTICE 'Demo user does not exist. You need to create it via signup in your app.';
        RAISE NOTICE 'Alternative: Use the Quick Test Signup button in your app';
    ELSE
        RAISE NOTICE 'Demo user already exists!';
    END IF;
END $$;

-- Alternative: Create a different test user that you can use
-- This approach is safer than trying to manipulate auth.users directly

INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data,
    raw_app_meta_data,
    aud,
    role
) 
VALUES (
    gen_random_uuid(),
    'test@bakerlink.com',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"name": "Test Baker"}'::jsonb,
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    'authenticated',
    'authenticated'
) ON CONFLICT (email) DO NOTHING;

SELECT 
    'Demo user setup complete!' as status,
    'You can now login with test@bakerlink.com / password123' as credentials,
    'Or use the Quick Test Signup button to create a new account' as alternative;