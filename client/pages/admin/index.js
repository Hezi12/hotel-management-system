import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { HiOutlineOfficeBuilding, HiOutlineCalendar, HiOutlineCash, HiOutlineChartBar, HiOutlineViewGrid, HiOutlineDocumentReport, HiOutlineUsers, HiOutlineHome, HiOutlineBookOpen, HiTrash } from 'react-icons/hi';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const router = useRouter();
  const { isAuthenticated, isAdminOrManager, loading } = useAuth();
  const [stats, setStats] = useState({
    rooms: 0,
    activeBookings: 0,
    pendingBookings: 0,
    monthlyRevenue: 0
  });

  // במצב דמו - ללא בדיקת הרשאות
  // useEffect(() => {
  //   if (!loading && !isAuthenticated) {
  //     router.push('/login?redirect=/admin');
  //     return;
  //   }

  //   if (!loading && isAuthenticated && !isAdminOrManager()) {
  //     router.push('/');
  //     return;
  //   }
  // }, [isAuthenticated, loading, router, isAdminOrManager]);

  // לדוגמה בלבד - בפרויקט אמיתי היינו מביאים את הנתונים מהשרת
  useEffect(() => {
    // סימולציה של טעינת נתונים
    setTimeout(() => {
      setStats({
        rooms: 7,
        activeBookings: 4,
        pendingBookings: 2,
        monthlyRevenue: 12500
      });
    }, 1000);
  }, []);

  // אם בטעינה, הצג לוודר
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen rtl">
      <Head>
        <title>דאשבורד ניהול | מלונית רוטשילד</title>
      </Head>

      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-primary-800">דאשבורד ניהול</h1>
          <Link href="/" className="bg-accent hover:bg-accent-dark text-white px-4 py-2 rounded-md">
            חזרה לאתר
          </Link>
        </div>

        {/* כרטיסי סטטיסטיקה */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-custom">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">חדרים</p>
                <h3 className="text-3xl font-bold">{stats.rooms}</h3>
              </div>
              <div className="bg-primary-100 p-3 rounded-full text-primary-600">
                <HiOutlineOfficeBuilding className="text-2xl" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-custom">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">הזמנות פעילות</p>
                <h3 className="text-3xl font-bold">{stats.activeBookings}</h3>
              </div>
              <div className="bg-accent-light/20 p-3 rounded-full text-accent">
                <HiOutlineCalendar className="text-2xl" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-custom">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">הזמנות בהמתנה</p>
                <h3 className="text-3xl font-bold">{stats.pendingBookings}</h3>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full text-yellow-600">
                <HiOutlineCalendar className="text-2xl" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-custom">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">הכנסה חודשית</p>
                <h3 className="text-3xl font-bold">₪{stats.monthlyRevenue.toLocaleString()}</h3>
              </div>
              <div className="bg-green-100 p-3 rounded-full text-green-600">
                <HiOutlineCash className="text-2xl" />
              </div>
            </div>
          </div>
        </div>

        {/* אפשרויות ניהול */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/admin/bookings" className="bg-white p-6 rounded-lg shadow-custom hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="bg-accent-light/20 p-3 rounded-full text-accent">
                <HiOutlineCalendar className="text-2xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold">ניהול הזמנות</h3>
                <p className="text-gray-500">צפייה ועריכת הזמנות</p>
              </div>
            </div>
          </Link>

          <Link href="/admin/booking-calendar" className="bg-white p-6 rounded-lg shadow-custom hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                <HiOutlineViewGrid className="text-2xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold">לוח הזמנות</h3>
                <p className="text-gray-500">תצוגת גאנט ונתונים</p>
              </div>
            </div>
          </Link>

          <Link href="/admin/rooms" className="bg-white p-6 rounded-lg shadow-custom hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="bg-primary-100 p-3 rounded-full text-primary-600">
                <HiOutlineOfficeBuilding className="text-2xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold">ניהול חדרים</h3>
                <p className="text-gray-500">הוספה ועריכת חדרים</p>
              </div>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-8">
          <Link href="/admin/finances" className="bg-white p-6 rounded-lg shadow-custom hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-full text-green-600">
                <HiOutlineChartBar className="text-2xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold">ניהול פיננסי</h3>
                <p className="text-gray-500">הכנסות, הוצאות ודוחות</p>
              </div>
            </div>
          </Link>
        </div>

        {/* אם במצב פיתוח - הוסף כפתור לניקוי localStorage */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-8 flex justify-end">
            <button
              onClick={() => {
                try {
                  localStorage.removeItem('devModeBookings');
                  toast.success('מאגר ההזמנות המדומות נוקה בהצלחה');
                } catch (error) {
                  console.error('Error clearing localStorage:', error);
                  toast.error('שגיאה בניקוי מאגר ההזמנות המדומות');
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded flex items-center space-x-2"
            >
              <HiTrash className="ml-1" />
              <span>ניקוי הזמנות מדומות</span>
            </button>
          </div>
        )}

        {/* תוכן נוסף */}
        <div className="bg-white p-6 rounded-lg shadow-custom mb-8">
          <h2 className="text-xl font-bold mb-4">הזמנות אחרונות</h2>
          <div className="text-center py-8 text-gray-500">
            <p>נתוני הזמנות יופיעו כאן</p>
            <p className="mt-2 text-sm">(יש להשלים את פיתוח הרכיב הזה)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 