@echo off
REM 🚀 Automated Render Deployment Script for Sara Pharmacy (Windows)
REM Run this script to deploy your application to Render

echo 🚀 Starting Sara Pharmacy deployment to Render...
echo ==================================================

REM Check if git is initialized
if not exist ".git" (
    echo ❌ Git repository not found. Initializing...
    git init
    git add .
    git commit -m "Initial commit for Render deployment"
)

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ This doesn't appear to be the Sara Pharmacy root directory
    echo Please run this script from the project root directory
    pause
    exit /b 1
)

echo ✅ Project structure verified

REM Commit any pending changes
echo 📝 Committing latest changes...
git add .
git commit -m "Deploy to Render - %date% %time%" 2>nul || echo No changes to commit

REM Push to GitHub (assuming origin is set)
echo 📤 Pushing to GitHub...
git push origin main 2>nul || git push origin master 2>nul || echo ⚠️  Please set up GitHub remote and push manually

echo.
echo 🎯 Next Steps - Complete these in Render Dashboard:
echo ==================================================
echo.
echo 1. 🌐 Go to https://render.com and sign in
echo.
echo 2. 🔧 Deploy Backend (Web Service):
echo    - Click 'New +' -^> 'Web Service'
echo    - Connect GitHub repository: sara-pharmacy
echo    - Name: sara-pharmacy-backend
echo    - Root Directory: backend
echo    - Build Command: npm install
echo    - Start Command: npm start
echo.
echo 3. 📋 Backend Environment Variables:
echo    NODE_ENV=production
echo    PORT=10000
echo    MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sara-pharmacy
echo    JWT_SECRET=your-32-character-secret-key
echo.
echo 4. 🎨 Deploy Frontend (Static Site):
echo    - Click 'New +' -^> 'Static Site'
echo    - Connect same GitHub repository
echo    - Name: sara-pharmacy-frontend
echo    - Root Directory: frontend
echo    - Build Command: npm run build
echo    - Publish Directory: dist
echo.
echo 5. 📋 Frontend Environment Variables:
echo    VITE_API_BASE_URL=https://sara-pharmacy-backend.onrender.com/api/v1
echo    VITE_API_URL=https://sara-pharmacy-backend.onrender.com
echo    VITE_SOCKET_URL=https://sara-pharmacy-backend.onrender.com
echo    NODE_ENV=production
echo.
echo 🎉 Your Sara Pharmacy will be live at:
echo    Frontend: https://sara-pharmacy-frontend.onrender.com
echo    Backend: https://sara-pharmacy-backend.onrender.com
echo.
echo ✅ Deployment script completed!
echo ==================================================
pause