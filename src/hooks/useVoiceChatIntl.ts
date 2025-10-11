"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { VoiceWebSocketClient, ConnectionStatus, WebSocketMessage } from '@/lib/websocket-client';
import { useLocale } from 'next-intl';

export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';

export interface ConversationMessage {
  id: string;
  userText: string;
  aiText: string;
  timestamp: Date;
}

export function useVoiceChatIntl() {
  const locale = useLocale();
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentUserText, setCurrentUserText] = useState<string>('');
  const [currentAiText, setCurrentAiText] = useState<string>('');
  const [isInSession, setIsInSession] = useState<boolean>(false);

  const wsClientRef = useRef<VoiceWebSocketClient | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const playbackBufferRef = useRef<Int16Array[]>([]);
  const playbackContextRef = useRef<AudioContext | null>(null);
  const playbackSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const isPlayingRef = useRef<boolean>(false);
  const playbackAnalyserRef = useRef<AnalyserNode | null>(null);
  const volumeMonitoringIdRef = useRef<number | null>(null);
  const schedulingTimeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const isMonitoringVolumeRef = useRef<boolean>(false);
  const isInterruptedRef = useRef<boolean>(false);
  const [aiAudioVolume, setAiAudioVolume] = useState<number>(0);

  // Initialize WebSocket client with locale
  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001/ws/voice-chat';
    // Add locale as query parameter
    const urlWithLocale = `${wsUrl}?locale=${locale}`;
    const client = new VoiceWebSocketClient(urlWithLocale);

    client.onStatusChange = (status) => {
      setConnectionStatus(status);
      if (status === 'error') {
        setError('Unable to connect to voice server');
      } else if (status === 'connected') {
        setError(null); // Clear error when connected
      }
    };

    client.onMessage = (message: WebSocketMessage) => {
      handleWebSocketMessage(message);
    };

    client.onAudioChunk = (chunk: ArrayBuffer) => {
      // CRITICAL: Reject all audio if we're in interrupted state
      if (isInterruptedRef.current) {
        console.log(`🚫 Rejecting audio chunk - interrupted state`);
        return;
      }

      // Convert ArrayBuffer to Int16Array (PCM16)
      const pcm16 = new Int16Array(chunk);
      playbackBufferRef.current.push(pcm16);
      console.log(`🎵 Buffered audio chunk (${pcm16.length} samples), buffer size: ${playbackBufferRef.current.length}`);

      // Start playing after buffering a few chunks to prevent choppy playback
      // Buffer at least 3 chunks before starting playback
      if (!isPlayingRef.current && playbackBufferRef.current.length >= 3) {
        console.log('▶️ Starting audio playback with buffer');
        setVoiceState('speaking');
        isPlayingRef.current = true;
        playAudioStreamRealtime();
      }
    };

    client.onError = (err) => {
      // Only show connection errors, not errors during active sessions
      console.log('WebSocket error:', err);
      // Connection errors are handled by onStatusChange
    };

    wsClientRef.current = client;

    // Connect on mount
    client.connect().catch((err) => {
      console.error('Failed to connect:', err);
      setError('Unable to connect to voice server');
    });

    return () => {
      client.disconnect();
      stopAudioPlayback();
    };
  }, [locale]); // Re-initialize when locale changes

  const handleWebSocketMessage = (message: WebSocketMessage) => {
    switch (message.type) {
      case 'connected':
        console.log('Connected with session:', message.sessionId, 'locale:', message.locale);
        setError(null);
        break;

      case 'recording_started':
        console.log('Recording started');
        break;

      case 'speech_started':
        console.log('🎤 Speech detected by VAD, current state:', voiceState, 'isPlaying:', isPlayingRef.current);
        // User started speaking - set interrupted flag to reject incoming audio
        console.log('🛑 Setting interrupted flag - will reject all incoming audio');
        isInterruptedRef.current = true;

        // If audio is playing, stop it immediately
        if (isPlayingRef.current || voiceState === 'speaking') {
          console.log('⏸️ Interrupting AI playback due to user speech');
          stopAudioPlayback();
        }

        // Send interrupt to server to stop AI response generation
        wsClientRef.current?.interrupt();
        setVoiceState('listening');
        break;

      case 'processing':
        console.log('Processing user speech - clearing interrupted flag for new response');
        // Clear interrupted flag now so we can accept audio from the new response
        isInterruptedRef.current = false;
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

      case 'response_started':
        console.log('🎬 New response starting - clearing interrupted flag');
        // New AI response starting - clear interrupted flag to accept audio chunks
        isInterruptedRef.current = false;
        setVoiceState('speaking');
        // Don't clear buffer - first chunks might already be in transit
        break;

      case 'audio_start':
        console.log('🔊 Audio start');
        setVoiceState('speaking');
        break;

      case 'response_complete':
        console.log('📝 Response complete (text generation done, audio may still be streaming)');
        // Don't stop isPlayingRef - audio chunks are still coming
        // Let the audio finish naturally via scheduling loop
        break;

      case 'audio_done':
        console.log('🔊 Audio streaming complete - no more chunks coming');
        // Signal that no more audio chunks will arrive
        isPlayingRef.current = false;
        // State transition happens in scheduling loop when last chunk finishes
        break;

      case 'interrupted':
        setVoiceState('idle');
        setIsInSession(false);
        stopAudioPlayback();
        break;

      case 'error':
        // Only log errors, don't display them (connection errors already handled)
        console.error('Server error:', message.message);
        setVoiceState('idle');
        setIsInSession(false);
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
        // Stop AI playback when user starts speaking
        console.log('👤 User manually started speaking during AI playback');
        stopAudioPlayback();
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
      setIsInSession(true);

    } catch (err) {
      console.error('Error starting recording:', err);
      // Don't show error - user likely denied microphone permission
      setVoiceState('idle');
      setIsInSession(false);
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
      setIsInSession(false);
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
      // Create audio context for playback at 24kHz if not exists or if closed
      if (!playbackContextRef.current || playbackContextRef.current.state === 'closed') {
        playbackContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 24000,
        });

        // Create analyser for AI audio volume tracking
        const analyser = playbackContextRef.current.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8;
        analyser.connect(playbackContextRef.current.destination);
        playbackAnalyserRef.current = analyser;

        // Start volume monitoring only if not already monitoring
        if (!isMonitoringVolumeRef.current) {
          isMonitoringVolumeRef.current = true;

          const dataArray = new Uint8Array(analyser.frequencyBinCount);

          const updateAiVolume = () => {
            if (!playbackAnalyserRef.current || !isMonitoringVolumeRef.current) {
              setAiAudioVolume(0);
              isMonitoringVolumeRef.current = false;
              return; // Stop if monitoring was cancelled
            }

            playbackAnalyserRef.current.getByteFrequencyData(dataArray);
            const sum = dataArray.reduce((acc, val) => acc + val, 0);
            const average = sum / dataArray.length;
            const normalizedVolume = Math.min(average / 128, 1);

            setAiAudioVolume(normalizedVolume);

            // Just monitor volume, don't auto-transition states
            // State transitions should be explicit based on events, not silence detection
            volumeMonitoringIdRef.current = requestAnimationFrame(updateAiVolume);
          };
          updateAiVolume();
        }
      }

      const playbackContext = playbackContextRef.current;
      // Always start from current time, not accumulated time
      let currentTime = playbackContext.currentTime;

      // Function to schedule audio chunks as they arrive
      const scheduleNextChunk = () => {
        // Process multiple chunks at once if available to reduce scheduling overhead
        const chunksToProcess = Math.min(playbackBufferRef.current.length, 3);

        if (chunksToProcess === 0) {
          // No more chunks in buffer
          if (activeSourcesRef.current.length === 0 && !isPlayingRef.current) {
            // All audio has finished playing and no more chunks expected
            console.log('✅ All audio playback complete - transitioning to listening');
            setVoiceState('listening');
            isMonitoringVolumeRef.current = false;
            setAiAudioVolume(0);
            return;
          }

          // Check again after a short delay if still playing
          if (isPlayingRef.current) {
            schedulingTimeoutIdRef.current = setTimeout(scheduleNextChunk, 50);
          }
          return;
        }

        // Process up to 3 chunks at once for smoother playback
        for (let i = 0; i < chunksToProcess; i++) {
          const chunk = playbackBufferRef.current.shift();
          if (!chunk) break;

          // Create AudioBuffer for this chunk
          const audioBuffer = playbackContext.createBuffer(1, chunk.length, 24000);
          const channelData = audioBuffer.getChannelData(0);

          // Convert Int16 to Float32
          for (let j = 0; j < chunk.length; j++) {
            channelData[j] = chunk[j] / (chunk[j] < 0 ? 0x8000 : 0x7FFF);
          }

          // Play the chunk
          const source = playbackContext.createBufferSource();
          source.buffer = audioBuffer;

          // Track this source so we can stop it later if needed
          activeSourcesRef.current.push(source);

          // Clean up when source finishes playing
          source.onended = () => {
            const index = activeSourcesRef.current.indexOf(source);
            if (index > -1) {
              activeSourcesRef.current.splice(index, 1);
            }

            // Check if all audio is done
            if (playbackBufferRef.current.length === 0 && activeSourcesRef.current.length === 0 && !isPlayingRef.current) {
              console.log('✅ Last audio source ended - transitioning to listening');
              setVoiceState('listening');
              isMonitoringVolumeRef.current = false;
              setAiAudioVolume(0);
            }
          };

          // Connect to analyser for volume tracking
          if (playbackAnalyserRef.current) {
            source.connect(playbackAnalyserRef.current);
          } else {
            source.connect(playbackContext.destination);
          }

          // Schedule to start right after previous chunk
          const startTime = Math.max(currentTime, playbackContext.currentTime);
          source.start(startTime);
          currentTime = startTime + audioBuffer.duration;
        }

        // Schedule next chunk
        if (isPlayingRef.current || playbackBufferRef.current.length > 0) {
          schedulingTimeoutIdRef.current = setTimeout(scheduleNextChunk, 10);
        } else {
          console.log('🔄 Scheduling loop ended - waiting for more chunks or audio completion');
        }
      };

      scheduleNextChunk();

    } catch (err) {
      console.error('Error playing audio stream:', err);
      // Don't show UI errors for playback issues
      isPlayingRef.current = false;
    }
  };

  const playAudioResponse = async () => {
    // This function is now deprecated in favor of real-time streaming
    // Kept for compatibility with old message types
  };

  const stopAudioPlayback = () => {
    console.log('🛑 stopAudioPlayback called - buffer size:', playbackBufferRef.current.length, 'active sources:', activeSourcesRef.current.length);

    isPlayingRef.current = false;
    setAiAudioVolume(0);

    // Cancel volume monitoring
    isMonitoringVolumeRef.current = false;
    if (volumeMonitoringIdRef.current !== null) {
      console.log('❌ Canceling volume monitoring');
      cancelAnimationFrame(volumeMonitoringIdRef.current);
      volumeMonitoringIdRef.current = null;
    }

    // Clear any pending scheduling timeouts
    if (schedulingTimeoutIdRef.current !== null) {
      console.log('❌ Clearing scheduling timeout');
      clearTimeout(schedulingTimeoutIdRef.current);
      schedulingTimeoutIdRef.current = null;
    }

    // Stop all active audio sources
    console.log(`❌ Stopping ${activeSourcesRef.current.length} active audio sources`);
    activeSourcesRef.current.forEach(source => {
      try {
        source.stop();
        source.disconnect();
      } catch {
        // Ignore if already stopped
      }
    });
    activeSourcesRef.current = [];

    if (playbackSourceRef.current) {
      try {
        playbackSourceRef.current.stop();
      } catch {
        // Ignore if already stopped
      }
      playbackSourceRef.current = null;
    }

    // Close and clear the playback context
    if (playbackContextRef.current) {
      console.log('❌ Closing playback context');
      try {
        // Only close if not already closed
        if (playbackContextRef.current.state !== 'closed') {
          playbackContextRef.current.close();
        }
      } catch {
        // Silently ignore errors when closing
      }
      playbackContextRef.current = null;
    }

    playbackAnalyserRef.current = null;

    // CRITICAL: Clear the audio buffer to prevent old chunks from replaying
    console.log(`🗑️ Clearing ${playbackBufferRef.current.length} buffered chunks`);
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
    isInSession,
    // Expose audio context and stream for visualizer
    audioContext: audioContextRef.current,
    mediaStream: mediaStreamRef.current,
    aiAudioVolume,
  };
}