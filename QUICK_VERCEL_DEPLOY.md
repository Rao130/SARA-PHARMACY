# ⚡ Quick Vercel Deploy - Sara Pharmacy

## 🎯 One-Command Deployment

### 1. Deploy Frontend to Vercel
```bash
cd frontend
npx vercel
npx vercel --prod
```

### 2. Deploy Backend to Railway
```bash
cd backend
npx @railway/cli login
npx @railway/cli init
npx @railway/cli up
```

## 🔧 Essential Setup

### Frontend Environment Variables (Vercel Dashboard):
```bash
VITE_API_BASE_URL=https://your-backend.railway.app/api/v1
VITE_API_URL=https://your-backend.railway.app
VITE_SOCKET_URL=https://your-backend.railway.app
```

### Backend Environment Variables (Railway Dashboard):
```bash
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sara-pharmacy
JWT_SECRET=your-32-character-secret-key
PORT=5001
```

## ✅ Quick Checklist

- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Railway
- [ ] MongoDB Atlas database ready
- [ ] Environment variables set
- [ ] CORS updated with Vercel domain
- [ ] Test live application

## 🌐 Your Live URLs
- **Frontend:** `https://sara-pharmacy.vercel.app`
- **Backend:** `https://your-app.railway.app`

## 📞 Need Help?
Check `VERCEL_DEPLOYMENT.md` for detailed instructions!

---
**Quick Deploy by:** Shweat Yadav