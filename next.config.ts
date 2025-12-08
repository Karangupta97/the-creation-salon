import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,

  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
  },

  // Exclude logger dependencies from Turbopack bundling
  serverExternalPackages: ['pino', 'pino-pretty', 'thread-stream'],

  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
