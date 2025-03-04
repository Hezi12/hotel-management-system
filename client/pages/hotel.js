import { useState, useEffect } from 'react';
import { FaRegClock, FaRegCalendarAlt, FaUsers, FaHotel, FaBed, FaMoneyBillWave, FaCalendarDay } from 'react-icons/fa';
import Layout from '../components/Layout';
import Head from 'next/head';
import { useRouter } from 'next/router';

const HotelPage = () => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    upcomingBookings: 0,
    occupancyRate: 0,
    totalRooms: 0,
    availableRooms: 0,
    revenue: 0
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        // כאן נבצע קריאה לשרת לקבלת נתוני לוח המחוונים
        // לצורך הדוגמה, נשתמש בנתונים קבועים
        
        // נתונים לדוגמה
        setStats({
          totalBookings: 156,
          upcomingBookings: 42,
          occupancyRate: 78,
          totalRooms: 25,
          availableRooms: 8,
          revenue: 185000
        });
        
        setIsLoading(false);
      } catch (err) {
        console.error('שגיאה בטעינת נתוני לוח המחוונים:', err);
        setError('לא ניתן לטעון את נתוני לוח המחוונים. נסה שוב מאוחר יותר.');
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // רשימת פעולות מהירות
  const quickActions = [
    { 
      title: 'הזמנות חדשות', 
      icon: <FaRegCalendarAlt className="text-gray-700 text-xl" />,
      action: () => router.push('/admin/bookings')
    },
    { 
      title: 'לוח הזמנות', 
      icon: <FaCalendarDay className="text-gray-700 text-xl" />,
      action: () => router.push('/admin/booking-calendar')
    },
    { 
      title: 'ניהול חדרים', 
      icon: <FaBed className="text-gray-700 text-xl" />,
      action: () => router.push('/admin/rooms')
    },
    { 
      title: 'דוחות כספיים', 
      icon: <FaMoneyBillWave className="text-gray-700 text-xl" />,
      action: () => router.push('/admin/finances')
    },
    { 
      title: 'ניהול משתמשים', 
      icon: <FaUsers className="text-gray-700 text-xl" />,
      action: () => router.push('/admin/users')
    }
  ];

  const StatCard = ({ title, value, icon }) => (
    <div className="bg-white rounded border border-gray-200 p-4 flex items-center">
      <div className="p-2 mr-3">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <p className="text-xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );

  return (
    <Layout>
      <Head>
        <title>ממשק ניהול | רוטשילד 79</title>
      </Head>
      
      <div className="container mx-auto px-4 py-6 mt-16">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">שלום, מנהל</h1>
          <p className="text-gray-600">ברוך הבא לממשק ניהול השכרת החדרים.</p>
        </div>
        
        {isLoading ? (
          <div className="text-center py-12">
            <div className="spinner"></div>
            <p className="mt-4 text-gray-600">טוען נתונים...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-r-4 border-red-500 text-red-700 p-4 rounded mb-6">
            <p>{error}</p>
          </div>
        ) : (
          <>
            {/* לוח המחוונים */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <StatCard 
                title="סך הזמנות" 
                value={stats.totalBookings} 
                icon={<FaRegCalendarAlt className="text-gray-700 text-xl" />}
              />
              <StatCard 
                title="הזמנות קרובות" 
                value={stats.upcomingBookings} 
                icon={<FaRegClock className="text-gray-700 text-xl" />}
              />
              <StatCard 
                title="אחוז תפוסה" 
                value={`${stats.occupancyRate}%`} 
                icon={<FaHotel className="text-gray-700 text-xl" />}
              />
              <StatCard 
                title="סך חדרים" 
                value={stats.totalRooms} 
                icon={<FaBed className="text-gray-700 text-xl" />}
              />
              <StatCard 
                title="חדרים זמינים" 
                value={stats.availableRooms} 
                icon={<FaBed className="text-gray-700 text-xl" />}
              />
              <StatCard 
                title="הכנסות (₪)" 
                value={stats.revenue.toLocaleString()} 
                icon={<FaMoneyBillWave className="text-gray-700 text-xl" />}
              />
            </div>
            
            {/* פעולות מהירות */}
            <div className="bg-white rounded border border-gray-200 p-4 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">פעולות מהירות</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    className="flex flex-col items-center justify-center p-3 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition"
                  >
                    {action.icon}
                    <span className="mt-2 text-sm text-gray-700">{action.title}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* מידע נוסף */}
            <div className="bg-white rounded border border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">הודעות מערכת</h2>
              <div className="border-r-4 border-gray-500 bg-gray-50 p-3 rounded">
                <p className="text-gray-700">ברוכים הבאים לממשק הניהול של חדרי האירוח ברוטשילד 79. כאן תוכלו לנהל את כל הפעילות במקום אחד.</p>
              </div>
            </div>
          </>
        )}
      </div>
      <style jsx>{`
        .spinner {
          border: 3px solid rgba(0, 0, 0, 0.1);
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border-left-color: #6b7280;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </Layout>
  );
};

export default HotelPage; 