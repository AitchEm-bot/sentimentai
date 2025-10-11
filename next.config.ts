import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  // Removed 'output: export' as it conflicts with middleware
  images: {
    unoptimized: true,
  },
};

export default withNextIntl(nextConfig);
