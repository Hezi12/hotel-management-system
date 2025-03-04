/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  i18n: {
    // תמיכה בעברית ואנגלית
    locales: ['he', 'en'],
    defaultLocale: 'he',
    localeDetection: true,
  },
  images: {
    domains: ['localhost', 'placehold.co', 'vercel.app'], // תחומים מורשים לתמונות
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: '**.vercel.app',
      },
    ],
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
        destination: process.env.VERCEL
          ? '/api/:path*'  // בסביבת Vercel, מפנה לפונקציית ה-API שלנו
          : 'http://localhost:5001/api/:path*', // בסביבת פיתוח, מפנה לשרת המקומי
      },
    ];
  },
  webpack(config) {
    // תמיכה ב-SVG כקומפוננטות
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"]
    });

    return config;
  },
  // הוספת אפשרות להציג תמונות SVG
  dangerouslyAllowSVG: true,
  // מאפשר להציג תמונות מאתר placehold.co ומאפשר חיבור ל-localhost:5001
  contentSecurityPolicy: "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src * 'self' data: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self'; frame-src 'self'",
};

module.exports = nextConfig; 