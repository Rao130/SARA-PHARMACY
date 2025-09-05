# 🔧 Backend Deployment Options for Sara Pharmacy

Since Vercel is primarily for frontend/static sites, you'll need to deploy your Node.js backend separately. Here are the best options:

## 🚀 Option 1: Railway (Recommended)

### Why Railway?
- ✅ Easy Node.js deployment
- ✅ Free tier available
- ✅ MongoDB Atlas integration
- ✅ Simple environment variables
- ✅ GitHub auto-deployment

### Quick Deploy:
```bash
cd backend
npm install -g @railway/cli
railway login
railway init
railway up
```

### Environment Variables for Railway:
```bash
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sara-pharmacy
JWT_SECRET=your-32-character-secret-key
PORT=5001
```

---

## 🌐 Option 2: Render

### Why Render?
- ✅ Free tier (with limitations)
- ✅ Auto-deploy from GitHub
- ✅ Built-in SSL
- ✅ Good for Node.js apps

### Setup:
1. Go to [render.com](https://render.com)
2. Connect GitHub repository
3. Choose **Web Service**
4. Configure:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

---

## ⚡ Option 3: Heroku

### Why Heroku?
- ✅ Mature platform
- ✅ Extensive add-ons
- ✅ Good documentation
- ⚠️ No free tier anymore

### Setup:
```bash
cd backend
npm install -g heroku
heroku login
heroku create sara-pharmacy-api
git push heroku main
```

---

## 🔥 Option 4: DigitalOcean App Platform

### Why DigitalOcean?
- ✅ Reliable hosting
- ✅ Good performance
- ✅ Competitive pricing
- ✅ Easy scaling

### Setup:
1. Go to DigitalOcean App Platform
2. Connect GitHub repository
3. Configure build settings
4. Deploy

---

## 🏆 Recommended Architecture

```
Frontend (React) ──→ Vercel
     ↓
Backend (Node.js) ──→ Railway
     ↓
Database (MongoDB) ──→ MongoDB Atlas
```

## 🔗 After Backend Deployment

1. **Get your backend URL** (e.g., `https://your-app.railway.app`)

2. **Update Vercel environment variables:**
```bash
VITE_API_BASE_URL=https://your-app.railway.app/api/v1
VITE_API_URL=https://your-app.railway.app
VITE_SOCKET_URL=https://your-app.railway.app
```

3. **Update backend CORS** to include Vercel domain:
```javascript
// In server.js
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://sara-pharmacy.vercel.app',  // Add your Vercel URL
    // ... other origins
  ]
}));
```

4. **Redeploy both services**

## 💡 Pro Tips

### 1. Use Environment Variables
Never hardcode URLs. Always use environment variables:
```javascript
const API_URL = process.env.VITE_API_BASE_URL || 'http://localhost:5006/api/v1';
```

### 2. Health Check Endpoint
Your backend already has `/health` endpoint - perfect for monitoring!

### 3. Database Connection
Use MongoDB Atlas (cloud) for production, not local MongoDB.

### 4. SSL/HTTPS
All recommended platforms provide SSL automatically.

### 5. Monitoring
Set up monitoring/alerting for production issues.

---

## 🚀 Quick Start (Recommended Path)

```bash
# 1. Deploy Backend to Railway
cd backend
npx @railway/cli login
npx @railway/cli init
npx @railway/cli up

# 2. Get Railway URL and update frontend env vars
# 3. Deploy Frontend to Vercel
cd ../frontend
npx vercel
npx vercel --prod

# 4. Update backend CORS with Vercel URL
# 5. Test your live application!
```

Your full-stack app will be:
- **Frontend:** `https://sara-pharmacy.vercel.app`
- **Backend:** `https://your-app.railway.app`
- **Database:** MongoDB Atlas

---

**Deployment Strategy by:** Shweat Yadav  
**Last Updated:** January 2025