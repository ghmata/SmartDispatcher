/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  env: {
    BUILD_TIMESTAMP: new Date().toISOString(),
  },
  output: 'export',
}

export default nextConfig
