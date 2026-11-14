/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Small self-contained server for the Docker image.
  output: 'standalone',
};

export default nextConfig;
