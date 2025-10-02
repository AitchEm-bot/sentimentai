import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, Users, DollarSign, Shield, Clock, BarChart3 } from "lucide-react";

export default function Benefits() {
  const benefits = [
    {
      icon: TrendingUp,
      title: "35% Improvement",
      subtitle: "in Customer Satisfaction",
      description: "Early detection of negative sentiment enables proactive service recovery",
    },
    {
      icon: DollarSign,
      title: "2.5x ROI",
      subtitle: "Within First Year",
      description: "Reduced churn and increased retention translate to significant revenue growth",
    },
    {
      icon: Clock,
      title: "40% Faster",
      subtitle: "Issue Resolution",
      description: "Real-time insights help agents address concerns before they escalate",
    },
    {
      icon: Users,
      title: "89% Agent",
      subtitle: "Satisfaction Rate",
      description: "AI assistance reduces stress and improves agent performance and morale",
    },
    {
      icon: Shield,
      title: "99.9% Uptime",
      subtitle: "Enterprise Reliability",
      description: "Built for scale with redundancy and failover mechanisms",
    },
    {
      icon: BarChart3,
      title: "Deep Analytics",
      subtitle: "Actionable Insights",
      description: "Comprehensive dashboards reveal trends and opportunities for improvement",
    },
  ];

  return (
    <section id="benefits" className="py-32 bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-orange-50/30 via-transparent to-blue-50/30" />

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
              Proven Results
            </span>
            <br />
            <span className="bg-gradient-to-r from-orange-500 to-blue-500 bg-clip-text text-transparent">
              Measurable Impact
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
            Data-driven insights that transform customer service operations
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="group relative"
            >
              <div className="h-full p-8 bg-white rounded-2xl border border-gray-100 shadow-lg shadow-gray-100/50 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-500 hover:-translate-y-1">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-blue-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
                    <benefit.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">
                      {benefit.title}
                    </h3>
                    <p className="text-orange-500 font-semibold text-sm">
                      {benefit.subtitle}
                    </p>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
