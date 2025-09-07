-- Supabase Setup Script for BakerLink
-- Run these commands in your Supabase SQL Editor to fix common signup issues

-- 1. Disable email confirmation for development (OPTIONAL)
-- Uncomment the line below if you want to disable email confirmation during development
-- UPDATE auth.config SET email_confirmation = false;

-- 2. Create profiles table if it doesn't exist (OPTIONAL)
-- This is only needed if your app expects a profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (id)
);

-- 3. Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for profiles table
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- 5. Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create trigger to call the function on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 7. Check if bakers table exists and has proper RLS
-- If you have a custom bakers table, ensure it has proper RLS policies
-- Example:
/*
CREATE POLICY "Users can view their own baker profile" ON public.bakers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own baker profile" ON public.bakers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own baker profile" ON public.bakers
    FOR UPDATE USING (auth.uid() = user_id);
*/

-- 8. Verify the setup
SELECT 
    tablename,
    rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename IN ('profiles', 'bakers');

-- Check auth configuration
SELECT * FROM auth.config;

-- Check existing policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public';

-- End of setup script
-- If you run into issues:
-- 1. Check the Supabase logs for more detailed error messages
-- 2. Ensure your app's authentication flow matches your database schema
-- 3. Test with a fresh email address
-- 4. Check that email confirmation settings match your app's expectations