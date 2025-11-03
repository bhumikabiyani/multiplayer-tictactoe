#!/bin/bash

# LILA Deployment Script
# This script helps deploy the frontend to Vercel

echo "🎮 LILA Deployment Script"
echo "========================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the LILA root directory"
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Build the frontend
echo "🔨 Building frontend..."
cd frontend
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix errors and try again."
    exit 1
fi

echo "✅ Build successful!"

# Go back to root
cd ..

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
echo ""
echo "📝 You'll need to configure these environment variables in Vercel:"
echo "   REACT_APP_NAKAMA_HOST=your-backend-server.com"
echo "   REACT_APP_NAKAMA_PORT=7350"
echo "   REACT_APP_NAKAMA_KEY=defaultkey"
echo "   REACT_APP_NAKAMA_USE_SSL=true"
echo ""

# Check if user wants to continue
read -p "🤔 Ready to deploy? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    vercel --prod
    echo ""
    echo "🎉 Deployment complete!"
    echo "📱 Your game is now live on Vercel!"
    echo ""
    echo "⚠️  Don't forget to:"
    echo "   1. Set up your backend server (see DEPLOYMENT.md)"
    echo "   2. Configure environment variables in Vercel dashboard"
    echo "   3. Test the live deployment"
else
    echo "🛑 Deployment cancelled."
fi

echo ""
echo "📚 For detailed deployment instructions, see DEPLOYMENT.md"