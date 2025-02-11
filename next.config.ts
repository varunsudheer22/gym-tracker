/** @type {import('next').NextConfig} */
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
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        'localhost:3003',
        'gym-tracker-varunsudheer22.vercel.app',
        'gym-tracker-git-main-varunsudheer22.vercel.app'
      ],
    },
    esmExternals: 'loose',
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
};

module.exports = nextConfig;
