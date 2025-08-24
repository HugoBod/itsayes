import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance optimizations
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-slot',
      '@radix-ui/react-progress',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-label',
      '@radix-ui/react-popover',
      '@radix-ui/react-slider'
    ],
  },
  
  // Turbopack configuration (updated format)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  
  // Reduce bundle size
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{ kebabCase member }}',
      preventFullImport: true,
    },
  },
};

export default nextConfig;
