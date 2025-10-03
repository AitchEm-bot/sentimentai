# 🎙️ SentimentAI Voice Chat - RAG Implementation

## Overview

This is a complete RAG (Retrieval-Augmented Generation) voice communication system integrated into the SentimentAI website. It allows users to have natural voice conversations with an AI assistant that answers questions based on company policies stored in a Supabase vector database.

## Architecture

```
┌─────────────────┐      WebSocket       ┌──────────────────┐
│                 │◄────────────────────►│                  │
│  Next.js        │                      │  Voice Server    │
│  Frontend       │   Audio Streaming    │  (Node.js)       │
│                 │◄────────────────────►│                  │
└─────────────────┘                      └──────────────────┘
                                                  │
                                                  │ REST API
                                                  ▼
                                         ┌──────────────────┐
                                         │                  │
                                         │  OpenAI API      │
                                         │  - Whisper STT   │
                                         │  - GPT-4         │
                                         │  - TTS           │
                                         │  - Embeddings    │
                                         │                  │
                                         └──────────────────┘
                                                  │
                                                  │ Vector Search
                                                  ▼
                                         ┌──────────────────┐
                                         │                  │
                                         │  Supabase        │
                                         │  (PostgreSQL +   │
                                         │   pgvector)      │
                                         │                  │
                                         └──────────────────┘
```

## Pipeline Flow

1. **User speaks** → Microphone captures audio
2. **Audio streaming** → Sent to voice server via WebSocket
3. **Speech-to-Text** → OpenAI Whisper transcribes audio
4. **RAG Retrieval** → Query embedding generated and similar chunks retrieved from Supabase
5. **Prompt Augmentation** → User query + retrieved context
6. **LLM Generation** → GPT-4 generates response based on context
7. **Text-to-Speech** → OpenAI TTS converts response to audio
8. **Audio playback** → Streamed back to client and played

---

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ installed
- Supabase account (free tier works)
- OpenAI API key with access to GPT-4, Whisper, and TTS

### 2. Supabase Setup

1. Create a new Supabase project at https://supabase.com

2. In the SQL Editor, run the schema from `voice-server/SUPABASE-SETUP.sql`:

```sql
-- Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the knowledge_chunks table
CREATE TABLE IF NOT EXISTS knowledge_chunks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  embedding vector(1536) NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster searches
CREATE INDEX knowledge_chunks_embedding_idx
ON knowledge_chunks
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create similarity search function
CREATE OR REPLACE FUNCTION match_knowledge_chunks(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  embedding vector(1536),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    knowledge_chunks.id,
    knowledge_chunks.content,
    knowledge_chunks.embedding,
    knowledge_chunks.metadata,
    knowledge_chunks.created_at,
    1 - (knowledge_chunks.embedding <=> query_embedding) AS similarity
  FROM knowledge_chunks
  WHERE 1 - (knowledge_chunks.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
$$;
```

3. Get your Supabase credentials:
   - `SUPABASE_URL`: Project Settings → API → Project URL
   - `SUPABASE_SERVICE_KEY`: Project Settings → API → service_role key (secret!)

### 3. Backend Setup

1. Navigate to the voice-server directory:
```bash
cd voice-server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Fill in your environment variables in `.env`:
```env
OPENAI_API_KEY=sk-proj-your-api-key-here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key-here
PORT=3001
ALLOWED_ORIGINS=http://localhost:3000
```

5. Ingest the knowledge base:
```bash
# Start the server
npm run dev

# In another terminal, ingest the knowledge base
curl -X POST http://localhost:3001/api/ingest-knowledge
```

You should see output like:
```
✅ Successfully ingested 15 knowledge chunks
```

### 4. Frontend Setup

1. Create `.env.local` in the root directory:
```bash
cp .env.local.example .env.local
```

2. Update `.env.local`:
```env
NEXT_PUBLIC_WS_URL=ws://localhost:3001/ws/voice-chat
```

3. The frontend dependencies are already installed. Start the Next.js dev server if not running:
```bash
npm run dev
```

---

## Running the System

### Development Mode

1. **Start the voice server** (in `/voice-server`):
```bash
cd voice-server
npm run dev
```

Expected output:
```
🚀 ======================================
🎙️  SentimentAI Voice Server
🌐 HTTP Server: http://localhost:3001
🔌 WebSocket: ws://localhost:3001/ws/voice-chat
🚀 ======================================
```

2. **Start the Next.js frontend** (in root):
```bash
npm run dev
```

3. **Open your browser**:
   - Navigate to `http://localhost:3000`
   - Click on the microphone button
   - Allow microphone permissions
   - Start talking!

### Production Deployment

#### Backend (Voice Server)

Deploy to any Node.js hosting service:
- **Railway**: Connect GitHub repo, deploy `/voice-server` folder
- **Render**: Create new Web Service, select `/voice-server`
- **DigitalOcean App Platform**: Deploy from GitHub

Update environment variables:
- Set `ALLOWED_ORIGINS` to include your Vercel domain
- Use `wss://` protocol for production WebSocket URL

#### Frontend (Next.js)

Already deployed on Vercel. Update `.env` in Vercel settings:
```
NEXT_PUBLIC_WS_URL=wss://your-voice-server.com/ws/voice-chat
```

---

## Testing

### Sample Questions

Try asking these questions that are answered by the knowledge base:

1. **"How many vacation days do I get?"**
   - Expected: 15 days of paid vacation per year

2. **"What's the expense limit for meals?"**
   - Expected: $50 per day for business travel

3. **"How do I contact IT support?"**
   - Expected: support@sentimentai.com, extension 4911 for emergencies

4. **"What's the remote work policy?"**
   - Expected: Up to 2 days per week with manager approval

### Conversation Flow States

- **Idle** (Blue/Orange gradient): Ready to listen
- **Listening** (Red, pulsing): Recording your voice
- **Processing** (Yellow, spinner): Transcribing and generating response
- **Speaking** (Green, pulsing): Playing AI response

### Interruption

You can interrupt the AI while it's speaking or processing by clicking the microphone button again.

---

## File Structure

```
/sentimentai
├── /voice-server              # Backend Node.js server
│   ├── /src
│   │   ├── server.ts         # Main WebSocket server
│   │   ├── /config
│   │   │   └── env.ts        # Environment configuration
│   │   └── /services
│   │       ├── openai-realtime.service.ts   # OpenAI integration
│   │       ├── rag.service.ts               # RAG logic
│   │       └── supabase.service.ts          # Supabase client
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env                  # Environment variables (create this)
│   ├── .env.example          # Environment template
│   └── SUPABASE-SETUP.sql    # Database schema
│
├── /src                       # Next.js frontend
│   ├── /app/components/landing
│   │   └── Hero.tsx          # Updated with voice chat
│   ├── /hooks
│   │   └── useVoiceChat.ts   # Voice chat React hook
│   └── /lib
│       └── websocket-client.ts # WebSocket client
│
├── /knowledge-base
│   └── company-policies.md   # Sample knowledge base
│
├── .env.local                # Frontend env vars (create this)
├── .env.local.example        # Frontend env template
└── README-VOICE.md           # This file
```

---

## API Endpoints

### Voice Server

**WebSocket**: `ws://localhost:3001/ws/voice-chat`

**Messages** (Client → Server):
```json
{ "type": "start_recording" }
{ "type": "stop_recording" }
{ "type": "interrupt" }
{ "type": "ping" }
```

**Messages** (Server → Client):
```json
{ "type": "connected", "sessionId": "abc123" }
{ "type": "recording_started" }
{ "type": "processing" }
{ "type": "transcript", "userText": "...", "aiText": "..." }
{ "type": "audio_start" }
{ "type": "audio_end" }
{ "type": "interrupted" }
{ "type": "error", "message": "..." }
```

**HTTP Endpoints**:
- `GET /health` - Health check
- `POST /api/ingest-knowledge` - Ingest knowledge base

---

## Customization

### Add More Knowledge

1. Edit `/knowledge-base/company-policies.md`
2. Re-ingest: `curl -X POST http://localhost:3001/api/ingest-knowledge`

### Change AI Voice

Edit `/voice-server/src/services/openai-realtime.service.ts`:
```typescript
const mp3 = await openai.audio.speech.create({
  model: 'tts-1',
  voice: 'nova', // Options: alloy, echo, fable, onyx, nova, shimmer
  input: text,
});
```

### Adjust RAG Parameters

Edit `/voice-server/src/services/rag.service.ts`:
```typescript
// Number of context chunks to retrieve
async retrieveContext(query: string, topK: number = 5)

// Similarity threshold (0-1)
match_threshold: 0.7  // In Supabase search
```

---

## Troubleshooting

### "Connection error" in frontend

- Check that voice server is running on port 3001
- Verify `NEXT_PUBLIC_WS_URL` in `.env.local`
- Check browser console for WebSocket errors

### "Failed to access microphone"

- Grant microphone permissions in browser
- Use HTTPS in production (required for mic access)
- Check browser compatibility (Chrome/Edge recommended)

### "No audio data received"

- Check if MediaRecorder is supported in your browser
- Verify WebSocket connection is stable
- Check voice-server logs for audio chunk reception

### RAG returns "I don't have that information"

- Ensure knowledge base was ingested successfully
- Check Supabase table has data: `SELECT count(*) FROM knowledge_chunks;`
- Lower similarity threshold in `supabase.service.ts`

### OpenAI API errors

- Verify `OPENAI_API_KEY` is correct and has credits
- Check API usage limits
- Review voice-server console logs for detailed errors

---

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, WebSockets, MediaRecorder API
- **Backend**: Node.js, Express, WebSocket Server
- **AI**: OpenAI GPT-4, Whisper, TTS, text-embedding-3-small
- **Database**: Supabase (PostgreSQL + pgvector extension)
- **Deployment**: Vercel (frontend), Railway/Render (backend)

---

## Security Notes

- API keys are **never** exposed to the client
- All AI calls are proxied through the backend
- WebSocket connections can be authenticated (add JWT if needed)
- CORS is configured to allow only specific origins
- Use environment variables for all secrets

---

## Future Enhancements

- [ ] Add WebRTC for even lower latency
- [ ] Implement session persistence
- [ ] Add multi-language support
- [ ] Voice activity detection (VAD) for hands-free mode
- [ ] Real-time transcript display during listening
- [ ] Export conversation history
- [ ] Analytics dashboard for RAG performance

---

## License

This is part of the SentimentAI project. All rights reserved.

---

## Support

For issues or questions:
- Check the troubleshooting section above
- Review voice-server console logs
- Check browser console for frontend errors
- Verify all environment variables are set correctly

🎙️ **Happy voice chatting!**
