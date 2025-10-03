"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { VoiceWebSocketClient, ConnectionStatus, WebSocketMessage } from '@/lib/websocket-client';

export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';

export interface ConversationMessage {
  id: string;
  userText: string;
  aiText: string;
  timestamp: Date;
}

export function useVoiceChat() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentUserText, setCurrentUserText] = useState<string>('');
  const [currentAiText, setCurrentAiText] = useState<string>('');

  const wsClientRef = useRef<VoiceWebSocketClient | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioWorkletNodeRef = useRef<AudioWorkletNode | null>(null);
  const playbackBufferRef = useRef<Int16Array[]>([]);
  const playbackContextRef = useRef<AudioContext | null>(null);
  const playbackSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const isPlayingRef = useRef<boolean>(false);

  // Initialize WebSocket client
  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001/ws/voice-chat';
    const client = new VoiceWebSocketClient(wsUrl);

    client.onStatusChange = (status) => {
      setConnectionStatus(status);
      if (status === 'error') {
        setError('Connection error. Please try again.');
      }
    };

    client.onMessage = (message: WebSocketMessage) => {
      handleWebSocketMessage(message);
    };

    client.onAudioChunk = (chunk: ArrayBuffer) => {
      // Convert ArrayBuffer to Int16Array (PCM16)
      const pcm16 = new Int16Array(chunk);
      playbackBufferRef.current.push(pcm16);

      // Start playing immediately when we receive first chunk
      if (!isPlayingRef.current && voiceState !== 'speaking') {
        setVoiceState('speaking');
        isPlayingRef.current = true;
        playAudioStreamRealtime();
      }
    };

    client.onError = (err) => {
      setError(err.message);
      setVoiceState('idle');
    };

    wsClientRef.current = client;

    // Connect on mount
    client.connect().catch((err) => {
      console.error('Failed to connect:', err);
      setError('Failed to connect to voice server');
    });

    return () => {
      client.disconnect();
      stopAudioPlayback();
    };
  }, []);

  const handleWebSocketMessage = (message: WebSocketMessage) => {
    switch (message.type) {
      case 'connected':
        console.log('Connected with session:', message.sessionId);
        setError(null);
        break;

      case 'recording_started':
        console.log('Recording started');
        break;

      case 'speech_started':
        console.log('Speech detected by VAD');
        // User started speaking - visual feedback could be added here
        break;

      case 'processing':
        console.log('Processing user speech');
        setVoiceState('processing');
        break;

      case 'user_transcript':
        // User's speech was transcribed
        if (message.transcript) {
          setCurrentUserText(message.transcript);
        }
        break;

      case 'transcript':
        if (message.userText && message.aiText) {
          setCurrentUserText(message.userText);
          setCurrentAiText(message.aiText);

          // Add to conversation history
          const newMessage: ConversationMessage = {
            id: Date.now().toString(),
            userText: message.userText,
            aiText: message.aiText,
            timestamp: new Date(),
          };
          setConversation(prev => [...prev, newMessage]);
        }
        break;

      case 'audio_start':
        setVoiceState('speaking');
        playbackBufferRef.current = [];
        break;

      case 'response_complete':
        // AI response is complete
        isPlayingRef.current = false;

        // In continuous mode, automatically go back to listening
        // Set a small delay to ensure audio finishes playing
        setTimeout(() => {
          if (voiceState === 'speaking') {
            setVoiceState('listening');
          }
        }, 500);
        break;

      case 'audio_end':
        playAudioResponse();
        setVoiceState('idle');
        break;

      case 'interrupted':
        setVoiceState('idle');
        stopAudioPlayback();
        break;

      case 'error':
        setError(message.message || 'An error occurred');
        setVoiceState('idle');
        break;
    }
  };

  const startListening = useCallback(async () => {
    // Allow restarting from speaking state (continuous mode)
    if (voiceState !== 'idle' && voiceState !== 'speaking') return;

    try {
      setError(null);

      // If already have audio context running, just switch back to listening
      if (audioContextRef.current && voiceState === 'speaking') {
        setVoiceState('listening');
        return;
      }

      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 24000,
          echoCancellation: true,
          noiseSuppression: true,
        }
      });

      mediaStreamRef.current = stream;

      // Create AudioContext at 24kHz for PCM16 encoding
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000,
      });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);

      // Use ScriptProcessorNode to capture raw PCM data
      const bufferSize = 4096;
      const processor = audioContext.createScriptProcessor(bufferSize, 1, 1);

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);

        // Convert Float32 to Int16 (PCM16)
        const pcm16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }

        // Convert Int16Array to base64
        const base64 = arrayBufferToBase64(pcm16.buffer);

        // Send to server (OpenAI will handle when to process it)
        wsClientRef.current?.sendAudioChunk(base64);
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

      // Store reference for cleanup
      (audioContext as any)._processor = processor;
      (audioContext as any)._source = source;

      // Notify server we're starting to record
      wsClientRef.current?.startRecording();

      setVoiceState('listening');

    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Failed to access microphone');
      setVoiceState('idle');
    }
  }, [voiceState]);

  // Helper function to convert ArrayBuffer to base64
  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const stopListening = useCallback(() => {
    if (audioContextRef.current) {
      const audioContext = audioContextRef.current;

      // Disconnect and cleanup audio nodes
      if ((audioContext as any)._processor) {
        (audioContext as any)._processor.disconnect();
        (audioContext as any)._source.disconnect();
      }

      // Stop media stream tracks
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }

      // Close audio context
      audioContext.close();
      audioContextRef.current = null;

      // Notify server we're stopping (this ends the entire conversation session)
      wsClientRef.current?.stopRecording();

      // Stop any audio playback
      stopAudioPlayback();

      setVoiceState('idle');
    }
  }, [voiceState]);

  const interrupt = useCallback(() => {
    if (voiceState === 'speaking' || voiceState === 'processing') {
      wsClientRef.current?.interrupt();
      stopAudioPlayback();
      setVoiceState('idle');
    }
  }, [voiceState]);

  const playAudioStreamRealtime = async () => {
    try {
      // Create audio context for playback at 24kHz if not exists
      if (!playbackContextRef.current) {
        playbackContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 24000,
        });
      }

      const playbackContext = playbackContextRef.current;
      let currentTime = playbackContext.currentTime;

      // Function to schedule audio chunks as they arrive
      const scheduleNextChunk = () => {
        if (playbackBufferRef.current.length === 0) {
          // Check again after a short delay if still playing
          if (isPlayingRef.current) {
            setTimeout(scheduleNextChunk, 50);
          }
          return;
        }

        const chunk = playbackBufferRef.current.shift()!;

        // Create AudioBuffer for this chunk
        const audioBuffer = playbackContext.createBuffer(1, chunk.length, 24000);
        const channelData = audioBuffer.getChannelData(0);

        // Convert Int16 to Float32
        for (let i = 0; i < chunk.length; i++) {
          channelData[i] = chunk[i] / (chunk[i] < 0 ? 0x8000 : 0x7FFF);
        }

        // Play the chunk
        const source = playbackContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(playbackContext.destination);

        // Schedule to start right after previous chunk
        const startTime = Math.max(currentTime, playbackContext.currentTime);
        source.start(startTime);
        currentTime = startTime + audioBuffer.duration;

        // Schedule next chunk
        if (isPlayingRef.current) {
          setTimeout(scheduleNextChunk, 10);
        }
      };

      scheduleNextChunk();

    } catch (err) {
      console.error('Error playing audio stream:', err);
      setError('Failed to play audio response');
      isPlayingRef.current = false;
    }
  };

  const playAudioResponse = async () => {
    // This function is now deprecated in favor of real-time streaming
    // Kept for compatibility with old message types
  };

  const stopAudioPlayback = () => {
    isPlayingRef.current = false;

    if (playbackSourceRef.current) {
      try {
        playbackSourceRef.current.stop();
      } catch (e) {
        // Ignore if already stopped
      }
      playbackSourceRef.current = null;
    }

    if (playbackContextRef.current) {
      playbackContextRef.current.close();
      playbackContextRef.current = null;
    }

    playbackBufferRef.current = [];
  };

  const clearConversation = useCallback(() => {
    setConversation([]);
    setCurrentUserText('');
    setCurrentAiText('');
  }, []);

  return {
    connectionStatus,
    voiceState,
    conversation,
    error,
    currentUserText,
    currentAiText,
    startListening,
    stopListening,
    interrupt,
    clearConversation,
    isConnected: connectionStatus === 'connected',
    // Expose audio context and stream for visualizer
    audioContext: audioContextRef.current,
    mediaStream: mediaStreamRef.current,
  };
}
