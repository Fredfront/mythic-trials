/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
      {
        protocol: 'https',
        hostname: 'render.worldofwarcraft.com',
      },
      {
        protocol: 'https',
        hostname: 'eu.battle.net',
      },
    ],
  },
}

export default nextConfig
