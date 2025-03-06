/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  i18n: {
    // הגדרות אינטרנציונליזציה
    locales: ['he', 'en'],
    defaultLocale: 'he',
    localeDetection: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'hotel-management-system-server.onrender.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      // הוספת תמיכה בתמונות מכל מקור בסביבת ייצור
      {
        protocol: 'https',
        hostname: '**.vercel.app',
      }
    ],
    formats: ['image/avif', 'image/webp'],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  env: {
    // משתני סביבה שיהיו זמינים לקוד הלקוח
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://your-backend-url.com/api',
    NEXT_PUBLIC_HOTEL_NAME: 'רוטשילד 79',
    NEXT_PUBLIC_HOTEL_ADDRESS: 'רוטשילד 79, פתח תקווה',
  },
  async rewrites() {
    // בסביבת פיתוח, מפנה לשרת המקומי
    // בסביבת ייצור, מפנה לשרת ה-API החיצוני
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

    // הוספת טיפול מפורש בקבצי CSS
    config.module.rules.push({
      test: /\.css$/,
      use: ['style-loader', 'css-loader'],
    });

    return config;
  },
};

module.exports = nextConfig; 