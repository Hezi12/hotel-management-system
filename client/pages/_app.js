import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import '../styles/globals.css';
import Layout from '../components/Layout';
import { AuthProvider } from '../contexts/AuthContext';
import { BookingProvider } from '../contexts/BookingContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'react-datepicker/dist/react-datepicker.css';
import VirtualChat from '../components/VirtualChat';
import { BookingCalendarProvider } from '../contexts/BookingCalendarContext';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  
  // כיוון RTL לעברית
  useEffect(() => {
    document.documentElement.dir = router.locale === 'en' ? 'ltr' : 'rtl';
    document.documentElement.lang = router.locale || 'he';
  }, [router.locale]);
  
  // בדיקה אם הרכיב מבקש layout אישי
  const getLayout = Component.getLayout || ((page) => <Layout>{page}</Layout>);
  
  return (
    <AuthProvider>
      <BookingProvider>
        <BookingCalendarProvider>
          <Layout>
            <Head>
              <meta name="viewport" content="width=device-width, initial-scale=1" />
              <meta charSet="utf-8" />
              <link rel="preconnect" href="https://fonts.googleapis.com" />
              <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
              <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
              {/* טייטל דיפולטיבי, יוחלף בדפים ספציפיים */}
              <title>רוטשילד 79 | פתח תקווה</title>
              <meta name="description" content="מערכת הזמנת חדרים ברוטשילד 79 - מערכת בטוחה ונוחה להזמנת חדרים" />
              <meta name="theme-color" content="#4338ca" />
              <meta property="og:type" content="website" />
              <meta property="og:url" content="https://rothschild79.com" />
              <meta property="og:title" content="רוטשילד 79 - מערכת הזמנת חדרים" />
              <meta property="og:description" content="הזמינו חדר במלון רוטשילד 79" />
              <meta name="application-name" content="מערכת ניהול מלון" />
              <meta name="apple-mobile-web-app-capable" content="yes" />
              <meta name="apple-mobile-web-app-status-bar-style" content="default" />
              <meta name="apple-mobile-web-app-title" content="מערכת ניהול מלון" />
              <meta name="format-detection" content="telephone=no" />
              <meta name="mobile-web-app-capable" content="yes" />
              
              {/* עבור עמוד התשלום, הוספת מידע אבטחתי */}
              {router.pathname === '/booking' && (
                <>
                  <meta name="robots" content="noindex, nofollow" />
                  <meta httpEquiv="Content-Security-Policy" content="upgrade-insecure-requests" />
                </>
              )}
            </Head>
            
            <Component {...pageProps} />
          </Layout>
          <ToastContainer
            position="bottom-left"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={router.locale !== 'en'}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
          <VirtualChat />
        </BookingCalendarProvider>
      </BookingProvider>
    </AuthProvider>
  );
}

export default MyApp; 