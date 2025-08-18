/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  // Configure o Next.js para encontrar o app directory
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  webpack: (config) => {
    return config;
  },
}

export default nextConfig