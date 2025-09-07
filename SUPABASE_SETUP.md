# Supabase Setup Guide

## Quick Start

1. **Update the .env file** with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

2. **Get your credentials from Supabase:**
   - Go to https://app.supabase.com
   - Select your project (or create a new one)
   - Navigate to Settings > API
   - Copy the Project URL and anon public key

3. **Restart the development server** after updating the .env file:
   ```bash
   npm run dev
   ```

## What's Fixed

1. **Authentication Flow**: The app now properly handles async authentication checks, preventing logout issues.

2. **Theme System**: The app will now:
   - Use a default theme when Supabase is not configured
   - Show helpful warnings in the console
   - Handle errors gracefully

3. **Routing**: Authentication state is now properly managed with loading states.

## Testing the App

Without Supabase configured:
- The app will work with a default theme
- Authentication features won't work (login/signup)
- You'll see warnings in the console

With Supabase configured:
- Themes will load from your Supabase database
- Authentication will work properly
- All features will be available

## Need Help?

If you're still having issues:
1. Check the browser console for error messages
2. Ensure your Supabase project has the required tables
3. Verify your credentials are correct