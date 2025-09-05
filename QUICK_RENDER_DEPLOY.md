# ⚡ Quick Render Deploy - Sara Pharmacy

## 🎯 Fast Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Deploy to Render"
git push origin main
```

### 2. Deploy Backend (Web Service)
1. Go to [render.com](https://render.com) → **New +** → **Web Service**
2. Connect GitHub repository
3. Configure:
   - **Name:** `sara-pharmacy-backend`
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

### 3. Backend Environment Variables
```bash
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sara-pharmacy
JWT_SECRET=your-32-character-secret-key
```

### 4. Deploy Frontend (Static Site)  
1. Go to Render → **New +** → **Static Site**
2. Connect same GitHub repository
3. Configure:
   - **Name:** `sara-pharmacy-frontend`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`

### 5. Frontend Environment Variables
```bash
VITE_API_BASE_URL=https://sara-pharmacy-backend.onrender.com/api/v1
VITE_API_URL=https://sara-pharmacy-backend.onrender.com
VITE_SOCKET_URL=https://sara-pharmacy-backend.onrender.com
NODE_ENV=production
```

## ✅ Quick Checklist

- [ ] MongoDB Atlas database ready
- [ ] GitHub repository pushed
- [ ] Backend deployed as Web Service
- [ ] Frontend deployed as Static Site
- [ ] Environment variables configured
- [ ] Both services running

## 🌐 Your Live URLs
- **Frontend:** `https://sara-pharmacy-frontend.onrender.com`
- **Backend:** `https://sara-pharmacy-backend.onrender.com`

## 💡 Pro Tips
- Free tier services sleep after 15 minutes
- First request might be slow (cold start)
- Check logs in Render dashboard for issues

## 📞 Need Help?
Check `RENDER_DEPLOYMENT.md` for detailed instructions!

---
**Quick Deploy by:** Shweat Yadav