-- Test user creation and baker profile creation
-- Run this in your Supabase SQL Editor to test the full flow

-- 1. Check if we can see auth.users (this should show existing users)
SELECT 'Current auth users:' as info;
SELECT id, email, created_at FROM auth.users LIMIT 5;

-- 2. Check if RLS policies are blocking us
SELECT 'Testing RLS policies:' as info;

-- 3. Try to create a test baker profile manually (this will fail if RLS is too strict)
-- First, let's see what user ID we can use for testing
SELECT 'Available user IDs for testing:' as info;
SELECT id as user_id FROM auth.users LIMIT 1;

-- 4. Test theme access (should work - public read)
SELECT 'Theme access test:' as info;
SELECT id, theme_name FROM public.themes LIMIT 3;

-- 5. Test if we can create a baker profile with a real user ID
-- This will help us understand if the RLS policies are working correctly
DO $$
DECLARE
    test_user_id uuid;
BEGIN
    -- Get a user ID from auth.users if one exists
    SELECT id INTO test_user_id FROM auth.users LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        -- Try to create a baker profile
        INSERT INTO public.bakers (user_id, business_name) 
        VALUES (test_user_id, 'Test Baker') 
        ON CONFLICT (user_id) DO NOTHING;
        
        RAISE NOTICE 'Baker profile creation test completed for user: %', test_user_id;
    ELSE
        RAISE NOTICE 'No users found in auth.users table';
    END IF;
END $$;

-- 6. Final verification
SELECT 'Final verification:' as info;
SELECT COUNT(*) as baker_count FROM public.bakers;
SELECT COUNT(*) as theme_count FROM public.themes;