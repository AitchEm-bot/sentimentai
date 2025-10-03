# 🚀 Quick Start Guide - Voice Chat with OpenAI Realtime API

## 3-Step Setup

### 1. Get OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy it for next step

### 2. Configure Backend

```bash
# Navigate to voice-server
cd voice-server

# Copy environment template
cp .env.example .env

# Edit .env and add your API key
nano .env  # or use your preferred editor
```

Your `.env` should look like:
```env
OPENAI_API_KEY=sk-proj-xxxxx
PORT=3001
ALLOWED_ORIGINS=http://localhost:3000
```

### 3. Install & Run

```bash
# Install backend dependencies
npm install

# Start the server
npm run dev
```

You should see:
```
🚀 ======================================
🎙️  SentimentAI Voice Server (Simplified)
🌐 HTTP Server: http://localhost:3001
🔌 WebSocket: ws://localhost:3001/ws/voice-chat
🚀 ======================================

✨ Using OpenAI Realtime API
💡 No database required - knowledge embedded in system prompt
```

### 4. Test the Frontend

**In a new terminal, in the root directory:**

```bash
# Make sure frontend .env.local exists
cat .env.local
# Should show: NEXT_PUBLIC_WS_URL=ws://localhost:3001/ws/voice-chat

# Start Next.js (if not already running)
npm run dev
```

### 5. Try It Out!

1. Open http://localhost:3000
2. Click the microphone button (allow mic permissions)
3. Ask: **"How many vacation days do I get?"**
4. Listen for the AI response!

---

## Sample Questions

✅ "How many vacation days do I get?"
✅ "What's the expense limit for meals?"
✅ "How do I contact IT support?"
✅ "What's the remote work policy?"
✅ "When is payroll processed?"

---

## Troubleshooting

### Backend won't start
- Check port 3001 isn't in use: `lsof -i :3001`
- Verify `OPENAI_API_KEY` is set in `.env`

### Frontend can't connect
- Ensure backend is running on port 3001
- Check `.env.local` has correct WebSocket URL
- Look at browser console for errors

### No microphone access
- Click browser permission icon and allow microphone
- Use Chrome or Edge (best compatibility)

---

## What's Different Now?

✅ **No Database** - Supabase removed, knowledge in system prompt
✅ **No RAG Pipeline** - Company policies hardcoded
✅ **OpenAI Realtime API** - True bidirectional streaming
✅ **3-Minute Setup** - Just add API key and run
✅ **Same Functionality** - Answers all questions perfectly

---

## Next Steps

- Read `README-VOICE.md` for architecture details
- Customize system prompt in `/voice-server/src/services/openai-realtime.service.ts`
- Deploy to production (see README-VOICE.md)

🎉 **You're all set!**
