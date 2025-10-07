import React from "react";
import { motion } from "framer-motion";
import { Brain, TrendingUp, Zap } from "lucide-react";

export default function ValueProposition() {
  const features = [
    {
      icon: Brain,
      title: "Advanced AI Models",
      description: "State-of-the-art natural language processing trained on millions of customer interactions",
      gradient: "from-orange-400 to-orange-500",
    },
    {
      icon: TrendingUp,
      title: "Real-Time Insights",
      description: "Instant sentiment analysis during live calls, enabling immediate service improvements",
      gradient: "from-blue-400 to-blue-500",
    },
    {
      icon: Zap,
      title: "Scalable Solution",
      description: "Built to handle thousands of concurrent calls with enterprise-grade reliability",
      gradient: "from-purple-400 to-purple-500",
    },
  ];

  return (
    <section className="py-32 bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/30 via-transparent to-orange-50/30" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Why Leading Companies
            </span>
            <br />
            <span className="bg-gradient-to-r from-orange-500 to-blue-500 bg-clip-text text-transparent">
              Choose SentimentAI
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
            Cutting-edge technology meets exceptional business value
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="group h-full"
            >
              <div className="relative h-full p-8 bg-white rounded-3xl border border-gray-100 shadow-lg shadow-gray-100/50 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-500 hover:-translate-y-2 flex flex-col">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative flex flex-col flex-1">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} shadow-lg mb-6 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-500`}
                  >
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold mb-4 text-gray-900">
                    {feature.title}
                  </h3>

                  <p className="text-gray-600 leading-relaxed flex-1">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}