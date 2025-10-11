"use client";

import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, Users, DollarSign, Shield, Clock, BarChart3 } from "lucide-react";
import { useTranslations } from "next-intl";

export default function BenefitsIntl() {
  const t = useTranslations("benefits");

  const benefits = [
    {
      icon: TrendingUp,
      title: t("cards.improvement.title"),
      subtitle: t("cards.improvement.subtitle"),
      description: t("cards.improvement.description"),
    },
    {
      icon: DollarSign,
      title: t("cards.roi.title"),
      subtitle: t("cards.roi.subtitle"),
      description: t("cards.roi.description"),
    },
    {
      icon: Clock,
      title: t("cards.faster.title"),
      subtitle: t("cards.faster.subtitle"),
      description: t("cards.faster.description"),
    },
    {
      icon: Users,
      title: t("cards.agent.title"),
      subtitle: t("cards.agent.subtitle"),
      description: t("cards.agent.description"),
    },
    {
      icon: Shield,
      title: t("cards.uptime.title"),
      subtitle: t("cards.uptime.subtitle"),
      description: t("cards.uptime.description"),
    },
    {
      icon: BarChart3,
      title: t("cards.analytics.title"),
      subtitle: t("cards.analytics.subtitle"),
      description: t("cards.analytics.description"),
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
              {t("titlePart1")}
            </span>
            <br />
            <span className="bg-gradient-to-r from-orange-500 to-blue-500 bg-clip-text text-transparent">
              {t("titlePart2")}
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
            {t("subtitle")}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
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