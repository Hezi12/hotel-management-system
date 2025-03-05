/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  i18n: {
    // הגדרות אינטרנציונליזציה
    locales: ['he'],
    defaultLocale: 'he',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: '**',
      }
    ],
    formats: ['image/avif', 'image/webp'],
  },
  env: {
    // משתני סביבה שיהיו זמינים לקוד הלקוח
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '/api',
    NEXT_PUBLIC_HOTEL_NAME: 'רוטשילד 79',
    NEXT_PUBLIC_HOTEL_ADDRESS: 'רוטשילד 79, פתח תקווה',
  },
  async rewrites() {
    // בסביבת פיתוח, מפנה לשרת המקומי
    // בסביבת ייצור, מפנה ל-API של Vercel
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/:path*',
      },
    ];
  },
  webpack(config) {
    // תמיכה ב-SVG כקומפוננטות
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
};

module.exports = nextConfig; 