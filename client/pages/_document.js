import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html dir="rtl" lang="he" className="h-full">
      <Head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content="מערכת ניהול מלון - דמו" />
        <meta name="keywords" content="מלון, הזמנה, חדרים, נופש" />
        
        {/* הגדרות אבטחה */}
        <meta httpEquiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://hotel-management-system-server.onrender.com http://localhost:5001;" />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        
        {/* הוספת הגופנים דרך Document במקום ב-Head */}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700&display=swap" />
      </Head>
      <body className="font-heebo bg-gray-50 text-gray-900 h-full">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
} 