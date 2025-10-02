import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SentimentAI - Transform Customer Service with AI",
  description: "Real-time sentiment analysis for customer service calls. Powered by advanced AI. Built for scale.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased"
        style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
      >
        {children}
      </body>
    </html>
  );
}
