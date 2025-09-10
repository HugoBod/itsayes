import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '54321',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'oaidalleapiprodscus.blob.core.windows.net',
        pathname: '/**',
      },
    ],
    // Configure allowed quality values to prevent warnings
    qualities: [60, 75, 90, 95, 100],
  },
  // Enable optimizePackageImports and scroll restoration
  experimental: {
    optimizePackageImports: ['lucide-react'],
    scrollRestoration: true,
  },
};

export default nextConfig;
