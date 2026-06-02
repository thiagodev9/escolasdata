/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'api.dicebear.com' },
    ],
  },
  webpack: (config, { dev }) => {
    if (dev) {
      // Polling para resolver problema com OneDrive / paths com espaço
      config.watchOptions = {
        poll: 800,
        aggregateTimeout: 400,
      }
    }
    return config
  },
}

export default nextConfig
