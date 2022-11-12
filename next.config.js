/** @type {import('next').NextConfig} */
const nextConfig = {
  // TODO enable typescript build errors
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
  },
}

module.exports = nextConfig
