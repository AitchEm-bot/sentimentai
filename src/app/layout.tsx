import type { Metadata } from "next";
import { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "SentimentAI",
  description: "Real-time sentiment analysis for customer service calls.",
};

type Props = {
  children: ReactNode;
};

// Root layout just passes through to locale layouts
// The actual HTML structure is handled in [locale]/layout.tsx
export default function RootLayout({ children }: Props) {
  return children;
}
