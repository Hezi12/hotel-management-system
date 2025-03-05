import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import BookingSearchForm from '../components/BookingSearchForm';
import { 
  FaMapMarkerAlt, 
  FaWhatsapp, 
  FaPhone, 
  FaRegMoneyBillAlt, 
  FaBroom, 
  FaCity,
  FaWifi,
  FaCalendarCheck,
  FaSmile,
  FaBed
} from 'react-icons/fa';
import Image from 'next/image';

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const phoneNumber = "0506070260";

  const amenities = [
    { icon: <FaWifi />, text: "Wi-Fi חינם" },
    { icon: <FaBed />, text: "מיטות נוחות" },
    { icon: <FaBroom />, text: "ניקיון יומי" },
    { icon: <FaCalendarCheck />, text: "הזמנה מיידית" }
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Layout hideFooter scrolled={scrolled}>
      <Head>
        <title>רוטשילד 79 - מלון חדרים במרכז פתח תקווה</title>
        <meta name="description" content="מלון חדרים ברוטשילד 79, פתח תקווה" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex-grow">
        {/* Hero Section - מינימליסטי */}
        <section className="bg-slate-50 py-24">
          <div className="container mx-auto px-4 md:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col items-center text-center mb-12">
                <h1 className="text-5xl md:text-6xl font-light text-slate-800 mb-6">רוטשילד 79</h1>
                <div className="h-px w-16 bg-primary-500 mb-6"></div>
                <p className="text-xl md:text-2xl font-light text-slate-600 mb-8 max-w-2xl">
                  מלון חדרים אלגנטי במרכז פתח תקווה
                </p>
                <div className="flex items-center text-sm text-slate-500 mb-10">
                  <FaMapMarkerAlt className="ml-1" />
                  <Link
                    href="https://www.google.com/maps/search/?api=1&query=רוטשילד+79+פתח+תקווה"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary-600 transition-colors"
                  >
                    רוטשילד 79, פתח תקווה
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* חיפוש והזמנה */}
        <section className="py-16 bg-white border-t border-b border-slate-100">
          <div className="container mx-auto px-4 md:px-8">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-light text-slate-800 mb-8 text-center">בדיקת זמינות וביצוע הזמנה</h2>
              <BookingSearchForm />
              
              <div className="mt-10 flex flex-col md:flex-row items-center justify-center gap-4">
                <Link
                  href={`tel:${phoneNumber}`}
                  className="w-full md:w-auto inline-flex items-center justify-center text-primary-600 hover:text-primary-700 border border-primary-600 hover:border-primary-700 transition-colors py-3 px-6 rounded-none"
                >
                  <FaPhone className="ml-2" />
                  <span>צור קשר טלפוני: {phoneNumber}</span>
                </Link>
                <Link
                  href={`https://wa.me/972${phoneNumber.substring(1)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full md:w-auto inline-flex items-center justify-center bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-none"
                >
                  <FaWhatsapp className="ml-2" />
                  <span>שלח הודעת וואטסאפ</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* אמניטיז */}
        <section className="py-16 bg-slate-50">
          <div className="container mx-auto px-4 md:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {amenities.map((item, index) => (
                <div key={index} className="flex flex-col items-center text-center p-6">
                  <div className="text-primary-500 text-2xl mb-3">{item.icon}</div>
                  <div className="text-slate-700">{item.text}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* חדרים */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 md:px-8">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-light text-slate-800 mb-3 text-center">החדרים שלנו</h2>
              <p className="text-center text-slate-600 mb-10 max-w-2xl mx-auto">חדרים מעוצבים בסגנון מינימליסטי ונוח, מאובזרים בכל מה שצריך לשהייה מושלמת</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-50 aspect-video relative overflow-hidden group">
                  <div className="absolute inset-0">
                    <Image 
                      src="https://placehold.co/800x600/e0e0e0/939393?text=חדר+זוגי"
                      alt="חדר זוגי"
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-white/90 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform">
                    <h3 className="font-medium text-slate-900 mb-1">חדר זוגי</h3>
                    <p className="text-sm text-slate-600">חדר מרווח עם מיטה זוגית ומקלחת פרטית</p>
                  </div>
                </div>
                <div className="bg-slate-50 aspect-video relative overflow-hidden group">
                  <div className="absolute inset-0">
                    <Image 
                      src="https://placehold.co/800x600/e0e0e0/939393?text=סוויטה+משפחתית"
                      alt="סוויטה משפחתית"
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-white/90 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform">
                    <h3 className="font-medium text-slate-900 mb-1">סוויטה משפחתית</h3>
                    <p className="text-sm text-slate-600">חדר מרווח עם מיטה זוגית, ספה נפתחת ומקלחת פרטית</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* יתרונות המיקום */}
        <section className="py-16 bg-slate-50">
          <div className="container mx-auto px-4 md:px-8">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-light text-slate-800 mb-3 text-center">המיקום שלנו</h2>
              <p className="text-center text-slate-600 mb-10 max-w-2xl mx-auto">
                ממוקם במרכז פתח תקווה, מרחק הליכה קצר מכל האטרקציות המרכזיות ואמצעי התחבורה
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-6 border border-slate-200 bg-white">
                  <div className="flex items-center mb-3">
                    <FaCity className="text-primary-500 ml-2" />
                    <h3 className="font-medium text-slate-800">מיקום מרכזי</h3>
                  </div>
                  <p className="text-slate-600 text-sm">
                    במרכז העיר, קרוב לחנויות, מסעדות ואטרקציות
                  </p>
                </div>
                <div className="p-6 border border-slate-200 bg-white">
                  <div className="flex items-center mb-3">
                    <FaRegMoneyBillAlt className="text-primary-500 ml-2" />
                    <h3 className="font-medium text-slate-800">שווה לכסף</h3>
                  </div>
                  <p className="text-slate-600 text-sm">
                    איכות גבוהה במחיר הוגן ללא תוספות מיותרות
                  </p>
                </div>
                <div className="p-6 border border-slate-200 bg-white">
                  <div className="flex items-center mb-3">
                    <FaSmile className="text-primary-500 ml-2" />
                    <h3 className="font-medium text-slate-800">יחס אישי</h3>
                  </div>
                  <p className="text-slate-600 text-sm">
                    צוות אדיב ומקצועי שדואג לכל הצרכים שלכם
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 md:px-8">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl font-light text-slate-800 mb-6">מחכים לכם ברוטשילד 79</h2>
              <Link
                href="#booking"
                className="inline-block bg-primary-600 hover:bg-primary-700 text-white py-3 px-8 transition-colors"
              >
                להזמנת חדר
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      {/* פתרון לחלון הצ'אט */}
      <style jsx global>{`
        .chat-widget {
          z-index: 100;
        }
      `}</style>
    </Layout>
  );
}