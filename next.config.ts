import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance optimizations for faster development
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    formats: ['image/webp', 'image/avif'],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Faster compilation
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Cache optimizations for development
  onDemandEntries: {
    maxInactiveAge: 25 * 1000, // 25 seconds
    pagesBufferLength: 2,
  },
  // Reduce compilation time
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{member}}',
    },
  },
  // Disable experimental features that can cause cache issues
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
