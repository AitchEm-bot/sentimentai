# SentimentAI

Real-time AI voice assistant with sentiment analysis for customer service calls. Powered by OpenAI's Realtime API with advanced voice visualizations.

## Features

- **Real-time Voice Chat**: Continuous conversation mode with OpenAI's GPT-4 Realtime API
- **Advanced Voice Visualizations**:
  - Volume-reactive button animations
  - Gradient color blending during user speech
  - AI voice ripple effects during responses
- **Automatic State Transitions**: Seamless flow between listening and speaking states
- **Embedded Knowledge Base**: HR policy information built into system prompt (no database required)

## Architecture

### Frontend (Next.js + React)
- **Framework**: Next.js 15 with App Router
- **UI Components**: Framer Motion for animations, Lucide icons
- **Audio Processing**: Web Audio API for real-time volume visualization
- **WebSocket Client**: Custom client for bi-directional audio streaming

### Backend (Node.js Voice Server)
- **Framework**: Express + WebSocket
- **AI Integration**: OpenAI Realtime API (GPT-4 Realtime Preview)
- **Audio Format**: PCM16 at 24kHz mono
- **Voice Activity Detection**: Server-side VAD via OpenAI

## Getting Started

### Prerequisites
- Node.js 18+
- OpenAI API key with Realtime API access

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd sentimentai
```

2. Install dependencies for frontend:
```bash
npm install
```

3. Install dependencies for voice server:
```bash
cd voice-server
npm install
```

4. Configure environment variables:

**Frontend** (.env.local):
```bash
NEXT_PUBLIC_WS_URL=ws://localhost:3001/ws/voice-chat
```

**Voice Server** (voice-server/.env):
```bash
PORT=3001
OPENAI_API_KEY=your-openai-api-key-here
ALLOWED_ORIGINS=http://localhost:3000
```

### Running the Application

1. Start the voice server (from `voice-server/` directory):
```bash
npm run dev
```

2. Start the Next.js frontend (from root directory):
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## How It Works

### Voice Flow
1. User clicks microphone button to start conversation
2. Browser captures audio via Web Audio API (24kHz PCM16)
3. Audio streams to voice server via WebSocket
4. Server forwards to OpenAI Realtime API with server-side VAD
5. AI generates response (text + audio)
6. Audio streams back to browser in real-time
7. Automatic transition to listening state when AI finishes speaking

### Audio Visualizations
- **User Speaking**: Button scales with voice volume, gradient animation
- **AI Speaking**: White ripples emanate from button, react to AI audio volume
- **Volume Tracking**: Separate AnalyserNodes for user input and AI output

### Smart State Management
- Detects actual audio playback completion (not just API response)
- 0.5 second silence detection before auto-transitioning
- Smooth animations between all states

## Project Structure

```
sentimentai/
├── src/
│   ├── app/
│   │   ├── components/landing/
│   │   │   └── Hero.tsx              # Main voice interface
│   │   └── globals.css               # Gradient animations
│   ├── components/
│   │   └── VoiceRipples.tsx          # AI voice ripple effect
│   ├── hooks/
│   │   ├── useVoiceChat.ts           # WebSocket + audio management
│   │   └── useAudioVisualizer.ts     # Volume tracking
│   └── lib/
│       └── websocket-client.ts       # WebSocket client
└── voice-server/
    ├── src/
    │   ├── server.ts                 # WebSocket server
    │   ├── config/env.ts             # Environment config
    │   └── services/
    │       └── openai-realtime.service.ts  # System prompt
    └── package.json
```

## Technologies

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express, WebSocket (ws)
- **AI**: OpenAI Realtime API (gpt-4o-realtime-preview-2024-10-01)
- **Audio**: Web Audio API, PCM16 24kHz

## Environment Variables

### Frontend
- `NEXT_PUBLIC_WS_URL`: WebSocket server URL

### Voice Server
- `PORT`: Server port (default: 3001)
- `OPENAI_API_KEY`: OpenAI API key
- `ALLOWED_ORIGINS`: CORS allowed origins

## License

MIT
