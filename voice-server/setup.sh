#!/bin/bash

echo "🎙️  SentimentAI Voice Server Setup"
echo "=================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo "📝 Creating .env from .env.example..."
    cp .env.example .env
    echo ""
    echo "✅ Created .env file"
    echo "⚠️  Please edit .env and add your API keys:"
    echo "   - OPENAI_API_KEY"
    echo "   - SUPABASE_URL"
    echo "   - SUPABASE_SERVICE_KEY"
    echo ""
    exit 1
fi

echo "✅ .env file found"
echo ""

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

echo "✅ Dependencies installed"
echo ""

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build
echo ""

echo "✅ Build complete"
echo ""

echo "🚀 Starting voice server..."
echo "   HTTP: http://localhost:3001"
echo "   WebSocket: ws://localhost:3001/ws/voice-chat"
echo ""
echo "💡 Don't forget to ingest the knowledge base:"
echo "   curl -X POST http://localhost:3001/api/ingest-knowledge"
echo ""

npm run dev
