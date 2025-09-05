# 🚀 Railway Deployment Guide for Sara Pharmacy

## Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **Git Repository**: Push your code to GitHub/GitLab
3. **MongoDB Atlas**: Set up a cloud MongoDB database
4. **Railway CLI** (optional but recommended)

## Step 1: Install Railway CLI

```bash
# Windows (PowerShell)
npm install -g @railway/cli

# Or using Homebrew on macOS/Linux
brew install railway
```

## Step 2: Login to Railway

```bash
railway login
```

## Step 3: Deploy Backend to Railway

### Option A: Using Railway CLI (Recommended)

1. **Navigate to your project directory:**
```bash
cd c:\Users\Shweat Yadav\Desktop\sara-pharmacy
```

2. **Initialize Railway project:**
```bash
railway init
```

3. **Deploy the application:**
```bash
railway up
```

### Option B: Using Railway Dashboard

1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Connect your GitHub account
4. Select your Sara Pharmacy repository
5. Railway will automatically detect your Node.js project

## Step 4: Configure Environment Variables

Set these environment variables in Railway Dashboard:

### Required Variables:
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sara-pharmacy
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
PORT=5001
```

### Optional Variables:
```
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
```

### Using Railway CLI to set variables:
```bash
railway variables set NODE_ENV=production
railway variables set MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/sara-pharmacy"
railway variables set JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters"
railway variables set PORT=5001
```

## Step 5: Deploy Frontend (Optional - Separate Service)

For frontend deployment, you can use:
- **Vercel** (Recommended for React apps)
- **Netlify**
- **Railway** (as a separate service)

### Using Vercel for Frontend:

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy frontend:
```bash
cd frontend
vercel
```

3. Set environment variables in Vercel dashboard:
```
VITE_API_BASE_URL=https://your-backend-domain.railway.app/api/v1
VITE_SOCKET_URL=https://your-backend-domain.railway.app
```

## Step 6: Custom Domain (Optional)

1. In Railway Dashboard → Your Service → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update CORS settings in your backend

## Step 7: Monitor Deployment

1. **Check deployment logs:**
```bash
railway logs
```

2. **Check service status:**
```bash
railway status
```

3. **View service URL:**
```bash
railway domain
```

## Common Issues and Solutions

### 1. Build Failures
- **Issue**: Node.js version mismatch
- **Solution**: Add `.nvmrc` file with your Node version:
```
18.17.0
```

### 2. Database Connection Issues
- **Issue**: MongoDB connection timeout
- **Solution**: 
  - Check MongoDB Atlas IP whitelist (allow 0.0.0.0/0 for Railway)
  - Verify connection string format
  - Check network access settings

### 3. Environment Variables Not Loading
- **Issue**: Variables not accessible in code
- **Solution**: 
  - Use Railway Dashboard to set variables
  - Restart the service after setting variables
  - Check variable names for typos

### 4. CORS Issues
- **Issue**: Frontend can't connect to backend
- **Solution**: Update CORS origins in server.js:
```javascript
origin: [
  'https://your-frontend-domain.vercel.app',
  'https://your-custom-domain.com'
]
```

## Production Checklist

- [ ] MongoDB Atlas database created and configured
- [ ] Environment variables set in Railway
- [ ] CORS origins updated for production domains
- [ ] JWT secret is strong and secure
- [ ] Firebase credentials configured (if using notifications)
- [ ] Frontend deployed and pointing to correct backend URL
- [ ] Custom domains configured (if needed)
- [ ] SSL certificates active
- [ ] Application tested in production environment

## Useful Railway Commands

```bash
# View service information
railway status

# View deployment logs
railway logs

# Open service in browser
railway open

# Connect to database (if using Railway PostgreSQL)
railway connect

# Restart service
railway redeploy

# View all projects
railway list

# Switch between projects
railway link
```

## Support

If you encounter issues:
1. Check Railway documentation: [docs.railway.app](https://docs.railway.app)
2. Check deployment logs for error details
3. Verify all environment variables are set correctly
4. Test locally with production environment variables

## Next Steps

After successful deployment:
1. Set up monitoring and alerts
2. Configure automated backups for MongoDB
3. Set up CI/CD pipeline for automatic deployments
4. Configure performance monitoring
5. Set up error tracking (e.g., Sentry)

---

**Deployed by:** Shweat Yadav  
**Last Updated:** January 2025