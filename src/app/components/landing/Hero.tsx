import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mic, Sparkles } from "lucide-react";

export default function Hero() {
  const [isListening, setIsListening] = useState(false);

  const handleMicClick = () => {
    setIsListening(!isListening);
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

        {/* Microphone Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex justify-center"
        >
          <button
            onClick={handleMicClick}
            className={`relative w-32 h-32 rounded-full bg-gradient-to-br from-orange-400 to-blue-500 shadow-2xl shadow-orange-200 flex items-center justify-center transition-all duration-300 hover:scale-105 cursor-pointer ${
              isListening ? "animate-pulse" : ""
            }`}
          >
            <Mic className="w-12 h-12 text-white" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
