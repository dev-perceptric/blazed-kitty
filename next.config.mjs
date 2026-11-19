/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Small self-contained server for the Docker image.
  output: 'standalone',
  // Runs instrumentation.ts on start (keeps the AliExpress sign-in fresh).
  experimental: { instrumentationHook: true },
  // Product photos are resized to WebP on the server and cached for a year (see lib/img.ts).
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'pub-d9dce74a87164578ab89f22d84cb54f5.r2.dev' },
      { protocol: 'https', hostname: 'ae01.alicdn.com' },
    ],
    deviceSizes: [480, 768, 1080, 1600],
    imageSizes: [96, 160, 256],
    formats: ['image/webp'],
    minimumCacheTTL: 31536000,
  },
};

export default nextConfig;
