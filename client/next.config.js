/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  i18n: {
    // הגדרות אינטרנציונליזציה
    locales: ['he'],
    defaultLocale: 'he',
    // מחיקת השדה localeDetection שגורם לשגיאה
  },
  images: {
    // השימוש ב-domains מיושן, אבל נשאיר אותו כרגע לתאימות לאחור
    domains: ['localhost', 'placehold.co', 'vercel.app', 'images.unsplash.com'],
    // השימוש המומלץ הוא remotePatterns
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'vercel.app',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    // הסרנו את dangerouslyAllowSVG ו-contentSecurityPolicy שגורמים לשגיאה
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
};

module.exports = nextConfig; 