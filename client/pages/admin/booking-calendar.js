import React, { useState } from 'react';
import Head from 'next/head';
import Layout from '../../components/Layout';
import BookingCalendar from '../../components/admin/BookingGanttCalendar';
import { useAuth } from '../../contexts/AuthContext';
import { useBookingCalendar } from '../../contexts/BookingCalendarContext';
import { FaCalendarAlt, FaHome, FaFilter } from 'react-icons/fa';
import Link from 'next/link';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { isDevelopmentMode } from '../../lib/api';

const BookingCalendarPage = () => {
  const { user, isAuthenticated, isAdminOrManager } = useAuth();
  const { 
    bookings, 
    rooms, 
    dateRange, 
    loading, 
    error, 
    updateDateRange, 
    refreshData
  } = useBookingCalendar();

  // מצב מקומי
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // בדיקת הרשאות - במצב פיתוח תמיד מאפשר גישה
  const hasAccess = isDevelopmentMode() || (isAuthenticated && isAdminOrManager());

  if (!hasAccess) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-full">
          <div className="bg-red-50 border-r-4 border-red-500 p-4 rounded">
            <p className="text-xl text-red-500 font-medium">
              אין לך הרשאות לצפות בדף זה
            </p>
            <p className="text-sm text-red-400 mt-2">
              דף זה מיועד למנהלים ומנהלי קבלה בלבד
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  const formatDateRange = () => {
    if (!dateRange.start || !dateRange.end) return '';
    
    const startStr = format(dateRange.start, 'dd/MM/yyyy', { locale: he });
    const endStr = format(dateRange.end, 'dd/MM/yyyy', { locale: he });
    
    return `${startStr} - ${endStr}`;
  };

  return (
    <Layout>
      <Head>
        <title>לוח הזמנות | מערכת ניהול מלון</title>
        <meta name="description" content="לוח הזמנות ותצוגת לוח השנה למערכת ניהול מלון" />
      </Head>

      <div className="min-h-screen bg-gray-50 rtl">
        {/* ניווט משני */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center text-sm">
              <Link href="/admin" className="text-gray-500 hover:text-gray-700 flex items-center">
                <FaHome className="ml-1" /> דף הבית
              </Link>
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-blue-600 font-medium">לוח הזמנות</span>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          {/* כותרת ראשית */}
          <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center">
            <div className="mb-4 md:mb-0">
              <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                <FaCalendarAlt className="ml-2 text-blue-600" />
                לוח הזמנות
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {formatDateRange()}
              </p>
              {isDevelopmentMode() && (
                <p className="text-xs text-blue-500 mt-1">
                  מצב פיתוח: מציג נתוני הדגמה
                </p>
              )}
            </div>
            <div className="flex space-x-2 rtl:space-x-reverse">
              <button 
                onClick={refreshData}
                className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-lg flex items-center transition-colors"
              >
                <FaFilter className="ml-2" />
                רענן נתונים
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border-r-4 border-red-500 text-red-700 p-4 rounded mb-6" role="alert">
              <div className="flex">
                <div className="py-1">
                  <svg className="fill-current h-6 w-6 text-red-500 ml-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold">{error}</p>
                  <p className="text-sm">אנא נסה לרענן את הדף או פנה למנהל המערכת.</p>
                </div>
              </div>
            </div>
          )}

          {/* לוח גאנט */}
          <div className="bg-white shadow-custom rounded-lg overflow-hidden">
            <div className="p-4 md:p-6">
              {loading.bookings || loading.rooms ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <BookingCalendar 
                  bookings={bookings}
                  rooms={rooms}
                  dateRange={dateRange}
                  onDateRangeChange={updateDateRange}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BookingCalendarPage; 