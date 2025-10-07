export interface WebSocketMessage {
  type: 'connected' | 'recording_started' | 'speech_started' | 'processing' | 'transcript' | 'audio' | 'audio_start' | 'audio_end' | 'interrupted' | 'error' | 'pong' | 'user_transcript' | 'response_complete' | 'response_started' | 'audio_done';
  sessionId?: string;
  message?: string;
  userText?: string;
  aiText?: string;
  audio?: string; // base64 encoded PCM16
  transcript?: string;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export class VoiceWebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  public onStatusChange?: (status: ConnectionStatus) => void;
  public onMessage?: (message: WebSocketMessage) => void;
  public onAudioChunk?: (chunk: ArrayBuffer) => void;
  public onError?: (error: Error) => void;

  constructor(url: string) {
    this.url = url;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.onStatusChange?.('connecting');
        this.ws = new WebSocket(this.url);

        this.ws.binaryType = 'arraybuffer';

        this.ws.onopen = () => {
          console.log('✅ WebSocket connected');
          this.onStatusChange?.('connected');
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          if (event.data instanceof ArrayBuffer) {
            // Binary audio data (shouldn't happen with current implementation)
            this.onAudioChunk?.(event.data);
          } else {
            // JSON message
            try {
              const message: WebSocketMessage = JSON.parse(event.data);

              // Handle audio messages separately
              if (message.type === 'audio' && message.audio) {
                // Decode base64 to ArrayBuffer
                const binaryString = atob(message.audio);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                  bytes[i] = binaryString.charCodeAt(i);
                }
                this.onAudioChunk?.(bytes.buffer);
              } else {
                this.onMessage?.(message);
              }
            } catch (error) {
              console.error('Error parsing WebSocket message:', error);
            }
          }
        };

        this.ws.onerror = (event) => {
          console.error('❌ WebSocket error:', event);
          this.onStatusChange?.('error');
          const error = new Error('WebSocket connection error');
          this.onError?.(error);
          reject(error);
        };

        this.ws.onclose = (event) => {
          console.log('👋 WebSocket closed:', event.code, event.reason);
          this.onStatusChange?.('disconnected');
          this.ws = null;

          // Attempt reconnection if not manually closed
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`🔄 Reconnecting... (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            setTimeout(() => {
              this.connect().catch(console.error);
            }, this.reconnectDelay * this.reconnectAttempts);
          }
        };

      } catch (error) {
        this.onStatusChange?.('error');
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnected');
      this.ws = null;
    }
  }

  sendMessage(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  sendAudioChunk(base64Audio: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.sendMessage({
        type: 'audio',
        audio: base64Audio,
      });
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  commitAudio(): void {
    this.sendMessage({ type: 'commit_audio' });
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  startRecording(): void {
    this.sendMessage({ type: 'start_recording' });
  }

  stopRecording(): void {
    this.sendMessage({ type: 'stop_recording' });
  }

  interrupt(): void {
    this.sendMessage({ type: 'interrupt' });
  }
}
