"use client";

import { motion } from "framer-motion";

interface VoiceRipplesProps {
  volume: number;
}

export default function VoiceRipples({ volume }: VoiceRipplesProps) {
  // Generate ripples based on AI audio volume
  const rippleCount = Math.max(2, Math.floor(volume * 4)); // 2-4 ripples based on volume
  const rippleOpacity = Math.max(0.3, volume * 0.8); // Opacity based on volume

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible">
      {Array.from({ length: rippleCount }).map((_, index) => (
        <motion.div
          key={`ripple-${index}`}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-4 border-white"
          initial={{
            scale: 1,
            opacity: rippleOpacity,
          }}
          animate={{
            scale: 1.5,
            opacity: 0,
          }}
          transition={{
            duration: 1.2,
            ease: "easeOut",
            delay: index * 0.3,
            repeat: Infinity,
          }}
        />
      ))}
    </div>
  );
}
