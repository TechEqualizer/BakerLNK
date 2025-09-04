# BakerLNK - Supabase Deployment Guide

BakerLNK is now fully integrated with Supabase, allowing instant deployment to Netlify without a separate backend server!

## 🚀 Quick Start

### 1. Supabase Setup (5 minutes)

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Save your project URL and anon key

2. **Run Database Setup**
   - Go to SQL Editor in Supabase Dashboard
   - Copy contents of `supabase-final-setup.sql`
   - Paste and run

3. **Create Storage Bucket**
   - Go to Storage in Supabase Dashboard
   - Click "New Bucket"
   - Name: `uploads`
   - Make it PUBLIC
   - Save

4. **Enable Realtime (Optional)**
   - Go to Database → Replication
   - Enable tables: `orders`, `messages`, `gallery_inquiries`

### 2. Local Development

```bash
# Clone the repository
git clone <your-repo>
cd BakerLNK

# Install dependencies
npm install

# Create .env.local file
cp .env.production.example .env.local

# Add your Supabase credentials to .env.local
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Start development server
npm run dev
```

### 3. Deploy to Netlify (5 minutes)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect GitHub and select your repo

3. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`

4. **Add Environment Variables**
   - Click "Site settings" → "Environment variables"
   - Add:
     - `VITE_SUPABASE_URL` = your-supabase-url
     - `VITE_SUPABASE_ANON_KEY` = your-supabase-anon-key

5. **Deploy**
   - Click "Deploy site"
   - Your site will be live in 1-2 minutes!

## 🎉 Features

- **No Backend Required**: Everything runs on Supabase
- **Instant Deployment**: Deploy to Netlify in minutes
- **Real-time Updates**: Live data synchronization
- **Secure**: Row Level Security (RLS) built-in
- **Scalable**: Handles thousands of users automatically

## 📱 What's Included

- User Authentication
- Baker Profile Management
- Gallery with Image Uploads
- Order Management
- Customer Database
- Theme Customization
- Social Media Links
- Contact Forms

## 🔧 Troubleshooting

### "Supabase not configured" error
- Check that your environment variables are set correctly
- Make sure you're using the correct URL and anon key

### Images not uploading
- Verify the 'uploads' bucket exists and is PUBLIC
- Check storage policies in Supabase

### Authentication issues
- Ensure email confirmation is disabled for development
- Check RLS policies are correctly applied

## 🚀 Advanced Features

### Custom Domain
1. In Netlify, go to Domain settings
2. Add your custom domain
3. Follow DNS configuration steps

### Email Notifications
- Set up Supabase Edge Functions for email
- Or use Netlify Functions with SendGrid

### Analytics
- Add Google Analytics or Plausible
- Track user behavior and conversions

## 🤝 Support

Need help? Check out:
- [Supabase Docs](https://supabase.com/docs)
- [Netlify Docs](https://docs.netlify.com)
- Open an issue on GitHub

---

Built with ❤️ using React, Supabase, and Tailwind CSS