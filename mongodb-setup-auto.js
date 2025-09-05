#!/usr/bin/env node

// 🔧 Automated MongoDB Atlas Setup for Sara Pharmacy
// This script helps set up MongoDB Atlas automatically

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔧 MongoDB Atlas Auto-Setup for Sara Pharmacy');
console.log('============================================\n');

// Generate a secure JWT secret
function generateJWTSecret() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 64; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

const jwtSecret = generateJWTSecret();

console.log('🔑 Generated JWT Secret:');
console.log(jwtSecret);
console.log('');

// Create proper environment variables template
const envTemplate = `# Sara Pharmacy - Production Environment Variables
# Copy these to your Render environment variables

NODE_ENV=production
PORT=10000

# MongoDB Atlas Configuration
# Replace with your actual MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://sarapharmacy:${jwtSecret.substring(0, 16)}@sara-pharmacy.xxxxx.mongodb.net/sara-pharmacy?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=${jwtSecret}
JWT_EXPIRE=30d

# CORS Configuration
FRONTEND_URL=https://sara-pharmacy-frontend.onrender.com
PRODUCTION_ORIGINS=https://sara-pharmacy-frontend.onrender.com

# Optional: Firebase Configuration (for push notifications)
# FIREBASE_PROJECT_ID=your-firebase-project-id
# FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
# FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nYOUR_KEY\\n-----END PRIVATE KEY-----\\n"
`;

fs.writeFileSync('.env.production', envTemplate);
console.log('✅ Environment template created: .env.production');

// Create MongoDB Atlas setup instructions
const mongoInstructions = `
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
4. Password: ${jwtSecret.substring(0, 16)}
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
mongodb+srv://sarapharmacy:${jwtSecret.substring(0, 16)}@sara-pharmacy.xxxxx.mongodb.net/sara-pharmacy?retryWrites=true&w=majority

(Replace xxxxx with your actual cluster hostname)

## Your Credentials:
- Username: sarapharmacy
- Password: ${jwtSecret.substring(0, 16)}
- Database: sara-pharmacy
- JWT Secret: ${jwtSecret}
`;

fs.writeFileSync('MONGODB_ATLAS_SETUP.md', mongoInstructions);
console.log('✅ MongoDB setup guide created: MONGODB_ATLAS_SETUP.md');

console.log('\n🎯 IMMEDIATE ACTIONS NEEDED:');
console.log('============================');
console.log('1. 🌐 Go to https://cloud.mongodb.com');
console.log('2. 🔨 Create cluster named "sara-pharmacy"');
console.log('3. 👤 Create user: sarapharmacy');
console.log(`4. 🔑 Use password: ${jwtSecret.substring(0, 16)}`);
console.log('5. 🌍 Allow access from anywhere (0.0.0.0/0)');
console.log('6. 📋 Update Render environment variables with real connection string');

console.log('\n🔧 Environment Variables for Render:');
console.log('===================================');
console.log('NODE_ENV=production');
console.log('PORT=10000');
console.log(`JWT_SECRET=${jwtSecret}`);
console.log(`MONGODB_URI=mongodb+srv://sarapharmacy:${jwtSecret.substring(0, 16)}@YOUR_CLUSTER.mongodb.net/sara-pharmacy?retryWrites=true&w=majority`);

console.log('\n⚡ Quick Links:');
console.log('==============');
console.log('📊 MongoDB Atlas: https://cloud.mongodb.com');
console.log('🚀 Render Dashboard: https://dashboard.render.com');

console.log('\n✅ Setup completed! Follow the steps above to get your database running.');