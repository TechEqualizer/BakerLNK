-- Quick database verification script
-- Run this in your Supabase SQL Editor to check if tables exist

-- Check if our main tables exist
SELECT 
    'themes' as table_name, 
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'themes' AND table_schema = 'public') 
         THEN '✅ EXISTS' 
         ELSE '❌ MISSING' 
    END as status
UNION ALL
SELECT 
    'bakers' as table_name, 
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bakers' AND table_schema = 'public') 
         THEN '✅ EXISTS' 
         ELSE '❌ MISSING' 
    END as status
UNION ALL
SELECT 
    'customers' as table_name, 
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customers' AND table_schema = 'public') 
         THEN '✅ EXISTS' 
         ELSE '❌ MISSING' 
    END as status
UNION ALL
SELECT 
    'orders' as table_name, 
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders' AND table_schema = 'public') 
         THEN '✅ EXISTS' 
         ELSE '❌ MISSING' 
    END as status
UNION ALL
SELECT 
    'gallery' as table_name, 
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'gallery' AND table_schema = 'public') 
         THEN '✅ EXISTS' 
         ELSE '❌ MISSING' 
    END as status
UNION ALL
SELECT 
    'Storage bucket: uploads' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'uploads')
         THEN '✅ EXISTS'
         ELSE '❌ MISSING'
    END as status;

-- Show table counts
SELECT 'Table Counts:' as info;
SELECT 
    schemaname,
    relname as tablename,
    n_tup_ins as rows_inserted
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
ORDER BY relname;