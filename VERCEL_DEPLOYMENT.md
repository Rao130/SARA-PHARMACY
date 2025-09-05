# 🚀 Vercel Deployment Guide for Sara Pharmacy

## Overview
Vercel is perfect for deploying your React frontend. Since you have a full-stack application, we'll deploy:
- **Frontend (React)** → Vercel
- **Backend (Node.js)** → Railway/Heroku/Render

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Git Repository**: Push your code to GitHub/GitLab
3. **Backend Deployed**: Deploy backend first (Railway/Heroku recommended)

## Step 1: Install Vercel CLI

```bash
# Install globally
npm install -g vercel

# Or use npx (no installation needed)
npx vercel
```

## Step 2: Prepare Frontend for Deployment

### A. Update Build Scripts (Already Done ✅)
Your `package.json` already has the correct scripts:
```json
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### B. Test Build Locally
```bash
cd frontend
npm run build
npm run preview
```

## Step 3: Deploy to Vercel

### Option A: Using Vercel CLI (Recommended)

1. **Navigate to frontend folder:**
```bash
cd frontend
```

2. **Login to Vercel:**
```bash
vercel login
```

3. **Deploy:**
```bash
vercel
```

Follow the prompts:
- `Set up and deploy "frontend"?` → **Y**
- `Which scope?` → Select your account
- `Link to existing project?` → **N**
- `What's your project's name?` → `sara-pharmacy`
- `In which directory is your code located?` → `./` (current directory)

4. **Deploy to production:**
```bash
vercel --prod
```

### Option B: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click **"New Project"**
3. **Import Git Repository**
4. Select your Sara Pharmacy repository
5. **Configure Project:**
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

## Step 4: Configure Environment Variables

### In Vercel Dashboard:
1. Go to your project → **Settings** → **Environment Variables**
2. Add these variables:

```bash
# Required - Replace with your backend URL
VITE_API_BASE_URL=https://your-backend.railway.app/api/v1
VITE_API_URL=https://your-backend.railway.app
VITE_SOCKET_URL=https://your-backend.railway.app

# Optional - App Configuration
VITE_APP_NAME=Sara Pharmacy
VITE_APP_VERSION=1.0.0
NODE_ENV=production

# Optional - Firebase (if using notifications)
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com

# Optional - Google Maps (if using)
VITE_GOOGLE_MAPS_API_KEY=your-maps-api-key
```

### Using Vercel CLI:
```bash
# Set environment variables
vercel env add VITE_API_BASE_URL
vercel env add VITE_API_URL
vercel env add VITE_SOCKET_URL
```

## Step 5: Update Backend CORS (Important!)

Your backend needs to allow your Vercel domain. Update `server.js`:

```javascript
// Add your Vercel domain to CORS origins
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://sara-pharmacy.vercel.app',        // Add this
    'https://your-custom-domain.com',          // If you have custom domain
    // ... other origins
  ],
  // ... rest of CORS config
}));
```

## Step 6: Custom Domain (Optional)

### Add Custom Domain:
1. Go to Vercel Dashboard → Your Project → **Settings** → **Domains**
2. Add your domain (e.g., `sarapharmacy.com`)
3. Configure DNS records as instructed
4. Update backend CORS with new domain

## Step 7: Backend Deployment Options

### Option A: Railway (Recommended)
```bash
# Deploy backend to Railway
cd backend
npm install -g @railway/cli
railway login
railway init
railway up
```

### Option B: Heroku
```bash
# Deploy backend to Heroku
cd backend
npm install -g heroku
heroku login
heroku create sara-pharmacy-api
git push heroku main
```

### Option C: Render
1. Go to [render.com](https://render.com)
2. Connect your repository
3. Choose **Web Service**
4. Configure:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

## Step 8: Test Deployment

1. **Check frontend:** Visit your Vercel URL
2. **Test API connection:** Check browser console for API errors
3. **Test features:** Login, browse medicines, place orders

## Common Issues & Solutions

### 1. Build Failures
**Error:** `Module not found` or build errors
**Solution:**
- Check all imports use correct paths
- Ensure all dependencies are in `package.json`
- Test build locally: `npm run build`

### 2. API Connection Issues
**Error:** Network errors, CORS issues
**Solution:**
- Verify `VITE_API_BASE_URL` is correct
- Check backend CORS includes Vercel domain
- Ensure backend is deployed and running

### 3. Environment Variables Not Working
**Error:** `process.env.VITE_*` is undefined
**Solution:**
- Variables must start with `VITE_`
- Set variables in Vercel Dashboard
- Redeploy after adding variables

### 4. Routing Issues (404 on refresh)
**Error:** 404 when refreshing pages
**Solution:** Already handled in `vercel.json` with:
```json
{
  "routes": [
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

## Automatic Deployments

Vercel automatically deploys when you push to your repository:
- **Push to main branch** → Production deployment
- **Push to other branches** → Preview deployment

## Useful Vercel Commands

```bash
# View deployments
vercel ls

# View project info
vercel inspect

# View logs
vercel logs

# Set environment variable
vercel env add VARIABLE_NAME

# Remove deployment
vercel remove

# Link local project to Vercel
vercel link
```

## Performance Optimization

### 1. Bundle Analysis
```bash
npm run build
npx vite-bundle-analyzer dist
```

### 2. Code Splitting (Already Enabled ✅)
Vite automatically splits your code for better performance.

### 3. Asset Optimization
- Images are optimized by Vercel automatically
- Use WebP format for better compression
- Implement lazy loading for images

## Production Checklist

- [ ] Frontend builds successfully locally
- [ ] Backend deployed and accessible
- [ ] Environment variables set in Vercel
- [ ] Backend CORS includes Vercel domain
- [ ] All API endpoints working
- [ ] Socket.IO connections working
- [ ] Custom domain configured (if needed)
- [ ] SSL certificate active
- [ ] Performance optimized

## Support & Troubleshooting

- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
- **Build Logs:** Check deployment logs in Vercel dashboard
- **Runtime Logs:** Use `vercel logs` command
- **Community:** Vercel Discord/GitHub discussions

---

## Quick Deploy Commands Summary

```bash
# 1. Deploy frontend to Vercel
cd frontend
npx vercel
npx vercel --prod

# 2. Deploy backend to Railway
cd backend
npx @railway/cli login
npx @railway/cli init
npx @railway/cli up

# 3. Update environment variables in both platforms
# 4. Test your live application!
```

**Your app will be live at:** `https://sara-pharmacy.vercel.app`  
**Developed by:** Shweat Yadav  
**Last Updated:** January 2025