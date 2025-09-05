# Render Build Script for Backend
#!/usr/bin/env bash
# exit on error
set -o errexit

echo "Installing production dependencies..."
npm install --only=production

echo "Backend build completed successfully"