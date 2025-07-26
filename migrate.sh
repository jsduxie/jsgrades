#!/bin/bash

# Migration helper script for JSGrades monorepo to Next.js

echo "🚀 JSGrades Migration Helper"
echo "=============================="
echo ""

# Check if we're in the right directory
if [ ! -d "jsgrades" ]; then
    echo "❌ Error: Please run this script from the root of the jsgrades repository"
    exit 1
fi

echo "✅ Found jsgrades directory"

# Navigate to the Next.js app directory
cd jsgrades

echo "📦 Installing dependencies..."
npm install

echo "🔧 Setting up environment variables..."
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local not found. Please create it with your database and Firebase configuration."
    echo "📝 Template:"
    echo "DATABASE_URL=your_database_url_here"
    echo "FIREBASE_SDK_KEY=your_firebase_admin_sdk_key_json_here"
    echo "NEXT_PUBLIC_FIREBASE_apiKey=your_firebase_api_key"
    echo "# ... other Firebase config variables"
else
    echo "✅ .env.local found"
fi

echo ""
echo "🎉 Migration setup complete!"
echo ""
echo "📚 What's been migrated:"
echo "  ✅ Database connection (PostgreSQL)"
echo "  ✅ Firebase Authentication (client & admin)"
echo "  ✅ User management API routes"
echo "  ✅ Authentication context"
echo "  ✅ Login/Register pages"
echo "  ✅ Onboarding flow"
echo "  ✅ Home page with authentication"
echo ""
echo "🔥 To start the development server:"
echo "  cd jsgrades && npm run dev"
echo ""
echo "🌐 Your app will be available at:"
echo "  http://localhost:3000"
echo ""
echo "⚙️  Next steps:"
echo "  1. Configure your .env.local file with actual values"
echo "  2. Set up your PostgreSQL database"
echo "  3. Configure Firebase project"
echo "  4. Test the authentication flow"
echo ""
