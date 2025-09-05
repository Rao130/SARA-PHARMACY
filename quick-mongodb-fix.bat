@echo off
echo 🔧 Quick MongoDB Atlas Fix for Sara Pharmacy
echo =============================================
echo.
echo ❌ Current Issue: Using placeholder MongoDB credentials
echo ✅ Solution: Set up real MongoDB Atlas database
echo.
echo 🎯 YOUR GENERATED CREDENTIALS:
echo ==============================
echo Username: sarapharmacy
echo Password: BxYTae5hW34OKR0Z
echo Database: sara-pharmacy
echo.
echo 🚀 QUICK STEPS TO FIX:
echo ======================
echo.
echo 1. 🌐 Open: https://cloud.mongodb.com
echo 2. 📝 Sign up/Login with Google
echo 3. 🔨 Create cluster: "sara-pharmacy"
echo 4. 👤 Create user: sarapharmacy / BxYTae5hW34OKR0Z
echo 5. 🌍 Network Access: Allow 0.0.0.0/0
echo 6. 📋 Copy connection string
echo 7. 🔧 Update Render environment variables
echo.
echo 📋 ENVIRONMENT VARIABLES FOR RENDER:
echo ===================================
echo NODE_ENV=production
echo PORT=10000
echo JWT_SECRET=BxYTae5hW34OKR0Z9UUlusMcbpv2gx2bDdJdQWTtIdJfHSWLUCYuNpspq7ub9tIH
echo MONGODB_URI=mongodb+srv://sarapharmacy:BxYTae5hW34OKR0Z@YOUR_CLUSTER.mongodb.net/sara-pharmacy?retryWrites=true^&w=majority
echo.
echo 💡 TIP: Replace YOUR_CLUSTER with your actual cluster hostname
echo.
echo ⚡ Quick Links:
echo 📊 MongoDB Atlas: https://cloud.mongodb.com
echo 🚀 Render Dashboard: https://dashboard.render.com
echo.
echo 🎉 After setup, redeploy in Render and your app will work!
echo.
pause