import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import VirtualChat from '../components/VirtualChat';
import Link from 'next/link';
import { FaArrowRight } from 'react-icons/fa';

export default function Chat() {
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
    <Layout scrolled={scrolled}>
      <Head>
        <title>צ׳אט עם נציג | רוטשילד 79</title>
        <meta 
          name="description" 
          content="צ׳אט עם נציג וירטואלי במלון רוטשילד 79. קבלו מענה מיידי לשאלות נפוצות." 
        />
      </Head>
      
      <main className="min-h-screen bg-slate-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="mb-4">
              <Link href="/" className="inline-flex items-center text-slate-600 hover:text-slate-800 text-sm">
                <FaArrowRight className="ml-1 text-xs" />
                <span>חזרה לדף הבית</span>
              </Link>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 md:p-8">
                <h1 className="text-2xl font-medium text-slate-800 mb-2">צ׳אט עם נציג וירטואלי</h1>
                <p className="text-slate-500 mb-6">קבלו תשובות מיידיות לשאלות נפוצות או פנו אלינו בווטסאפ לשאלות מורכבות יותר</p>
                
                <div className="bg-slate-50 p-6 rounded-xl mb-8 border border-slate-100">
                  <h2 className="text-lg font-medium text-slate-700 mb-3">מידע שימושי</h2>
                  
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="bg-white p-4 rounded-lg border border-slate-100">
                      <h3 className="font-medium text-slate-800 mb-2">כתובת וגישה</h3>
                      <p className="text-slate-600 mb-1">רחוב רוטשילד 79, פתח תקווה, מיקוד 4937079</p>
                      <p className="text-slate-600">5 דקות הליכה ממרכז העיר, 10 דקות נסיעה מתחנת הרכבת קריית אריה</p>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border border-slate-100">
                      <h3 className="font-medium text-slate-800 mb-2">שעות קבלה</h3>
                      <p className="text-slate-600 mb-1">צ׳ק אין: 14:00-22:00</p>
                      <p className="text-slate-600">צ׳ק אאוט: עד 11:00 בבוקר</p>
                    </div>
                  </div>
                </div>
                
                {/* כאן נמצא צ'אט */}
                <div className="bg-white border border-slate-100 rounded-xl shadow-sm h-[500px] flex items-center justify-center">
                  <div className="w-full h-full max-w-lg mx-auto">
                    <VirtualChat />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
} 