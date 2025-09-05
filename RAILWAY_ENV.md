# 🔧 Railway Environment Configuration

## Required Environment Variables

Set these variables in Railway Dashboard under your service → Variables tab:

### Core Application Settings
```bash
NODE_ENV=production
PORT=5001
```

### Database Configuration
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sara-pharmacy?retryWrites=true&w=majority
```

### Security Settings
```bash
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRE=30d
```

### CORS and Frontend Configuration
```bash
# Add your frontend domains (comma-separated)
PRODUCTION_ORIGINS=https://your-frontend.vercel.app,https://your-custom-domain.com
FRONTEND_URL=https://your-frontend.vercel.app
```

### Firebase Configuration (Optional - for push notifications)
```bash
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

## Setting Variables via Railway CLI

```bash
# Core settings
railway variables set NODE_ENV=production
railway variables set PORT=5001

# Database
railway variables set MONGODB_URI="your-mongodb-connection-string"

# Security
railway variables set JWT_SECRET="your-32-character-secret-key"

# Frontend configuration
railway variables set FRONTEND_URL="https://your-frontend.vercel.app"
railway variables set PRODUCTION_ORIGINS="https://your-frontend.vercel.app,https://your-domain.com"

# Firebase (if using push notifications)
railway variables set FIREBASE_PROJECT_ID="your-project-id"
railway variables set FIREBASE_CLIENT_EMAIL="your-service-account-email"
railway variables set FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"
```

## Verification

After setting variables, restart your Railway service:

```bash
railway redeploy
```

Check logs to ensure all configurations are loaded:

```bash
railway logs
```

You should see:
- "MongoDB Connected Successfully"
- "Firebase Admin initialized" (if configured)
- "Server running on port XXXX"

## Frontend Environment Variables

If deploying frontend to Vercel/Netlify, set these variables:

```bash
VITE_API_BASE_URL=https://your-backend.railway.app/api/v1
VITE_API_URL=https://your-backend.railway.app
VITE_SOCKET_URL=https://your-backend.railway.app
```

---

**Note:** Replace all placeholder values with your actual configuration values.