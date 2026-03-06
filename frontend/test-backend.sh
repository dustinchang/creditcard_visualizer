#!/bin/bash

echo "🔍 Testing Backend Connection..."
echo ""

# Test 1: Check if backend is running
echo "1️⃣  Testing if backend is running on http://localhost:3000..."
if curl -s http://localhost:3000/ > /dev/null 2>&1; then
    echo "✅ Backend is running!"
    curl -s http://localhost:3000/ | head -c 100
    echo ""
else
    echo "❌ Backend is NOT running!"
    echo "   Run: cd backend && cargo run"
    exit 1
fi

echo ""
echo "2️⃣  Testing OpenAI endpoint..."
if curl -s http://localhost:3000/analyze-transactions-openai > /dev/null 2>&1; then
    echo "✅ OpenAI endpoint is accessible"
else
    echo "⚠️  OpenAI endpoint returned an error (this is normal without a file)"
fi

echo ""
echo "3️⃣  Checking ports..."
if lsof -ti:3000 > /dev/null 2>&1; then
    echo "✅ Port 3000 is in use (backend running)"
    echo "   Process ID: $(lsof -ti:3000)"
else
    echo "❌ Port 3000 is NOT in use"
    echo "   Backend is not running!"
fi

echo ""
echo "4️⃣  Testing with curl POST (will fail without valid CSV, but tests connection)..."
response=$(curl -s -w "\n%{http_code}" -X POST http://localhost:3000/analyze-transactions-openai \
    -F "file=@/dev/null" \
    -F "description=test" 2>&1)
http_code=$(echo "$response" | tail -n1)
echo "   HTTP Status: $http_code"

if [ "$http_code" -eq 500 ] || [ "$http_code" -eq 400 ]; then
    echo "✅ Backend is responding (error expected with invalid file)"
elif [ "$http_code" = "000" ]; then
    echo "❌ Cannot connect to backend"
else
    echo "ℹ️  Got response code: $http_code"
fi

echo ""
echo "5️⃣  Summary:"
echo "   Backend URL: http://localhost:3000"
echo "   OpenAI Endpoint: http://localhost:3000/analyze-transactions-openai"
echo ""
echo "If backend is not running, start it with:"
echo "   cd backend"
echo "   cargo run"
