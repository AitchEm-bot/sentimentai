import React, { useState } from "react";
import { motion } from "framer-motion";
import { Play, Volume2 } from "lucide-react";

export default function DemoShowcase() {
  const [selectedDemo, setSelectedDemo] = useState(0);

  const demos = [
    {
      title: "Frustrated Customer - Product Issue",
      sentiment: "Negative",
      sentimentScore: 25,
      emotions: ["Frustration", "Disappointment", "Urgency"],
      analysis: {
        summary: "Customer expressing strong dissatisfaction with product malfunction. Tone indicates high frustration and urgency for resolution.",
        keyPoints: [
          "Product stopped working after 2 weeks",
          "Previous support interactions were unhelpful",
          "Customer considering switching to competitor",
          "Emotional state: Highly frustrated but seeking solution"
        ],
        recommendations: [
          "Escalate to senior support immediately",
          "Offer expedited replacement",
          "Provide discount on next purchase as goodwill gesture"
        ]
      },
      gradientFrom: "from-orange-400",
      gradientTo: "to-orange-600",
      sentimentBg: "bg-red-50",
      sentimentText: "text-red-600",
      sentimentBorder: "border-red-200",
      barColor: "bg-red-500"
    },
    {
      title: "Satisfied Customer - Service Praise",
      sentiment: "Positive",
      sentimentScore: 92,
      emotions: ["Gratitude", "Satisfaction", "Trust"],
      analysis: {
        summary: "Customer expressing appreciation for excellent service. Positive tone throughout with high satisfaction indicators.",
        keyPoints: [
          "Issue resolved quickly and professionally",
          "Agent was patient and knowledgeable",
          "Customer feels valued and heard",
          "Emotional state: Very satisfied and loyal"
        ],
        recommendations: [
          "Request customer testimonial",
          "Recognize agent for excellent service",
          "Consider customer for loyalty program"
        ]
      },
      gradientFrom: "from-orange-400",
      gradientTo: "to-blue-500",
      sentimentBg: "bg-green-50",
      sentimentText: "text-green-600",
      sentimentBorder: "border-green-200",
      barColor: "bg-green-500"
    },
    {
      title: "Neutral Inquiry - Billing Question",
      sentiment: "Neutral",
      sentimentScore: 58,
      emotions: ["Curiosity", "Patience", "Professionalism"],
      analysis: {
        summary: "Standard billing inquiry with neutral emotional tone. Customer is patient and seeking information.",
        keyPoints: [
          "Simple question about billing cycle",
          "Customer is calm and cooperative",
          "No signs of dissatisfaction",
          "Emotional state: Neutral, information-seeking"
        ],
        recommendations: [
          "Provide clear, detailed explanation",
          "Share billing documentation",
          "Offer to set up billing reminders"
        ]
      },
      gradientFrom: "from-orange-400",
      gradientTo: "to-blue-500",
      sentimentBg: "bg-blue-50",
      sentimentText: "text-blue-600",
      sentimentBorder: "border-blue-200",
      barColor: "bg-blue-500"
    }
  ];

  const currentDemo = demos[selectedDemo];

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

            {/* Audio Player Mockup */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-4 mb-4">
                <button className={`w-16 h-16 rounded-full bg-gradient-to-br ${currentDemo.gradientFrom} ${currentDemo.gradientTo} flex items-center justify-center shadow-lg hover:scale-105 transition-transform cursor-pointer`}>
                  <Play className="w-6 h-6 text-white ml-1" />
                </button>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 mb-2">{currentDemo.title}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-orange-400 to-blue-500 h-2 rounded-full" style={{ width: "0%" }}></div>
                  </div>
                </div>
                <Volume2 className="w-6 h-6 text-gray-400" />
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
                  className={`absolute h-3 ${currentDemo.barColor} rounded-full transition-all duration-500`}
                  style={{ width: `${currentDemo.sentimentScore}%` }}
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
              <p className="text-gray-600 leading-relaxed">{currentDemo.analysis.summary}</p>
            </div>

            {/* Key Points */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Key Points</h4>
              <ul className="space-y-2">
                {currentDemo.analysis.keyPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span className="text-gray-600 text-sm">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommended Actions */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Recommended Actions</h4>
              <ul className="space-y-2">
                {currentDemo.analysis.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span className="text-gray-600 text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
