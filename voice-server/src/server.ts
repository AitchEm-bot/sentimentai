import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import config from './config/env';
import openaiRealtimeService from './services/openai-realtime.service';
import contactRouter from './routes/contact';

const app = express();
const server = createServer(app);

// Configure CORS
app.use(cors({
  origin: config.server.allowedOrigins,
  credentials: true,
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Voice server is running' });
});

// Contact API route
app.use('/api', contactRouter);

// Create WebSocket server
const wss = new WebSocketServer({ server, path: '/ws/voice-chat' });

interface ClientState {
  sessionId: string;
  openaiWs: WebSocket | null;
}

const clients = new Map<WebSocket, ClientState>();

wss.on('connection', async (ws: WebSocket) => {
  const sessionId = Math.random().toString(36).substring(7);
  console.log(`🔌 New client connected: ${sessionId}`);

  const clientState: ClientState = {
    sessionId,
    openaiWs: null,
  };

  clients.set(ws, clientState);

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'connected',
    sessionId,
    message: 'Connected to SentimentAI voice assistant',
  }));

  try {
    // Connect to OpenAI Realtime API via WebSocket
    const url = 'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01';
    const openaiWs = new WebSocket(url, {
      headers: {
        'Authorization': `Bearer ${config.openai.apiKey}`,
        'OpenAI-Beta': 'realtime=v1',
      },
    });

    clientState.openaiWs = openaiWs;

    openaiWs.on('open', () => {
      console.log(`✅ Realtime API connected for session ${sessionId}`);

      // Configure the session - OpenAI expects PCM16 at 24kHz
      openaiWs.send(JSON.stringify({
        type: 'session.update',
        session: {
          modalities: ['text', 'audio'],
          instructions: openaiRealtimeService.getSystemPrompt(),
          voice: 'alloy',
          input_audio_format: 'pcm16',  // 24kHz mono PCM16
          output_audio_format: 'pcm16', // 24kHz mono PCM16
          input_audio_transcription: {
            model: 'whisper-1',
          },
          turn_detection: {
            type: 'server_vad',
            threshold: 0.5,
            prefix_padding_ms: 300,
            silence_duration_ms: 500,
          },
        },
      }));
    });

    // Forward messages from OpenAI to client
    openaiWs.on('message', (data: Buffer) => {
      try {
        const event = JSON.parse(data.toString());

        // Handle different event types
        switch (event.type) {
          case 'session.created':
            console.log(`📋 Session created for ${sessionId}`);
            break;

          case 'session.updated':
            console.log(`🔄 Session updated for ${sessionId}`);
            break;

          case 'input_audio_buffer.speech_started':
            console.log(`🎤 Speech started (${sessionId})`);
            ws.send(JSON.stringify({
              type: 'speech_started',
            }));
            break;

          case 'input_audio_buffer.speech_stopped':
            console.log(`🛑 Speech stopped (${sessionId}), triggering response`);
            ws.send(JSON.stringify({
              type: 'processing',
            }));
            break;

          case 'input_audio_buffer.committed':
            console.log(`✓ Audio buffer committed (${sessionId})`);
            break;

          case 'response.audio.delta':
            // Forward audio chunks to client
            ws.send(JSON.stringify({
              type: 'audio',
              audio: event.delta,
            }));
            break;

          case 'response.audio_transcript.delta':
            // AI's speech transcript (optional)
            break;

          case 'conversation.item.input_audio_transcription.completed':
            console.log(`📝 User said (${sessionId}):`, event.transcript);
            ws.send(JSON.stringify({
              type: 'user_transcript',
              transcript: event.transcript,
            }));
            break;

          case 'response.done':
            console.log(`✅ Response complete for session ${sessionId}`);
            ws.send(JSON.stringify({
              type: 'response_complete',
            }));
            break;

          case 'error':
            console.error(`❌ OpenAI error (${sessionId}):`, event.error);
            ws.send(JSON.stringify({
              type: 'error',
              message: 'An error occurred with the voice service',
            }));
            break;

          default:
            // Log unknown events for debugging
            if (!event.type?.startsWith('rate_limits')) {
              console.log(`🔔 Event (${sessionId}):`, event.type);
            }
        }
      } catch (error) {
        console.error('Error parsing OpenAI message:', error);
      }
    });

    openaiWs.on('error', (error) => {
      console.error(`❌ OpenAI WebSocket error (${sessionId}):`, error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Failed to connect to voice service',
      }));
    });

    openaiWs.on('close', () => {
      console.log(`👋 OpenAI connection closed for session ${sessionId}`);
    });

  } catch (error) {
    console.error(`Error connecting Realtime API for session ${sessionId}:`, error);
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Failed to connect to voice service',
    }));
    ws.close();
    return;
  }

  // Handle incoming messages from client
  ws.on('message', (data: Buffer | string) => {
    try {
      const openaiWs = clientState.openaiWs;
      if (!openaiWs || openaiWs.readyState !== WebSocket.OPEN) {
        console.warn('OpenAI WebSocket not ready');
        return;
      }

      // Check if it's a JSON message (control message)
      if (typeof data === 'string' || (data instanceof Buffer && data[0] === 0x7B)) { // 0x7B is '{'
        const message = JSON.parse(data.toString());

        switch (message.type) {
          case 'audio':
            // Client is sending audio data (base64 encoded PCM16 at 24kHz)
            if (message.audio) {
              // Log first audio chunk received
              if (!(clientState as any)._receivedFirstAudio) {
                console.log(`🎵 First audio chunk received for ${sessionId}, length: ${message.audio.length}`);
                (clientState as any)._receivedFirstAudio = true;
              }
              openaiWs.send(JSON.stringify({
                type: 'input_audio_buffer.append',
                audio: message.audio,
              }));
            }
            break;

          case 'interrupt':
            console.log(`⏸️  Client ${sessionId} interrupted`);
            openaiWs.send(JSON.stringify({
              type: 'response.cancel',
            }));
            ws.send(JSON.stringify({ type: 'interrupted' }));
            break;

          case 'commit_audio':
            // Client wants to commit the audio buffer for processing
            openaiWs.send(JSON.stringify({
              type: 'input_audio_buffer.commit',
            }));
            openaiWs.send(JSON.stringify({
              type: 'response.create',
            }));
            break;

          case 'ping':
            ws.send(JSON.stringify({ type: 'pong' }));
            break;

          case 'start_recording':
          case 'stop_recording':
            // These are client-side state management messages, not OpenAI events
            // Just acknowledge them
            break;

          default:
            console.warn('Unknown message type:', message.type);
        }
      } else {
        // It's binary audio data - convert to base64
        if (data instanceof Buffer) {
          const base64Audio = data.toString('base64');
          openaiWs.send(JSON.stringify({
            type: 'input_audio_buffer.append',
            audio: base64Audio,
          }));
        }
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  });

  ws.on('close', () => {
    console.log(`👋 Client disconnected: ${sessionId}`);
    if (clientState.openaiWs) {
      clientState.openaiWs.close();
    }
    clients.delete(ws);
  });

  ws.on('error', (error) => {
    console.error(`❌ WebSocket error for client ${sessionId}:`, error);
    if (clientState.openaiWs) {
      clientState.openaiWs.close();
    }
    clients.delete(ws);
  });
});

// Start the server
const PORT = config.server.port;
server.listen(PORT, () => {
  console.log('🚀 ======================================');
  console.log(`🎙️  SentimentAI Voice Server (Simplified)`);
  console.log(`🌐 HTTP Server: http://localhost:${PORT}`);
  console.log(`🔌 WebSocket: ws://localhost:${PORT}/ws/voice-chat`);
  console.log('🚀 ======================================');
  console.log('');
  console.log('📝 Available endpoints:');
  console.log(`   GET  /health - Health check`);
  console.log('');
  console.log('✨ Using OpenAI Realtime API');
  console.log('💡 No database required - knowledge embedded in system prompt');
  console.log('');
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 SIGTERM received, closing server...');
  server.close(() => {
    console.log('👋 Server closed');
    process.exit(0);
  });
});
