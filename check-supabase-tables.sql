-- Check what tables exist in your Supabase database
-- Run this in Supabase SQL Editor to diagnose the issue

-- Check if users table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'users'
) as users_table_exists;

-- List all tables in public schema
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check if the auth trigger exists
SELECT EXISTS (
    SELECT FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created'
) as auth_trigger_exists;

-- Check if handle_new_user function exists
SELECT EXISTS (
    SELECT FROM pg_proc 
    WHERE proname = 'handle_new_user'
) as handle_new_user_function_exists;

-- Get more details about any errors
SELECT 
    'If users table is missing, run minimal-supabase-fix.sql' as next_step,
    'If trigger is missing, the auth hook is not set up' as trigger_info;