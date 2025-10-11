"use client";

import React from "react";
import { Linkedin, Twitter, Mail } from "lucide-react";
import { useTranslations } from "next-intl";

export default function FooterIntl() {
  const t = useTranslations("footer");
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-blue-400 flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-2xl font-semibold text-white">{t("brandName")}</span>
            </div>
            <p className="text-gray-400 leading-relaxed max-w-md">
              {t("tagline")}
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-lg">{t("company")}</h3>
            <ul className="space-y-3 text-gray-400">
              <li>
                <a href="#" className="hover:text-white transition-all cursor-pointer hover:font-semibold">
                  {t("aboutUs")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-all cursor-pointer hover:font-semibold">
                  {t("careers")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-all cursor-pointer hover:font-semibold">
                  {t("pressKit")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-all cursor-pointer hover:font-semibold">
                  {t("blog")}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-lg">{t("legal")}</h3>
            <ul className="space-y-3 text-gray-400">
              <li>
                <a href="#" className="hover:text-white transition-all cursor-pointer hover:font-semibold">
                  {t("privacyPolicy")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-all cursor-pointer hover:font-semibold">
                  {t("termsOfService")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-all cursor-pointer hover:font-semibold">
                  {t("cookiePolicy")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-all cursor-pointer hover:font-semibold">
                  {t("security")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-400 text-sm">
            {t("copyright").replace("2024", String(currentYear))}
          </p>

          <div className="flex items-center gap-6">
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gradient-to-r hover:from-orange-500 hover:to-blue-500 flex items-center justify-center transition-all duration-300 cursor-pointer"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gradient-to-r hover:from-orange-500 hover:to-blue-500 flex items-center justify-center transition-all duration-300 cursor-pointer"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <a
              href="mailto:sentimentAI1@outlook.com"
              className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gradient-to-r hover:from-orange-500 hover:to-blue-500 flex items-center justify-center transition-all duration-300 cursor-pointer"
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}