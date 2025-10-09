#!/bin/bash

echo "🔒 Starting Wiedza to Potęga with HTTPS support..."
echo

# Check if SSL certificates exist
if [ ! -f "ssl/cert.pem" ] || [ ! -f "ssl/key.pem" ]; then
    echo "🔧 Generating SSL certificates..."
    mkdir -p ssl
    openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes -subj "/C=PL/ST=Poland/L=Warsaw/O=WiedzaToPotega/OU=Dev/CN=localhost"
    echo "✅ SSL certificates generated!"
    echo
fi

echo "🚀 Starting services..."
echo

# Start backend in background
echo "📡 Starting backend (HTTP + HTTPS)..."
cd backend && node server.js &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start frontend-tv in background  
echo "🖥️  Starting frontend-tv (HTTPS)..."
cd ../frontend-tv && npm run dev &
FRONTEND_PID=$!

echo
echo "✅ Services started!"
echo
echo "📺 Frontend TV: https://localhost:3000/ (or next available port)"
echo "📱 Mobile: Access via HTTPS URL from your phone"
echo "📡 Backend: https://localhost:8443/"
echo
echo "📱 For iPhone camera access, use these HTTPS URLs!"
echo "🔍 Check your local IP: $(ifconfig | grep 'inet ' | grep -v 127.0.0.1 | awk '{print $2}' | head -1)"
echo
echo "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo
    echo "🛑 Stopping services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Services stopped"
    exit 0
}

# Set trap to cleanup on Ctrl+C
trap cleanup SIGINT

# Wait for either process to exit
wait