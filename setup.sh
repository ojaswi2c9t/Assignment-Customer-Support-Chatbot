#!/bin/bash

# AI Customer Support Bot Setup Script

echo "🚀 Setting up AI Customer Support Bot..."

# Check if Node.js is installed
if ! command -v node &> /dev/null
then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js is installed"

# Check if npm is installed
if ! command -v npm &> /dev/null
then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm is installed"

# Setup backend
echo "🔧 Setting up backend..."
cd backend
npm install
cd ..

# Setup demo
echo "🔧 Setting up demo..."
npm install

echo "✅ Setup completed!"

echo ""
echo "📋 Next steps:"
echo "1. Create a .env file in the backend directory with your configuration:"
echo "   PORT=3000"
echo "   OPENAI_API_KEY=your_openai_api_key_here"
echo "   MONGODB_URI=your_mongodb_connection_string_here"
echo ""
echo "2. Start the backend server:"
echo "   cd backend && npm run dev"
echo ""
echo "3. Serve the frontend files (in a new terminal):"
echo "   npx serve ../frontend"
echo ""
echo "4. Run the demo:"
echo "   npm run demo"