import { useState, useEffect } from 'react';
import BookingSearchForm from '../components/BookingSearchForm';
import Layout from '../components/Layout';
import Head from 'next/head';
import Link from 'next/link';
import { FaPhone, FaWhatsapp, FaMapMarkerAlt, FaComments } from 'react-icons/fa';
import Image from 'next/image';

const phoneNumber = "0506070260";

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
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
        <title>רוטשילד 79 - חדרים להשכרה בפתח תקווה</title>
        <meta 
          name="description" 
          content="חדרים להשכרה במיקום מעולה ברוטשילד פתח תקווה." 
        />
      </Head>

      <main className="min-h-screen flex flex-col bg-slate-50">
        <div className="flex-grow flex items-center justify-center p-4">
          <div className="w-full max-w-3xl mx-auto">
            <div className="bg-white rounded-md shadow-sm overflow-hidden">
              <div className="p-6 md:p-8">
                <h1 className="text-2xl font-medium text-slate-800 mb-1">רוטשילד 79</h1>
                <p className="text-slate-500 mb-2">חדרים להשכרה במרכז פתח תקווה</p>
                
                {/* כפתורי יצירת קשר קטנים */}
                <div className="flex gap-2 mb-4">
                  <Link
                    href={`https://wa.me/972${phoneNumber.substring(1)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1.5 text-sm bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg shadow-sm transition-all"
                  >
                    <FaWhatsapp className="ml-1.5 text-xs" />
                    <span>וואטסאפ</span>
                  </Link>
                  <Link
                    href={`tel:${phoneNumber}`}
                    className="inline-flex items-center px-3 py-1.5 text-sm bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg shadow-sm transition-all"
                  >
                    <FaPhone className="ml-1.5 text-xs" />
                    <span>{phoneNumber}</span>
                  </Link>
                </div>
                
                <div className="border-t border-slate-100 my-4"></div>
                
                <div className="mb-8">
                  <BookingSearchForm />
                </div>
                
                {/* מפת גוגל */}
                <div className="border-t border-slate-100 py-6 mb-4">
                  <div className="flex items-center mb-2">
                    <FaMapMarkerAlt className="text-slate-400 ml-2" />
                    <h3 className="text-sm font-medium text-slate-600">המיקום שלנו</h3>
                  </div>
                  <div className="rounded-md overflow-hidden h-44 relative bg-slate-100">
                    <iframe 
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3380.636822430453!2d34.88659!3d32.09105!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x151d4a453ed98cb1%3A0xf7ac36318a2558d5!2z16jXldeY16nXmdeZ15zXkyA3OSwg16TXqteXINeq16fXldeV15Q!5e0!3m2!1siw!2sil!4v1715023454321!5m2!1siw!2sil&markers=color:red%7C32.09105,34.88659" 
                      width="100%" 
                      height="100%" 
                      style={{ border: 0 }} 
                      allowFullScreen="" 
                      loading="lazy" 
                      referrerPolicy="no-referrer-when-downgrade"
                      title="מפת המיקום"
                    ></iframe>
                  </div>
                </div>
                
                <div className="border-t border-slate-100 pt-6">
                  <div className="flex flex-col sm:flex-row justify-between items-center">
                    <div className="mb-3 sm:mb-0">
                      <p className="text-slate-500 text-sm">צריכים עזרה? צרו קשר:</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-slate-700 text-sm">
                        <span className="font-medium">טלפון: </span>
                        <Link href={`tel:${phoneNumber}`} className="text-blue-600 hover:underline">
                          {phoneNumber}
                        </Link>
                      </p>
                      <span className="text-slate-300">|</span>
                      <p className="text-slate-700 text-sm">
                        <span className="font-medium">דוא"ל: </span>
                        <Link href="mailto:diamshotels@gmail.com" className="text-blue-600 hover:underline">
                          diamshotels@gmail.com
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-sm text-slate-500">
                מיקום: רוטשילד 79, פתח תקווה
              </p>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
} 