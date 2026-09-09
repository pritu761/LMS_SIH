/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'commondatastorage.googleapis.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  rewrites: async () => [
    {
      source: '/courses',
      destination: '/trainee/courses',
    },
    {
      source: '/courses/:id',
      destination: '/trainee/courses/:id',
    },
  ],
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        // Report-only while interactive map/video embeds require broad
        // sources: violations are logged (see /api/security/csp-report)
        // without breaking tiles, YouTube lessons or Next.js runtime.
        // HSTS is served by the hosting platform (Vercel) on HTTPS.
        {
          key: 'Content-Security-Policy-Report-Only',
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            'font-src \'self\' https://fonts.gstatic.com data:',
            'img-src \'self\' data: blob: https:',
            'media-src \'self\' https: blob:',
            'connect-src \'self\' https: wss:',
            'frame-src \'self\' https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com',
            "worker-src 'self' blob:",
            'report-uri /api/security/csp-report',
          ].join('; '),
        },
      ],
    },
  ],
};

export default nextConfig;
