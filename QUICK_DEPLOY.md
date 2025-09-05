# 🚀 Quick Deploy to Railway - Sara Pharmacy

## One-Click Deployment Commands

### 1. Install Railway CLI
```bash
npm install -g @railway/cli
```

### 2. Login and Initialize
```bash
railway login
cd "c:\Users\Shweat Yadav\Desktop\sara-pharmacy"
railway init
```

### 3. Set Essential Environment Variables
```bash
# Replace with your actual values
railway variables set NODE_ENV=production
railway variables set MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/sara-pharmacy"
railway variables set JWT_SECRET="your-32-character-secret-key-here"
railway variables set PORT=5001
```

### 4. Deploy!
```bash
railway up
```

## ✅ Deployment Checklist

Before deploying, ensure you have:

- [ ] **MongoDB Atlas** database set up ([Guide](./MONGODB_SETUP.md))
- [ ] **JWT Secret** generated (minimum 32 characters)
- [ ] **Railway account** created at [railway.app](https://railway.app)
- [ ] **Git repository** pushed to GitHub/GitLab
- [ ] **Environment variables** ready

## 📋 Essential Environment Variables

### Minimum Required:
```bash
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sara-pharmacy
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
PORT=5001
```

### Optional (for full features):
```bash
FRONTEND_URL=https://your-frontend.vercel.app
PRODUCTION_ORIGINS=https://your-frontend.vercel.app,https://your-domain.com
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"
```

## 🎯 After Deployment

1. **Get your Railway URL:**
```bash
railway domain
```

2. **Check deployment status:**
```bash
railway logs
railway status
```

3. **Test your API:**
```bash
# Replace with your actual Railway URL
curl https://your-app.railway.app/health
```

4. **Initialize database:**
```bash
railway run npm run create-admin
railway run npm run seed-medicines
```

## 🌐 Deploy Frontend

### Option 1: Vercel (Recommended)
```bash
cd frontend
npx vercel
```

Set environment variables in Vercel:
```bash
VITE_API_BASE_URL=https://your-backend.railway.app/api/v1
VITE_SOCKET_URL=https://your-backend.railway.app
```

### Option 2: Netlify
```bash
cd frontend
npm run build
# Upload dist folder to Netlify
```

## 🔍 Troubleshooting

### Common Issues:

1. **Build fails:** Check Node.js version in `package.json`
2. **Database connection:** Verify MongoDB URI and IP whitelist
3. **CORS errors:** Add frontend domain to PRODUCTION_ORIGINS
4. **Environment variables:** Use Railway dashboard to set variables

## 📞 Quick Help

- **Railway Docs:** [docs.railway.app](https://docs.railway.app)
- **MongoDB Atlas:** [mongodb.com/atlas](https://mongodb.com/atlas)
- **Deployment Issues:** Check `railway logs` for detailed error messages

---

**Your app will be live at:** `https://your-app-name.railway.app`  
**Developer:** Shweat Yadav  
**Last Updated:** January 2025