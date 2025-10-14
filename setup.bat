@echo off
title AI Customer Support Bot Setup

echo 🚀 Setting up AI Customer Support Bot...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

echo ✅ Node.js is installed

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ npm is installed

REM Setup backend
echo 🔧 Setting up backend...
cd backend
npm install
cd ..

REM Setup demo
echo 🔧 Setting up demo...
npm install

echo ✅ Setup completed!

echo.
echo 📋 Next steps:
echo 1. Create a .env file in the backend directory with your configuration:
echo    PORT=3000
echo    OPENAI_API_KEY=your_openai_api_key_here
echo    MONGODB_URI=your_mongodb_connection_string_here
echo.
echo 2. Start the backend server:
echo    cd backend && npm run dev
echo.
echo 3. Serve the frontend files (in a new terminal):
echo    npx serve ../frontend
echo.
echo 4. Run the demo:
echo    npm run demo

pause