# Render Build Script for Backend
#!/usr/bin/env bash
# exit on error
set -o errexit

echo "Installing production dependencies..."
npm ci --only=production

echo "Backend build completed successfully"