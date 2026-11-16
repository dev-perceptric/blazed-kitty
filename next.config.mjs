/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Small self-contained server for the Docker image.
  output: 'standalone',
  // Runs instrumentation.ts on start (keeps the AliExpress sign-in fresh).
  experimental: { instrumentationHook: true },
};

export default nextConfig;
