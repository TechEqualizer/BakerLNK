# Supabase Signup Error Troubleshooting

## Error: "Database error saving new user"

This error typically occurs due to Row Level Security (RLS) policies or database configuration issues.

## Quick Fixes

### 1. Check Authentication Settings

In your Supabase dashboard:
1. Go to **Authentication > Settings**
2. Ensure **Enable email confirmations** is set correctly:
   - For development: **DISABLE** email confirmation
   - For production: **ENABLE** with proper email templates
3. Check **Site URL** matches your domain
4. Verify **Redirect URLs** include your app URLs

### 2. Database Schema Issues

Run this SQL in your Supabase SQL Editor:

```sql
-- Check if auth.users table exists and has required columns
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'auth' AND table_name = 'users';

-- Check for any triggers that might be failing
SELECT trigger_name, event_manipulation, trigger_schema, trigger_name 
FROM information_schema.triggers 
WHERE event_object_schema = 'auth' AND event_object_table = 'users';
```

### 3. Row Level Security (RLS) Policies

Check if you have a `profiles` or `users` table with overly restrictive RLS:

```sql
-- Temporarily disable RLS on custom user tables for testing
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
-- OR if you have a profiles table:
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- After testing, re-enable with proper policies:
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Add a policy that allows users to insert their own profile
CREATE POLICY "Users can create their own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);
```

### 4. Email Confirmation Settings

For development, disable email confirmation:

```sql
-- Run in Supabase SQL Editor
UPDATE auth.config 
SET 
    email_confirmation = false,
    email_change_confirmation = false;
```

## Testing the Fix

1. Try signing up with a new email address
2. Check Supabase Auth > Users to see if the user was created
3. Check browser Network tab for specific error details
4. Check Supabase logs for more detailed error messages

## Common Solutions by Error Type

### "Invalid email"
- Email format validation issue
- Solution: Use a valid email format

### "Email already registered" 
- User already exists
- Solution: Try different email or implement login flow

### "Password too weak"
- Password doesn't meet requirements
- Solution: Use stronger password (8+ chars, mixed case, numbers)

### "Email not confirmed"
- Email confirmation required but not completed
- Solution: Disable email confirmation for development

## Development vs Production

### Development Setup:
```sql
UPDATE auth.config SET email_confirmation = false;
```

### Production Setup:
```sql
UPDATE auth.config SET 
    email_confirmation = true,
    email_change_confirmation = true;
```

And configure email templates in Authentication > Email Templates.

## Next Steps

1. Try the fixes above in order
2. Test signup with a fresh email address
3. Check Supabase dashboard logs for detailed errors
4. If issues persist, check for custom database triggers or functions