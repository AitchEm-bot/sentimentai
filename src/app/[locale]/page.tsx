"use client";

import React from "react";
import NavigationIntl from "../components/landing/NavigationIntl";
import HeroIntl from "../components/landing/HeroIntl";
import ValuePropositionIntl from "../components/landing/ValuePropositionIntl";
import DemoShowcaseIntl from "../components/landing/DemoShowcaseIntl";
import BenefitsIntl from "../components/landing/BenefitsIntl";
import ContactCTAIntl from "../components/landing/ContactCTAIntl";
import FooterIntl from "../components/landing/FooterIntl";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <NavigationIntl />
      <HeroIntl />
      <ValuePropositionIntl />
      <DemoShowcaseIntl />
      <BenefitsIntl />
      <ContactCTAIntl />
      <FooterIntl />
    </div>
  );
}