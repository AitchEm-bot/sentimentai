"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Sparkles, Loader2 } from "lucide-react";
import { useVoiceChat } from "@/hooks/useVoiceChat";
import { useAudioVisualizer } from "@/hooks/useAudioVisualizer";
import VoiceWave from "@/components/VoiceWave";

export default function Hero() {
  const {
    voiceState,
    conversation,
    error,
    currentUserText,
    currentAiText,
    startListening,
    stopListening,
    interrupt,
    clearConversation,
    isConnected,
    audioContext,
    mediaStream,
  } = useVoiceChat();

  // Get real-time audio volume for visualizer
  const volume = useAudioVisualizer(audioContext, mediaStream);

  const handleMicClick = () => {
    if (voiceState === 'idle') {
      // Start continuous conversation mode
      startListening();
    } else {
      // Stop/interrupt the conversation
      // This will stop listening, interrupt AI, and return to idle
      stopListening();
    }
  };

  const getButtonStyle = () => {
    switch (voiceState) {
      case 'listening':
        return 'from-red-400 to-red-600';
      case 'processing':
        return 'from-yellow-400 to-yellow-600';
      case 'speaking':
        return 'from-green-400 to-green-600';
      default:
        return 'from-orange-400 to-blue-500';
    }
  };

  // Calculate scale based on volume for listening state
  const getButtonScale = () => {
    if (voiceState === 'listening') {
      // Scale from 1.0 to 1.15 based on volume
      return 1 + (volume * 0.15);
    }
    return 1;
  };

  const getStatusText = () => {
    switch (voiceState) {
      case 'listening':
        return 'Listening...';
      case 'processing':
        return 'Thinking...';
      case 'speaking':
        return 'Speaking...';
      default:
        return 'Click to start talking';
    }
  };

  const getIcon = () => {
    switch (voiceState) {
      case 'listening':
        return <Mic className="w-12 h-12 text-white" />;
      case 'processing':
        return <Loader2 className="w-12 h-12 text-white animate-spin" />;
      case 'speaking':
        return <VoiceWave />;
      default:
        return <Mic className="w-12 h-12 text-white" />;
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100 mb-8"
        >
          <Sparkles className="w-4 h-4 text-orange-500" />
          <span className="text-sm text-gray-700">AI-Powered Sentiment Analysis</span>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
        >
          Transform Customer <br />
          <span className="bg-gradient-to-r from-orange-500 via-orange-400 to-blue-500 bg-clip-text text-transparent">
            Service with AI
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-gray-600 mb-4 max-w-3xl mx-auto"
        >
          Real-time sentiment analysis for customer service calls.
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-lg md:text-xl text-gray-600 mb-12 max-w-3xl mx-auto"
        >
          Powered by advanced AI. Built for scale.
        </motion.p>

        {/* Connection Status */}
        {!isConnected && (
          <div className="mb-4 text-yellow-600 text-sm">
            Connecting to voice server...
          </div>
        )}

        {error && (
          <div className="mb-4 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm max-w-md mx-auto">
            {error}
          </div>
        )}

        {/* Microphone Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col items-center gap-4"
        >
          <motion.button
            onClick={handleMicClick}
            disabled={!isConnected}
            animate={{
              scale: getButtonScale(),
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
            }}
            className={`relative w-32 h-32 rounded-full bg-gradient-to-br ${getButtonStyle()} shadow-2xl shadow-orange-200 flex items-center justify-center hover:scale-105 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {getIcon()}
          </motion.button>

          {/* Status Text */}
          <div className="text-lg font-medium text-gray-700">
            {getStatusText()}
          </div>

          {/* Current Interaction */}
          <AnimatePresence>
            {(currentUserText || currentAiText) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 max-w-2xl mx-auto"
              >
                {currentUserText && (
                  <div className="mb-2 p-3 bg-blue-50 rounded-lg text-left">
                    <p className="text-sm font-semibold text-blue-900">You:</p>
                    <p className="text-gray-700">{currentUserText}</p>
                  </div>
                )}
                {currentAiText && (
                  <div className="p-3 bg-green-50 rounded-lg text-left">
                    <p className="text-sm font-semibold text-green-900">AI:</p>
                    <p className="text-gray-700">{currentAiText}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Conversation History */}
        {conversation.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-12 max-w-3xl mx-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Conversation History</h3>
              <button
                onClick={clearConversation}
                className="text-sm text-orange-500 hover:text-orange-600 cursor-pointer"
              >
                Clear
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-4 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              {conversation.map((msg) => (
                <div key={msg.id} className="space-y-2">
                  <div className="p-3 bg-blue-50 rounded-lg text-left">
                    <p className="text-sm font-semibold text-blue-900">You:</p>
                    <p className="text-gray-700">{msg.userText}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg text-left">
                    <p className="text-sm font-semibold text-green-900">AI:</p>
                    <p className="text-gray-700">{msg.aiText}</p>
                  </div>
                  <div className="text-xs text-gray-400 text-right">
                    {msg.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Sample Questions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12"
        >
          <p className="text-sm text-gray-500 mb-3">Try asking:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              "How many vacation days do I get?",
              "What's the expense limit for meals?",
              "How do I contact IT support?",
            ].map((question, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600"
              >
                "{question}"
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
