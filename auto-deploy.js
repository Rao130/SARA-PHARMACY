#!/usr/bin/env node

// 🚀 Automated Render Deployment Helper for Sara Pharmacy
// This script automates as much as possible for Render deployment

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Sara Pharmacy Auto-Deploy to Render');
console.log('=====================================\n');

// Check if we're in the right directory (look for frontend and backend folders instead)
if (!fs.existsSync('frontend') || !fs.existsSync('backend')) {
    console.error('❌ Error: Frontend or Backend directory not found');
    console.error('Please run this script from the Sara Pharmacy project root directory');
    process.exit(1);
}

console.log('✅ Project structure verified');

// Initialize git if not already done
if (!fs.existsSync('.git')) {
    console.log('📝 Initializing Git repository...');
    try {
        execSync('git init', { stdio: 'inherit' });
        execSync('git add .', { stdio: 'inherit' });
        execSync('git commit -m "Initial commit for Render deployment"', { stdio: 'inherit' });
        console.log('✅ Git repository initialized');
    } catch (error) {
        console.error('❌ Error initializing Git:', error.message);
    }
}

// Add and commit any pending changes
console.log('📝 Committing latest changes...');
try {
    execSync('git add .', { stdio: 'inherit' });
    execSync(`git commit -m "Deploy to Render - ${new Date().toISOString()}"`, { stdio: 'inherit' });
    console.log('✅ Changes committed');
} catch (error) {
    console.log('ℹ️  No changes to commit');
}

// Check if GitHub remote is set
try {
    const remotes = execSync('git remote -v', { encoding: 'utf8' });
    if (!remotes.includes('origin')) {
        console.log('⚠️  No GitHub remote found. Please set up GitHub repository first:');
        console.log('   git remote add origin https://github.com/your-username/sara-pharmacy.git');
        console.log('   git push -u origin main');
    } else {
        console.log('📤 Pushing to GitHub...');
        try {
            execSync('git push origin main', { stdio: 'inherit' });
            console.log('✅ Code pushed to GitHub');
        } catch (pushError) {
            try {
                execSync('git push origin master', { stdio: 'inherit' });
                console.log('✅ Code pushed to GitHub (master branch)');
            } catch (masterError) {
                console.log('⚠️  Please push to GitHub manually');
            }
        }
    }
} catch (error) {
    console.log('⚠️  Please set up GitHub repository and push manually');
}

// Generate deployment URLs
const projectName = 'sara-pharmacy';
const backendUrl = `https://${projectName}-backend.onrender.com`;
const frontendUrl = `https://${projectName}-frontend.onrender.com`;

// Create render deployment configuration
const renderConfig = {
    services: [
        {
            type: 'web',
            name: `${projectName}-backend`,
            env: 'node',
            buildCommand: 'cd backend && npm install',
            startCommand: 'cd backend && npm start',
            envVars: [
                { key: 'NODE_ENV', value: 'production' },
                { key: 'PORT', value: '10000' },
                { key: 'MONGODB_URI', value: 'REPLACE_WITH_YOUR_MONGODB_URI' },
                { key: 'JWT_SECRET', value: 'REPLACE_WITH_YOUR_JWT_SECRET' }
            ]
        },
        {
            type: 'web',
            name: `${projectName}-frontend`,
            env: 'static',
            buildCommand: 'cd frontend && npm install && npm run build',
            staticPublishPath: 'frontend/dist',
            envVars: [
                { key: 'VITE_API_BASE_URL', value: `${backendUrl}/api/v1` },
                { key: 'VITE_API_URL', value: backendUrl },
                { key: 'VITE_SOCKET_URL', value: backendUrl },
                { key: 'NODE_ENV', value: 'production' }
            ]
        }
    ]
};

fs.writeFileSync('render.json', JSON.stringify(renderConfig, null, 2));
console.log('✅ Render configuration created');

console.log('\n🎯 RENDER DEPLOYMENT STEPS:');
console.log('===========================\n');

console.log('1. 🌐 Open https://render.com and sign in with GitHub\n');

console.log('2. 🔧 Deploy Backend:');
console.log(`   - Click "New +" → "Web Service"`);
console.log(`   - Connect repository: sara-pharmacy`);
console.log(`   - Name: ${projectName}-backend`);
console.log(`   - Root Directory: backend`);
console.log(`   - Build Command: npm install --only=production`);
console.log(`   - Start Command: npm start\n`);

console.log('3. 📋 Backend Environment Variables:');
console.log('   NODE_ENV=production');
console.log('   PORT=10000');
console.log('   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sara-pharmacy');
console.log('   JWT_SECRET=your-32-character-secret-key\n');

console.log('4. 🎨 Deploy Frontend:');
console.log(`   - Click "New +" → "Static Site"`);
console.log(`   - Connect same repository`);
console.log(`   - Name: ${projectName}-frontend`);
console.log(`   - Root Directory: frontend`);
console.log(`   - Build Command: npm run build`);
console.log(`   - Publish Directory: dist\n`);

console.log('5. 📋 Frontend Environment Variables:');
console.log(`   VITE_API_BASE_URL=${backendUrl}/api/v1`);
console.log(`   VITE_API_URL=${backendUrl}`);
console.log(`   VITE_SOCKET_URL=${backendUrl}`);
console.log('   NODE_ENV=production\n');

console.log('🎉 YOUR LIVE URLS:');
console.log(`   Frontend: ${frontendUrl}`);
console.log(`   Backend: ${backendUrl}\n`);

console.log('✅ Auto-deployment preparation completed!');
console.log('📝 All configuration files have been created');
console.log('🚀 Follow the steps above to complete deployment on Render\n');

// Create a simple instruction file
const instructions = `
# Sara Pharmacy - Render Deployment Instructions

## Your Live URLs (after deployment):
- Frontend: ${frontendUrl}
- Backend: ${backendUrl}

## Quick Steps:
1. Go to https://render.com
2. Sign in with GitHub
3. Deploy backend as Web Service (backend folder)
4. Deploy frontend as Static Site (frontend folder)
5. Configure environment variables as shown in the terminal

## Files Created:
- render.json (deployment configuration)
- deploy-to-render.bat (Windows script)
- deploy-to-render.sh (Linux/Mac script)

Developed by: Shweat Yadav
`;

fs.writeFileSync('DEPLOYMENT_INSTRUCTIONS.md', instructions);
console.log('📄 DEPLOYMENT_INSTRUCTIONS.md created for reference');