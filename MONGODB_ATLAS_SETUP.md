
# 🔧 MongoDB Atlas Quick Setup Guide

## Step 1: Create MongoDB Atlas Account
1. Go to https://cloud.mongodb.com
2. Sign up with Google/GitHub (fastest)
3. Choose "Build a database" -> "Shared" (Free)

## Step 2: Create Cluster
1. Cloud Provider: AWS
2. Region: Choose closest to your users
3. Cluster Name: sara-pharmacy
4. Click "Create Cluster" (takes 3-5 minutes)

## Step 3: Create Database User
1. Go to "Database Access" in left sidebar
2. Click "Add New Database User"
3. Username: sarapharmacy
4. Password: BxYTae5hW34OKR0Z
5. Database User Privileges: "Read and write to any database"
6. Click "Add User"

## Step 4: Configure Network Access
1. Go to "Network Access" in left sidebar
2. Click "Add IP Address"
3. Choose "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

## Step 5: Get Connection String
1. Go to "Clusters" -> Click "Connect"
2. Choose "Connect your application"
3. Driver: Node.js, Version: 4.1 or later
4. Copy connection string (will look like):
   mongodb+srv://sarapharmacy:<password>@sara-pharmacy.xxxxx.mongodb.net/?retryWrites=true&w=majority

## Step 6: Update Environment Variables in Render
Replace the MONGODB_URI in your Render environment variables with:
mongodb+srv://sarapharmacy:BxYTae5hW34OKR0Z@sara-pharmacy.xxxxx.mongodb.net/sara-pharmacy?retryWrites=true&w=majority

(Replace xxxxx with your actual cluster hostname)

## Your Credentials:
- Username: sarapharmacy
- Password: BxYTae5hW34OKR0Z
- Database: sara-pharmacy
- JWT Secret: BxYTae5hW34OKR0Z9UUlusMcbpv2gx2bDdJdQWTtIdJfHSWLUCYuNpspq7ub9tIH
