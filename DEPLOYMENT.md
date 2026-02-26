# 🚀 Vercel Deployment Guide

## Quick Deploy Steps

### 1. Install Vercel CLI
```bash
npm i -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Setup Environment Variables
```bash
# Add these in Vercel Dashboard or via CLI
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_KEY
vercel env add JWT_SECRET
```

### 4. Deploy
```bash
vercel --prod
```

---

## Manual Deployment (Dashboard)

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/tourist-places-assam.git
git push -u origin main
```

### Step 2: Import to Vercel
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure project:
   - **Framework Preset**: Other
   - **Build Command**: (leave empty)
   - **Output Directory**: (leave empty)
   - **Install Command**: `npm install`

### Step 3: Add Environment Variables
In Vercel Dashboard → Project Settings → Environment Variables:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
JWT_SECRET=your-jwt-secret-min-32-characters
NODE_ENV=production
```

### Step 4: Deploy
Click "Deploy" and wait for build to complete.

---

## Post-Deployment Setup

### 1. Create Supabase Project
- Go to https://supabase.com
- Create new project
- Run database migrations (see below)

### 2. Database Migration SQL
```sql
-- Users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Places table
CREATE TABLE places (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  category TEXT,
  rating DECIMAL(2,1) DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Events table
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date DATE,
  location TEXT,
  organizer TEXT,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  category TEXT,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Reviews table
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  place_id UUID REFERENCES places(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Adventures table
CREATE TABLE adventures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  duration TEXT,
  price DECIMAL(10,2),
  rating DECIMAL(2,1) DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3. Create Admin User
1. Visit your deployed site
2. Register a new account
3. Go to Supabase Dashboard → Table Editor → users
4. Change role from 'user' to 'admin'
5. Login again to access admin dashboard

---

## Troubleshooting

### Build Errors
```bash
# Check logs
vercel logs --all

# Redeploy
vercel --force
```

### Database Connection Issues
- Verify environment variables in Vercel dashboard
- Check Supabase project is active
- Ensure RLS policies are configured

### Static Assets Not Loading
- Check `vercel.json` routes configuration
- Ensure assets are in correct directory

---

## Custom Domain (Optional)

1. Vercel Dashboard → Domains
2. Add your domain
3. Update DNS records as instructed

---

## Your Deployed URLs

After deployment, your site will be available at:
- **Production**: `https://your-project.vercel.app`
- **Admin Panel**: `https://your-project.vercel.app/admin/dashboard`

---

## Support

For issues:
1. Check Vercel logs: `vercel logs --all`
2. Check Supabase logs in dashboard
3. Verify environment variables

