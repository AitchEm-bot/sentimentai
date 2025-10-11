"use client";

import React, { useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Mic } from "lucide-react";
import { useVoiceChatIntl } from "@/hooks/useVoiceChatIntl";
import { useAudioVisualizer } from "@/hooks/useAudioVisualizer";
import VoiceRipples from "@/components/VoiceRipples";
import { GoogleGeminiEffect } from "@/components/ui/google-gemini-effect";
import { useTranslations } from "next-intl";

export default function HeroIntl() {
  const t = useTranslations("hero");
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const pathLengthFirst = useTransform(scrollYProgress, [0, 0.8], [0.2, 1.2]);
  const pathLengthSecond = useTransform(scrollYProgress, [0, 0.8], [0.15, 1.2]);
  const pathLengthThird = useTransform(scrollYProgress, [0, 0.8], [0.1, 1.2]);
  const pathLengthFourth = useTransform(scrollYProgress, [0, 0.8], [0.05, 1.2]);
  const pathLengthFifth = useTransform(scrollYProgress, [0, 0.8], [0, 1.2]);

  const {
    voiceState,
    conversation,
    error,
    startListening,
    stopListening,
    clearConversation,
    isConnected,
    audioContext,
    mediaStream,
    aiAudioVolume,
  } = useVoiceChatIntl();

  // Get real-time audio volume for visualizer
  const userVolume = useAudioVisualizer(audioContext, mediaStream);

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

  // Calculate scale based on volume
  const getButtonScale = () => {
    if (voiceState === 'listening') {
      // Scale from 1.0 to 1.15 based on user's voice volume
      return 1 + (userVolume * 0.15);
    }
    return 1;
  };

  // Determine if gradient should animate
  const shouldAnimateGradient = voiceState === 'listening';

  const getStatusText = () => {
    if (voiceState === 'idle') {
      return t('clickToStart');
    }

    switch (voiceState) {
      case 'listening':
        return t('listening');
      case 'processing':
        return t('processing');
      case 'speaking':
        return t('speaking');
      default:
        return t('active');
    }
  };

  const sampleQuestions = t.raw('sampleQuestions') as string[];

  return (
    <section ref={ref} className="relative h-[400vh] bg-gradient-to-b from-white to-gray-50">
      <GoogleGeminiEffect
        pathLengths={[
          pathLengthFirst,
          pathLengthSecond,
          pathLengthThird,
          pathLengthFourth,
          pathLengthFifth,
        ]}
        title={t('title')}
        description={t('subtitle')}
      >
        <div className="flex flex-col items-center gap-6 w-full">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="px-4 py-2 bg-orange-50 border border-orange-200 rounded-full text-sm font-medium text-orange-600">
              {t('badge')}
            </span>
          </motion.div>

          {/* Mic Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
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
              className={`relative w-32 h-32 rounded-full bg-gradient-to-br from-orange-400 to-blue-500 shadow-2xl shadow-orange-200 flex items-center justify-center hover:scale-105 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${shouldAnimateGradient ? 'animate-gradient' : ''}`}
              style={{
                backgroundSize: shouldAnimateGradient ? '200% 200%' : '100% 100%',
              }}
            >
              {voiceState === 'speaking' && <VoiceRipples volume={aiAudioVolume} />}
              <Mic className="w-12 h-12 text-white z-10 relative" />
            </motion.button>
          </motion.div>

          {/* Connection Status */}
          <div className="relative flex flex-col items-center gap-2">
            {!isConnected && (
              <div className="text-yellow-600 text-sm">
                {t('connecting')}
              </div>
            )}

            {/* Status Text */}
            <div className="text-lg font-medium text-gray-700">
              {getStatusText()}
            </div>

            {/* Error message - absolutely positioned to not affect layout */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full mt-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm max-w-md shadow-lg z-10"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Conversation History */}
          {conversation.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-3xl w-full"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">{t('conversationHistory')}</h3>
                <button
                  onClick={clearConversation}
                  className="text-sm text-orange-500 hover:text-orange-600 cursor-pointer"
                >
                  {t('clear')}
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto space-y-4 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
                {conversation.map((msg) => (
                  <div key={msg.id} className="space-y-2">
                    <div className="p-3 bg-blue-50 rounded-lg text-left border border-blue-200">
                      <p className="text-sm font-semibold text-blue-600">{t('you')}</p>
                      <p className="text-gray-800">{msg.userText}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg text-left border border-green-200">
                      <p className="text-sm font-semibold text-green-600">{t('ai')}</p>
                      <p className="text-gray-800">{msg.aiText}</p>
                    </div>
                    <div className="text-xs text-gray-500 text-right">
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
          >
            <p className="text-sm text-gray-500 mb-3">{t('tryAsking')}</p>
            <div className="flex flex-wrap justify-center gap-2">
              {sampleQuestions.map((question, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 border border-gray-300 rounded-full text-xs text-gray-700"
                >
                  &ldquo;{question}&rdquo;
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </GoogleGeminiEffect>
    </section>
  );
}