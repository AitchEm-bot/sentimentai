"use client";

import React from "react";
import Navigation from "./components/landing/Navigation";
import Hero from "./components/landing/Hero";
import ValueProposition from "./components/landing/ValueProposition";
import DemoShowcase from "./components/landing/DemoShowcase";
import Benefits from "./components/landing/Benefits";
import ContactCTA from "./components/landing/ContactCTA";
import Footer from "./components/landing/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <Hero />
      <ValueProposition />
      <DemoShowcase />
      <Benefits />
      <ContactCTA />
      <Footer />
    </div>
  );
}