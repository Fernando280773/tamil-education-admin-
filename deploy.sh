#!/bin/bash

# 🚀 Quick Deploy Script for Tamil Education App

echo "🎯 Tamil Education App - Quick Deployment"
echo "========================================"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

echo ""
echo "🔧 Pre-deployment checklist:"
echo "✅ Git repository: $(git remote get-url origin)"
echo "✅ Node.js version: $(node --version)"
echo "✅ Dependencies: $(npm list --depth=0 2>/dev/null | grep -c '├──\|└──') packages installed"

echo ""
echo "🚀 Starting Vercel deployment..."
echo "📝 Please configure these environment variables in Vercel dashboard:"
echo ""
echo "NODE_ENV=production"
echo "PORT=3000"
echo "MONGODB_URI=your_mongodb_atlas_connection_string"
echo "JWT_SECRET=your_secure_secret_key_here"
echo "JWT_EXPIRE=7d"
echo "EMAIL_ENABLED=false"
echo "ADMIN_EMAIL=admin@tamilcommittee.org"
echo "ADMIN_PASSWORD=change_this_password"
echo ""

# Deploy to Vercel
vercel --prod

echo ""
echo "🎊 Deployment complete!"
echo "📱 Your Tamil Education app should now be live!"
echo ""
echo "🔧 Next steps:"
echo "1. Visit your deployed URL"
echo "2. Go to /setup-admin to initialize admin user"
echo "3. Test the membership form"
echo "4. Access admin panel at /admin"
echo ""
echo "🌟 Enjoy your hosted Tamil Education app!"
