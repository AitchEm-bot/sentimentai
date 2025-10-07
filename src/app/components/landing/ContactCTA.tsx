import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SendEmail } from "@/integrations/Core";
import { CheckCircle2, Send, XCircle } from "lucide-react";

export default function ContactCTA() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(false);

    try {
      const result = await SendEmail({
        name: formData.name,
        email: formData.email,
        company: formData.company,
        message: formData.message,
      });

      if (result.success) {
        setIsSubmitted(true);
        setFormData({ name: "", email: "", company: "", message: "" });
      } else {
        setSubmitError(true);
      }
    } catch (error) {
      console.error("Error sending email:", error);
      setSubmitError(true);
    }

    setIsSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section id="contact" className="py-32 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-100/20 via-transparent to-blue-100/20" />

      {/* Top CTA Banner */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 mb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-r from-orange-500 via-orange-400 to-blue-500 rounded-3xl p-12 text-center shadow-2xl"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Customer Service?
          </h2>
          <p className="text-xl text-white/90 mb-2">
            Join leading companies using AI to deliver exceptional customer experiences
          </p>
          <p className="text-lg text-white/80">
            Trusted by 500+ enterprises worldwide
          </p>
        </motion.div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-orange-500 to-blue-500 bg-clip-text text-transparent">
              Your Investment
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Schedule a meeting with our team to explore partnership opportunities
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl shadow-gray-200/50 border border-gray-100"
        >
          {isSubmitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold mb-4 text-gray-900">
                Thank You!
              </h3>
              <p className="text-lg text-gray-600 mb-8">
                We&apos;ll be in touch shortly to discuss how SentimentAI can help your business.
              </p>
              <Button
                onClick={() => setIsSubmitted(false)}
                className="bg-gradient-to-r from-orange-400 to-blue-500 text-white px-8 py-3 hover:from-orange-500 hover:to-blue-600"
              >
                Send Another Message
              </Button>
            </motion.div>
          ) : submitError ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-400 to-red-500 flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold mb-4 text-gray-900">
                Oops! Something Went Wrong
              </h3>
              <p className="text-lg text-gray-600 mb-4">
                We couldn&apos;t send your message right now.
              </p>
              <p className="text-md text-gray-500 mb-8">
                Please reach out directly at{" "}
                <a
                  href="mailto:sentimentAI1@outlook.com"
                  className="font-medium bg-gradient-to-r from-orange-500 to-blue-500 bg-clip-text text-transparent hover:from-orange-600 hover:to-blue-600"
                >
                  sentimentAI1@outlook.com
                </a>
              </p>
              <Button
                onClick={() => setSubmitError(false)}
                className="bg-gradient-to-r from-orange-400 to-blue-500 text-white px-8 py-3 hover:from-orange-500 hover:to-blue-600"
              >
                Try Again
              </Button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-700 font-medium">
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="John Smith"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-medium">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company" className="text-gray-700 font-medium">
                  Company Name *
                </Label>
                <Input
                  id="company"
                  name="company"
                  type="text"
                  placeholder="Your Company Inc."
                  value={formData.company}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-gray-700 font-medium">
                  Message *
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Tell us about your customer service challenges and investment interests..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-orange-400 to-blue-500 text-white py-4 text-lg font-semibold hover:from-orange-500 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  "Scheduling..."
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Schedule a Meeting
                  </>
                )}
              </Button>

              <p className="text-center text-sm text-gray-500">
                By submitting this form, you agree to our privacy policy and terms of service
              </p>
            </form>
          )}

          <div className="mt-8 pt-8 border-t border-gray-200 text-center">
            <p className="text-gray-600 mb-2">Prefer email?</p>
            <a
              href="mailto:sentimentAI1@outlook.com"
              className="text-lg font-medium bg-gradient-to-r from-orange-500 to-blue-500 bg-clip-text text-transparent hover:from-orange-600 hover:to-blue-600 cursor-pointer hover:font-semibold transition-all"
            >
              sentimentAI1@outlook.com
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
