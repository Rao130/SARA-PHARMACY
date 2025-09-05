# 📊 MongoDB Atlas Setup Guide for Sara Pharmacy

## Overview
MongoDB Atlas is a cloud-hosted MongoDB service that's perfect for Railway deployments. This guide will help you set up a production-ready database for your Sara Pharmacy application.

## Step 1: Create MongoDB Atlas Account

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Click "Try Free" or "Sign In"
3. Create account with email or sign in with Google/GitHub

## Step 2: Create a New Cluster

1. **Choose Deployment Type:**
   - Select "Shared" for free tier (perfect for getting started)
   - Or "Dedicated" for production workloads

2. **Configure Cluster:**
   - **Cloud Provider:** AWS (recommended for Railway compatibility)
   - **Region:** Choose closest to your users
   - **Cluster Tier:** M0 Sandbox (Free) or M2/M5 for paid plans
   - **Cluster Name:** `sara-pharmacy-cluster`

3. **Click "Create Cluster"** (this takes 3-5 minutes)

## Step 3: Configure Database Security

### Create Database User

1. Go to **Database Access** in left sidebar
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Set username: `sarapharmacy`
5. Generate secure password (save this!)
6. Database User Privileges: **"Read and write to any database"**
7. Click **"Add User"**

### Configure Network Access

1. Go to **Network Access** in left sidebar
2. Click **"Add IP Address"**
3. Choose **"Allow Access from Anywhere"** (0.0.0.0/0)
   - This is required for Railway deployment
   - MongoDB Atlas has built-in security, so this is safe
4. Click **"Confirm"**

## Step 4: Get Connection String

1. Go to **Clusters** in left sidebar
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Driver: **Node.js**, Version: **4.1 or later**
5. Copy the connection string:

```
mongodb+srv://sarapharmacy:<password>@sara-pharmacy-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

## Step 5: Configure Connection String

Replace placeholders in the connection string:

```javascript
// Original
mongodb+srv://sarapharmacy:<password>@sara-pharmacy-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority

// Replace with actual values
mongodb+srv://sarapharmacy:YourActualPassword@sara-pharmacy-cluster.xxxxx.mongodb.net/sara-pharmacy?retryWrites=true&w=majority
```

**Important Changes:**
1. Replace `<password>` with your actual database user password
2. Add database name `/sara-pharmacy` before the query parameters

## Step 6: Test Connection Locally

1. Create `.env` file in backend folder:
```bash
cd backend
cp .env.example .env
```

2. Edit `.env` file:
```env
MONGODB_URI=mongodb+srv://sarapharmacy:YourPassword@sara-pharmacy-cluster.xxxxx.mongodb.net/sara-pharmacy?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
NODE_ENV=development
PORT=5001
```

3. Test connection:
```bash
npm run dev
```

You should see: "MongoDB Connected Successfully"

## Step 7: Set Environment Variables in Railway

### Using Railway CLI:
```bash
railway variables set MONGODB_URI="mongodb+srv://sarapharmacy:YourPassword@sara-pharmacy-cluster.xxxxx.mongodb.net/sara-pharmacy?retryWrites=true&w=majority"
```

### Using Railway Dashboard:
1. Go to your Railway project
2. Click on your service
3. Go to "Variables" tab
4. Add new variable:
   - **Name:** `MONGODB_URI`
   - **Value:** Your connection string

## Step 8: Initialize Database with Sample Data

After deployment, you can seed your database:

```bash
# Connect to your Railway service
railway run npm run create-admin
railway run npm run seed-medicines
```

Or use the combined command:
```bash
railway run npm run db:setup
```

## Database Collections Structure

Your Sara Pharmacy app will create these collections:

```
sara-pharmacy/
├── users                 # Customer and admin accounts
├── medicines            # Medicine inventory
├── orders              # Customer orders
├── announcements       # Admin announcements
├── deliverypartners    # Delivery personnel
├── prescriptionschedules # Prescription reminders
└── devices             # Push notification tokens
```

## MongoDB Atlas Features to Explore

### 1. Data Explorer
- Browse your collections and documents
- Run queries directly in the browser
- Export/import data

### 2. Performance Advisor
- Get indexing recommendations
- Monitor slow queries
- Optimize database performance

### 3. Real-time Performance Panel
- Monitor database operations
- Track connection metrics
- View server statistics

### 4. Automated Backups
- Continuous backups (Paid plans)
- Point-in-time recovery
- Download backup snapshots

## Production Best Practices

### 1. Security
```javascript
// Use environment variables for sensitive data
const uri = process.env.MONGODB_URI;

// Enable connection monitoring
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};
```

### 2. Connection Optimization
```javascript
// In your db.js file
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};
```

### 3. Monitoring
- Set up MongoDB Atlas alerts
- Monitor connection pool usage
- Track slow query performance

## Troubleshooting

### Common Issues:

1. **Authentication Failed**
   - Check username/password in connection string
   - Verify database user exists and has correct permissions

2. **Network Timeout**
   - Ensure IP address 0.0.0.0/0 is whitelisted
   - Check if cluster is in the same region as Railway

3. **Database Not Found**
   - Add database name to connection string: `/sara-pharmacy`
   - MongoDB will create the database automatically when you insert first document

4. **Connection Pool Exhausted**
   - Increase maxPoolSize in connection options
   - Check for connection leaks in your code

### Useful MongoDB Commands:

```javascript
// Check database status
db.runCommand({ ping: 1 })

// List all collections
show collections

// Count documents in a collection
db.users.countDocuments()

// Find sample documents
db.medicines.find().limit(5)

// Create an index for better performance
db.medicines.createIndex({ name: "text", category: 1 })
```

## Cost Optimization

### Free Tier Limits (M0):
- 512 MB storage
- Shared RAM
- No backup/restore
- Community support

### Upgrade Recommendations:
- **M2 ($9/month):** For production with backup
- **M5 ($25/month):** For high-traffic applications
- **M10+ ($57+/month):** For enterprise workloads

## Next Steps

1. **Set up monitoring alerts in Atlas**
2. **Configure automatic backups** (paid plans)
3. **Optimize indexes** for your queries
4. **Set up MongoDB Compass** for local database management
5. **Consider read replicas** for geographic distribution

---

**Database:** sara-pharmacy  
**Provider:** MongoDB Atlas  
**Setup by:** Shweat Yadav  
**Last Updated:** January 2025