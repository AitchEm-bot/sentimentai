import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { callAnalyses, getSentimentScore, getSentimentLabel, extractEmotions } from "@/data/callAnalyses";

// Typing effect hook
function useTypingEffect(text: string, speed: number = 20) {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayedText("");
    setIsComplete(false);
    let index = 0;

    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        setIsComplete(true);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return { displayedText, isComplete };
}

// Typing text component
function TypingText({ text, speed = 20 }: { text: string; speed?: number }) {
  const { displayedText, isComplete } = useTypingEffect(text, speed);

  return (
    <>
      {displayedText}
      {!isComplete && <span className="animate-pulse">|</span>}
    </>
  );
}

// Staggered list typing component
function TypingList({ items, speed = 20, delay = 500 }: { items: string[]; speed?: number; delay?: number }) {
  const [visibleItems, setVisibleItems] = useState<number>(0);

  useEffect(() => {
    setVisibleItems(0);
    const timer = setTimeout(() => {
      if (visibleItems < items.length) {
        setVisibleItems(prev => prev + 1);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [items]);

  useEffect(() => {
    if (visibleItems < items.length) {
      const timer = setTimeout(() => {
        setVisibleItems(prev => prev + 1);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [visibleItems, items.length, delay]);

  return (
    <>
      {items.slice(0, visibleItems).map((item, idx) => (
        <li key={idx} className="flex items-start gap-2">
          <span className="text-orange-500 mt-1">•</span>
          <span className="text-gray-600 text-sm">
            {idx === visibleItems - 1 ? <TypingText text={item} speed={speed} /> : item}
          </span>
        </li>
      ))}
    </>
  );
}

// Recommendations typing component (with blue bullet)
function TypingListRecommendations({ items, speed = 20, delay = 500 }: { items: string[]; speed?: number; delay?: number }) {
  const [visibleItems, setVisibleItems] = useState<number>(0);

  useEffect(() => {
    setVisibleItems(0);
    const timer = setTimeout(() => {
      if (visibleItems < items.length) {
        setVisibleItems(prev => prev + 1);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [items]);

  useEffect(() => {
    if (visibleItems < items.length) {
      const timer = setTimeout(() => {
        setVisibleItems(prev => prev + 1);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [visibleItems, items.length, delay]);

  return (
    <>
      {items.slice(0, visibleItems).map((item, idx) => (
        <li key={idx} className="flex items-start gap-2">
          <span className="text-blue-500 mt-1">•</span>
          <span className="text-gray-600 text-sm">
            {idx === visibleItems - 1 ? <TypingText text={item} speed={speed} /> : item}
          </span>
        </li>
      ))}
    </>
  );
}

export default function DemoShowcase() {
  const [selectedDemo, setSelectedDemo] = useState(0);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [animatedSentiment, setAnimatedSentiment] = useState(0);

  // Transform real analysis data into demo format
  const angryAnalysis = callAnalyses.angry;
  const happyAnalysis = callAnalyses.happy;
  const normalAnalysis = callAnalyses.normal;

  // Helper to format key moments
  const formatKeyMoments = (moments: (string | { timestamp?: string; description?: string })[]): string[] => {
    return moments.slice(0, 4).map(moment =>
      typeof moment === 'string' ? moment : moment.description || ''
    );
  };

  const demos = [
    {
      title: "Frustrated Customer - Service Outage",
      sentiment: getSentimentLabel(angryAnalysis.emotional_ranking),
      sentimentScore: getSentimentScore(angryAnalysis.emotional_ranking),
      emotions: extractEmotions(angryAnalysis),
      analysis: {
        summary: angryAnalysis.analysis.customer_emotional_state.slice(0, 200) + "...",
        keyPoints: formatKeyMoments(angryAnalysis.analysis.key_moments),
        recommendations: angryAnalysis.analysis.recommendations.slice(0, 3)
      },
      audioFile: "/audio/Angry_Call_snippet.mp3",
      duration: Math.floor(angryAnalysis.duration_seconds / 60) + ":" + String(angryAnalysis.duration_seconds % 60).padStart(2, '0'),
      agentScore: angryAnalysis.agent_score,
      handledWell: angryAnalysis.analysis.handled_well,
      gradientFrom: "from-red-400",
      gradientTo: "to-orange-600",
      sentimentBg: "bg-red-50",
      sentimentText: "text-red-600",
      sentimentBorder: "border-red-200",
      barColor: "bg-red-500"
    },
    {
      title: "Satisfied Customer - Anniversary Reservation",
      sentiment: getSentimentLabel(happyAnalysis.emotional_ranking),
      sentimentScore: getSentimentScore(happyAnalysis.emotional_ranking),
      emotions: extractEmotions(happyAnalysis),
      analysis: {
        summary: happyAnalysis.analysis.customer_emotional_state.slice(0, 200) + "...",
        keyPoints: formatKeyMoments(happyAnalysis.analysis.key_moments),
        recommendations: happyAnalysis.analysis.recommendations.slice(0, 3)
      },
      audioFile: "/audio/Happy_Call_snippet.mp3",
      duration: Math.floor(happyAnalysis.duration_seconds / 60) + ":" + String(happyAnalysis.duration_seconds % 60).padStart(2, '0'),
      agentScore: happyAnalysis.agent_score,
      handledWell: happyAnalysis.analysis.handled_well,
      gradientFrom: "from-green-400",
      gradientTo: "to-emerald-500",
      sentimentBg: "bg-green-50",
      sentimentText: "text-green-600",
      sentimentBorder: "border-green-200",
      barColor: "bg-green-500"
    },
    {
      title: "Standard Customer - General Inquiry",
      sentiment: getSentimentLabel(normalAnalysis.emotional_ranking),
      sentimentScore: getSentimentScore(normalAnalysis.emotional_ranking),
      emotions: extractEmotions(normalAnalysis),
      analysis: {
        summary: normalAnalysis.analysis.customer_emotional_state.slice(0, 200) + "...",
        keyPoints: formatKeyMoments(normalAnalysis.analysis.key_moments),
        recommendations: normalAnalysis.analysis.recommendations.slice(0, 3)
      },
      audioFile: "/audio/Normal_Call_snippet.mp3",
      duration: Math.floor(normalAnalysis.duration_seconds / 60) + ":" + String(normalAnalysis.duration_seconds % 60).padStart(2, '0'),
      agentScore: normalAnalysis.agent_score,
      handledWell: normalAnalysis.analysis.handled_well,
      gradientFrom: "from-blue-400",
      gradientTo: "to-cyan-500",
      sentimentBg: "bg-blue-50",
      sentimentText: "text-blue-600",
      sentimentBorder: "border-blue-200",
      barColor: "bg-blue-500"
    }
  ];

  const currentDemo = demos[selectedDemo];

  // Animate progress bars when demo changes
  useEffect(() => {
    setAnimatedScore(0);
    setAnimatedSentiment(0);

    const scoreInterval = setInterval(() => {
      setAnimatedScore(prev => {
        const target = currentDemo.agentScore;
        if (prev < target) {
          return Math.min(prev + 0.2, target);
        }
        clearInterval(scoreInterval);
        return target;
      });
    }, 20);

    const sentimentInterval = setInterval(() => {
      setAnimatedSentiment(prev => {
        const target = currentDemo.sentimentScore;
        if (prev < target) {
          return Math.min(prev + 2, target);
        }
        clearInterval(sentimentInterval);
        return target;
      });
    }, 20);

    return () => {
      clearInterval(scoreInterval);
      clearInterval(sentimentInterval);
    };
  }, [selectedDemo, currentDemo.agentScore, currentDemo.sentimentScore]);

  return (
    <section id="demo" className="py-32 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-gray-900">See AI Analysis</span>
            <br />
            <span className="bg-gradient-to-r from-orange-500 via-orange-400 to-blue-500 bg-clip-text text-transparent">
              In Action
            </span>
          </h2>
          <p className="text-xl text-gray-600">
            Real customer service calls analyzed in real-time
          </p>
        </motion.div>

        {/* Demo Selector */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {demos.map((demo, index) => (
            <button
              key={index}
              onClick={() => setSelectedDemo(index)}
              className={`px-6 py-3 rounded-full font-medium transition-all cursor-pointer hover:font-semibold ${
                selectedDemo === index
                  ? `bg-gradient-to-r ${demo.gradientFrom} ${demo.gradientTo} text-white shadow-lg`
                  : "bg-white border border-gray-200 text-gray-700 hover:border-gray-300"
              }`}
            >
              {demo.title}
            </button>
          ))}
        </div>

        {/* Demo Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Audio Player */}
          <motion.div
            key={selectedDemo}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl border border-gray-200 p-8 shadow-lg"
          >
            <h3 className="text-2xl font-bold mb-6 text-gray-900">Customer Call Audio</h3>

            {/* Sentiment Badge */}
            <div className="mb-6">
              <span className={`inline-block px-4 py-2 rounded-lg text-sm font-medium ${currentDemo.sentimentBg} ${currentDemo.sentimentText} border ${currentDemo.sentimentBorder}`}>
                Sentiment: {currentDemo.sentiment} ({currentDemo.sentimentScore}%)
              </span>
            </div>

            {/* Real Audio Player */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <p className="font-semibold text-gray-900 mb-3">{currentDemo.title}</p>
              <audio
                controls
                className="w-full mb-2"
                src={currentDemo.audioFile}
                preload="metadata"
              >
                Your browser does not support the audio element.
              </audio>
              <div className="flex justify-between text-xs text-gray-500">
                <span>30-second excerpt</span>
                <span>Full call: {currentDemo.duration}</span>
              </div>
            </div>

            {/* Agent Performance Score */}
            <div className="mb-6 bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-gray-700">Agent Performance</h4>
                <span className="text-2xl font-bold text-gray-900">{animatedScore.toFixed(1)}/10</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className={`h-2 ${currentDemo.barColor} rounded-full transition-all duration-300`}
                  style={{ width: `${animatedScore * 10}%` }}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${currentDemo.handledWell ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                  {currentDemo.handledWell ? '✓ Handled Well' : '⚠ Needs Improvement'}
                </span>
              </div>
            </div>

            {/* Detected Emotions */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Detected Emotions</h4>
              <div className="flex flex-wrap gap-2">
                {currentDemo.emotions.map((emotion, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-gray-100 border border-gray-200 rounded-full text-sm text-gray-700"
                  >
                    {emotion}
                  </span>
                ))}
              </div>
            </div>

            {/* Sentiment Bar */}
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Negative</span>
                <span>Neutral</span>
                <span>Positive</span>
              </div>
              <div className="relative w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`absolute h-3 ${currentDemo.barColor} rounded-full transition-all duration-300`}
                  style={{ width: `${animatedSentiment}%` }}
                ></div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Analysis */}
          <motion.div
            key={selectedDemo + "-analysis"}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl border border-gray-200 p-8 shadow-lg"
          >
            <h3 className="text-2xl font-bold mb-6 text-gray-900">AI Analysis Results</h3>

            {/* Summary */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Summary</h4>
              <p className="text-gray-600 leading-relaxed">
                <TypingText text={currentDemo.analysis.summary} speed={15} />
              </p>
            </div>

            {/* Key Points */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Key Points</h4>
              <ul className="space-y-2">
                <TypingList items={currentDemo.analysis.keyPoints} speed={10} delay={800} />
              </ul>
            </div>

            {/* Recommended Actions */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Recommended Actions</h4>
              <ul className="space-y-2">
                <TypingListRecommendations items={currentDemo.analysis.recommendations} speed={10} delay={800} />
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
