# 🚀 Production Deployment Guide - bakerlnk.netlify.app

## Current Issue: Signup Error on Live Site

Your live site at `https://bakerlnk.netlify.app/auth` is showing "Database error saving new user" because:

1. Environment variables aren't configured on Netlify
2. Supabase needs production URL configuration
3. Database RLS policies may need setup

## Step-by-Step Fix

### 1. 📝 Configure Netlify Environment Variables

**Go to:** [Netlify Dashboard](https://app.netlify.com) → Your BakerLNK site → Site configuration → Environment variables

**Add these variables:**

| Key | Value |
|-----|-------|
| `VITE_SUPABASE_URL` | `https://bdubtgsgjbutsythfdbm.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkdWJ0Z3NnamJ1dHN5dGhmZGJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2NzMyNTcsImV4cCI6MjA3MjI0OTI1N30.oUAInm50HIa74XYXi_FnKwg5XE5h78s64RFkwnIlbU0` |

### 2. 🔧 Configure Supabase for Production

**Go to:** [Supabase Dashboard](https://supabase.com/dashboard/project/bdubtgsgjbutsythfdbm)

**Authentication → Settings:**
- **Site URL:** `https://bakerlnk.netlify.app`
- **Redirect URLs:** Add `https://bakerlnk.netlify.app/**`
- **Email Confirmations:** Enable for production (or disable for testing)

### 3. 🗄️ Fix Database Configuration

**Go to:** Supabase Dashboard → SQL Editor

**Copy and paste this entire script:**

\`\`\`sql
-- Fix RLS policies for user signup
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (id)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Create trigger for automatic profile creation
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
\`\`\`

### 4. 🚀 Deploy Updated Configuration

**In your terminal:**

\`\`\`bash
# Add netlify configuration
cp netlify-config.toml netlify.toml

# Commit and push
git add .
git commit -m "fix: Add Netlify production configuration"
git push
\`\`\`

**Netlify will automatically redeploy your site.**

### 5. ✅ Test the Fix

1. Wait for Netlify deployment to complete (~2 minutes)
2. Visit `https://bakerlnk.netlify.app/auth`
3. Try signing up with a new email address
4. Should work now! 🎉

## 🔍 Troubleshooting

### If signup still fails:

1. **Check browser console** for specific error messages
2. **Check Netlify deploy logs** for build errors
3. **Verify environment variables** were saved correctly
4. **Check Supabase logs** in your dashboard

### Common Issues:

- **"Supabase not configured"** → Environment variables not set on Netlify
- **"Invalid email"** → Email format issue, try different email
- **"Email not confirmed"** → Check email confirmation settings in Supabase

### Quick Debug:

Visit your site's console and run:
\`\`\`javascript
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
\`\`\`

Both should show values, not `undefined`.

---

**After these steps, your live site should work perfectly!** 🚀