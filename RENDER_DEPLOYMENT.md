# 🚀 Render Deployment Guide for Sara Pharmacy

## Overview
Render is an excellent platform for deploying full-stack applications. We'll deploy both backend and frontend on Render with separate services.

## Prerequisites

1. **Render Account**: Sign up at [render.com](https://render.com)
2. **Git Repository**: Push your code to GitHub/GitLab
3. **MongoDB Atlas**: Set up a cloud MongoDB database

## 🎯 Deployment Strategy

```
Frontend (React) ──→ Render Static Site
Backend (Node.js) ──→ Render Web Service  
Database (MongoDB) ──→ MongoDB Atlas
```

## Step 1: Deploy Backend (Web Service)

### A. Create Web Service
1. Go to [render.com](https://render.com) dashboard
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select your Sara Pharmacy repository

### B. Configure Backend Service
- **Name:** `sara-pharmacy-backend`
- **Root Directory:** `backend`
- **Environment:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Instance Type:** `Free` (or paid for better performance)

### C. Environment Variables for Backend
Set these in Render dashboard:

```bash
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sara-pharmacy
JWT_SECRET=your-32-character-secret-key
JWT_EXPIRE=30d

# Firebase (Optional - for push notifications)
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com

# CORS Origins (Add after frontend deployment)
FRONTEND_URL=https://your-frontend.onrender.com
```

### D. Deploy Backend
1. Click **"Create Web Service"**
2. Wait for deployment (5-10 minutes)
3. Note your backend URL: `https://sara-pharmacy-backend.onrender.com`

## Step 2: Deploy Frontend (Static Site)

### A. Create Static Site
1. In Render dashboard, click **"New +"** → **"Static Site"**
2. Connect the same GitHub repository
3. Select your Sara Pharmacy repository

### B. Configure Frontend Service
- **Name:** `sara-pharmacy-frontend`
- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Publish Directory:** `dist`

### C. Environment Variables for Frontend
Set these in Render dashboard:

```bash
VITE_API_BASE_URL=https://sara-pharmacy-backend.onrender.com/api/v1
VITE_API_URL=https://sara-pharmacy-backend.onrender.com
VITE_SOCKET_URL=https://sara-pharmacy-backend.onrender.com

# App Configuration
VITE_APP_NAME="Sara Pharmacy"
VITE_APP_VERSION=1.0.0
NODE_ENV=production

# Optional - Google Maps
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Optional - Firebase
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
VITE_FIREBASE_API_KEY=your-firebase-api-key
```

### D. Deploy Frontend
1. Click **"Create Static Site"**
2. Wait for deployment (3-5 minutes)
3. Note your frontend URL: `https://sara-pharmacy-frontend.onrender.com`

## Step 3: Update Backend CORS

After frontend deployment, update backend environment variables:

```bash
# Add this to backend environment variables
FRONTEND_URL=https://sara-pharmacy-frontend.onrender.com
PRODUCTION_ORIGINS=https://sara-pharmacy-frontend.onrender.com
```

Then update your `server.js` (if needed):

```javascript
// In server.js, update CORS origins
const getAllowedOrigins = () => {
  const baseOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    // Add your Render frontend URL
    'https://sara-pharmacy-frontend.onrender.com'
  ];
  
  if (process.env.FRONTEND_URL) {
    baseOrigins.push(process.env.FRONTEND_URL);
  }
  
  if (process.env.PRODUCTION_ORIGINS) {
    const prodOrigins = process.env.PRODUCTION_ORIGINS.split(',');
    baseOrigins.push(...prodOrigins);
  }
  
  return baseOrigins;
};
```

## Step 4: MongoDB Atlas Setup

### Database Configuration
1. Create MongoDB Atlas cluster ([guide](./MONGODB_SETUP.md))
2. Create database user and whitelist IP `0.0.0.0/0`
3. Get connection string
4. Add to backend environment variables

## Step 5: Custom Domains (Optional)

### For Custom Domain:
1. Go to service settings in Render
2. Add custom domain
3. Configure DNS records
4. Update CORS with new domain

## 🔧 Render.yaml Configuration (Alternative)

You can also use `render.yaml` for Infrastructure as Code:

```yaml
services:
  - type: web
    name: sara-pharmacy-backend
    env: node
    buildCommand: cd backend && npm install
    startCommand: cd backend && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: MONGODB_URI
        sync: false
      - key: JWT_SECRET
        sync: false

  - type: web
    name: sara-pharmacy-frontend
    env: static
    buildCommand: cd frontend && npm install && npm run build
    staticPublishPath: frontend/dist
    envVars:
      - key: VITE_API_BASE_URL
        value: https://sara-pharmacy-backend.onrender.com/api/v1
      - key: NODE_ENV
        value: production
```

## 📊 Performance & Monitoring

### Free Tier Limitations:
- Services sleep after 15 minutes of inactivity
- 750 hours/month limit
- Slower cold starts

### Performance Tips:
1. **Keep services warm** with uptime monitoring
2. **Optimize build times** by caching dependencies
3. **Use environment variables** for configuration
4. **Enable compression** in Express

### Monitoring:
- Render provides built-in monitoring
- Check logs in Render dashboard
- Set up health check endpoints

## 🚨 Common Issues & Solutions

### 1. Service Won't Start
**Error:** Application failed to start
**Solution:**
- Check build logs in Render dashboard
- Verify `package.json` scripts
- Ensure Node.js version compatibility

### 2. Database Connection Issues
**Error:** MongoDB connection timeout
**Solution:**
- Verify MongoDB Atlas IP whitelist (0.0.0.0/0)
- Check connection string format
- Test connection locally first

### 3. CORS Errors
**Error:** Frontend can't connect to backend
**Solution:**
- Add frontend URL to backend CORS
- Check environment variables
- Verify both services are deployed

### 4. Environment Variables Not Loading
**Error:** Variables undefined in application
**Solution:**
- Check spelling in Render dashboard
- Restart services after adding variables
- Use correct prefixes (VITE_ for frontend)

### 5. Build Failures
**Error:** Build command failed
**Solution:**
- Check `build.sh` file permissions
- Verify all dependencies in `package.json`
- Test build locally: `npm run build`

## 🔄 Auto-Deployment

Render automatically deploys when you push to your connected branch:
- **Push to main** → Automatic deployment
- **Pull requests** → Preview deployments (paid plans)

## 💰 Pricing

### Free Tier:
- 750 hours/month across all services
- Services sleep after 15 minutes
- Suitable for development/testing

### Paid Plans:
- $7/month per service (no sleep)
- Better performance and uptime
- Custom domains included

## 🛠️ Useful Commands

### Local Testing:
```bash
# Test backend locally
cd backend
npm run dev

# Test frontend locally  
cd frontend
npm run dev

# Test production build
npm run build
npm run preview
```

### Debugging:
```bash
# Check logs
curl https://sara-pharmacy-backend.onrender.com/health

# Test API endpoints
curl https://sara-pharmacy-backend.onrender.com/api/v1/medicines
```

## ✅ Deployment Checklist

- [ ] MongoDB Atlas database created
- [ ] Backend deployed to Render Web Service
- [ ] Frontend deployed to Render Static Site
- [ ] Environment variables configured
- [ ] CORS updated with frontend URL
- [ ] Health check endpoint working
- [ ] Database connection verified
- [ ] Frontend-backend communication tested
- [ ] Custom domains configured (if needed)

## 🎯 Quick Deploy Commands Summary

### If using GitHub:
```bash
# 1. Push your code to GitHub
git add .
git commit -m "Deploy to Render"
git push origin main

# 2. Connect repository in Render dashboard
# 3. Configure both services as described above
# 4. Deploy and test!
```

## 🌐 Your Live URLs

After successful deployment:
- **Frontend:** `https://sara-pharmacy-frontend.onrender.com`
- **Backend:** `https://sara-pharmacy-backend.onrender.com`
- **Health Check:** `https://sara-pharmacy-backend.onrender.com/health`

## 📞 Support

- **Render Docs:** [render.com/docs](https://render.com/docs)
- **Community:** Render Discord/Forums
- **Status:** [status.render.com](https://status.render.com)

---

## 🚀 Quick Start Summary

1. **Create Render account** and connect GitHub
2. **Deploy backend** as Web Service (`backend` folder)
3. **Deploy frontend** as Static Site (`frontend` folder)  
4. **Configure environment variables** for both services
5. **Update CORS** with frontend URL
6. **Test your live application**

Your Sara Pharmacy will be live on Render! 🎉

**Deployed by:** Shweat Yadav  
**Platform:** Render  
**Last Updated:** January 2025