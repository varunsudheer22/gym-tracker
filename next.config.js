/** @type {import('next').NextConfig} */

// Next.js configuration for Vercel deployment
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    serverActions: true,
    esmExternals: 'loose'
  },
  // Disable powered by header
  poweredByHeader: false,
  // Enable strict mode for better development
  reactStrictMode: true,
  // Customize headers for security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig 