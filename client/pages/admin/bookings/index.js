import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../../contexts/AuthContext';
import { HiOutlineCalendar, HiOutlineChevronRight, HiOutlineSearch, HiOutlineAdjustments, HiOutlineRefresh, HiTrash } from 'react-icons/hi';
import { fetchAllBookings, isDevelopmentMode } from '../../../lib/api';
import { toast } from 'react-toastify';
import BookingStatusDropdown from '../../../components/admin/BookingStatusDropdown';

const AdminBookings = () => {
  const router = useRouter();
  const { isAuthenticated, isAdminOrManager, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    dateRange: 'all'
  });

  // טעינת נתוני הזמנות
  useEffect(() => {
    if (authLoading) return;

    // בדיקת הרשאות
    if (!isAuthenticated) {
      router.push('/login?redirect=/admin/bookings');
      return;
    }

    if (!isAdminOrManager()) {
      toast.error('אין לך הרשאה לצפות בדף זה');
      router.push('/');
      return;
    }

    loadBookings();
  }, [authLoading, isAuthenticated, isAdminOrManager, router]);

  // פונקציה לטעינת ההזמנות
  const loadBookings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // טעינת הזמנות מהשרת
      const data = await fetchAllBookings();
      
      // עיבוד הנתונים לפורמט אחיד
      const processedBookings = data.map(booking => ({
        _id: booking._id,
        confirmationCode: booking.confirmationCode || `BKG-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        guestName: booking.guestName || 'אורח לא ידוע',
        guestEmail: booking.guestEmail || '',
        checkIn: new Date(booking.checkIn),
        checkOut: new Date(booking.checkOut),
        roomNumber: booking.room?.roomNumber || booking.roomNumber || '---',
        roomType: booking.room?.type || booking.roomType || 'חדר',
        totalPrice: booking.totalPrice || 0,
        paymentStatus: booking.paymentStatus || 'pending',
        isCheckedIn: booking.isCheckedIn || booking.checkInStatus === 'checked-in',
        isCheckedOut: booking.isCheckedOut || booking.checkInStatus === 'checked-out'
      }));
      
      setBookings(processedBookings);
      
      // הוספת הזמנות מדומות מ-localStorage במצב פיתוח
      if (isDevelopmentMode()) {
        try {
          const devBookings = JSON.parse(localStorage.getItem('devModeBookings') || '[]');
          if (devBookings.length > 0) {
            // המרת ההזמנות המדומות לפורמט הנדרש בעמוד הזה
            const formattedDevBookings = devBookings.map((booking, index) => ({
              _id: `dev-${index}`,
              confirmationCode: booking.confirmationCode,
              guestName: `${booking.firstName || ''} ${booking.lastName || ''}`.trim() || booking.guestName || 'אורח לדוגמה',
              guestEmail: booking.email || booking.guestEmail || 'dev@example.com',
              checkIn: new Date(booking.checkIn),
              checkOut: new Date(booking.checkOut),
              roomNumber: booking.room?.roomNumber || booking.roomNumber || '---',
              roomType: booking.room?.type || booking.roomType || 'חדר',
              totalPrice: booking.totalPrice || 0,
              paymentStatus: 'paid',
              isCheckedIn: false,
              isCheckedOut: false
            }));
            
            // הוספת ההזמנות המדומות לרשימה
            setBookings(prevBookings => [...formattedDevBookings, ...prevBookings]);
            console.log('הוספת הזמנות מדומות מ-localStorage:', formattedDevBookings);
          }
        } catch (error) {
          console.error('שגיאה בהבאת הזמנות מדומות מ-localStorage:', error);
        }
      }
    } catch (error) {
      console.error('שגיאה בטעינת הזמנות:', error);
      setError('אירעה שגיאה בטעינת ההזמנות. נא לנסות שוב.');
      
      // במצב פיתוח, טען נתוני דמו במקרה של שגיאה
      if (isDevelopmentMode()) {
        loadDummyData();
      }
    } finally {
      setIsLoading(false);
    }
  };

  // טעינת נתוני הזמנות לדוגמה
  const loadDummyData = () => {
    // נתונים לדוגמה - במערכת אמיתית נביא מהשרת
    const dummyBookings = [
      {
        _id: '1',
        confirmationCode: 'BKG123',
        guestName: 'משה כהן',
        guestEmail: 'moshe@example.com',
        checkIn: new Date('2025-05-10'),
        checkOut: new Date('2025-05-12'),
        roomNumber: '101',
        roomType: 'זוגי',
        totalPrice: 900,
        paymentStatus: 'paid',
        isCheckedIn: false,
        isCheckedOut: false
      },
      {
        _id: '2',
        confirmationCode: 'BKG124',
        guestName: 'שרה לוי',
        guestEmail: 'sara@example.com',
        checkIn: new Date('2025-05-15'),
        checkOut: new Date('2025-05-18'),
        roomNumber: '201',
        roomType: 'סוויטה',
        totalPrice: 1800,
        paymentStatus: 'pending',
        isCheckedIn: false,
        isCheckedOut: false
      },
      {
        _id: '3',
        confirmationCode: 'BKG125',
        guestName: 'דוד ישראלי',
        guestEmail: 'david@example.com',
        checkIn: new Date('2025-04-20'),
        checkOut: new Date('2025-04-22'),
        roomNumber: '102',
        roomType: 'זוגי פלוס',
        totalPrice: 1100,
        paymentStatus: 'paid',
        isCheckedIn: true,
        isCheckedOut: false
      },
      {
        _id: '4',
        confirmationCode: 'BKG126',
        guestName: 'רחל גולן',
        guestEmail: 'rachel@example.com',
        checkIn: new Date('2025-04-18'),
        checkOut: new Date('2025-04-19'),
        roomNumber: '103',
        roomType: 'יחיד',
        totalPrice: 400,
        paymentStatus: 'paid',
        isCheckedIn: true,
        isCheckedOut: true
      }
    ];

    setBookings(dummyBookings);
  };

  // פילטור הזמנות
  const filteredBookings = bookings.filter(booking => {
    // פילטור לפי סטטוס תשלום
    if (filters.status && filters.status !== booking.paymentStatus) {
      return false;
    }

    // פילטור לפי חיפוש
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      return (
        booking.guestName.toLowerCase().includes(searchTerm) ||
        booking.confirmationCode.toLowerCase().includes(searchTerm) ||
        (booking.guestEmail && booking.guestEmail.toLowerCase().includes(searchTerm))
      );
    }

    // פילטור לפי טווח תאריכים
    if (filters.dateRange !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      
      const nextMonth = new Date(today);
      nextMonth.setMonth(today.getMonth() + 1);
      
      const checkInDate = new Date(booking.checkIn);
      
      switch (filters.dateRange) {
        case 'today':
          return checkInDate.toDateString() === today.toDateString();
        case 'tomorrow':
          return checkInDate.toDateString() === tomorrow.toDateString();
        case 'week':
          return checkInDate >= today && checkInDate <= nextWeek;
        case 'month':
          return checkInDate >= today && checkInDate <= nextMonth;
        default:
          return true;
      }
    }

    return true;
  });

  // פורמט תאריך
  const formatDate = (date) => {
    if (!date || isNaN(new Date(date).getTime())) {
      return 'תאריך לא תקין';
    }
    return new Date(date).toLocaleDateString('he-IL');
  };

  // סטטוס תשלום
  const renderPaymentStatus = (status) => {
    switch (status) {
      case 'paid':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">שולם</span>;
      case 'pending':
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">ממתין לתשלום</span>;
      case 'refunded':
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">זוכה</span>;
      case 'cancelled':
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">בוטל</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">{status}</span>;
    }
  };

  // סטטוס צ'ק-אין
  const renderCheckStatus = (booking) => {
    if (booking.isCheckedOut) {
      return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">עזב</span>;
    } else if (booking.isCheckedIn) {
      return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">שוהה</span>;
    } else {
      // נבדוק אם תאריך ההגעה הוא היום
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const checkInDate = new Date(booking.checkIn);
      checkInDate.setHours(0, 0, 0, 0);

      if (checkInDate.getTime() === today.getTime()) {
        return <span className="bg-accent-light/20 text-accent px-2 py-1 rounded-full text-xs">מגיע היום</span>;
      } else if (checkInDate < today) {
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">לא הגיע</span>;
      } else {
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">עתידי</span>;
      }
    }
  };

  // פונקציה לניקוי הזמנות מדומות
  const clearDevModeBookings = () => {
    try {
      localStorage.removeItem('devModeBookings');
      toast.success('מאגר ההזמנות המדומות נוקה בהצלחה');
      // רענון הדף להצגת השינויים
      loadBookings();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      toast.error('שגיאה בניקוי מאגר ההזמנות המדומות');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen rtl">
      <Head>
        <title>ניהול הזמנות | רוטשילד 79</title>
      </Head>

      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Link href="/admin" className="text-primary-600 hover:text-primary-800">
              <HiOutlineChevronRight className="transform rotate-180" size={20} />
            </Link>
            <h1 className="text-3xl font-bold text-primary-800">ניהול הזמנות</h1>
          </div>
          
          <div className="flex gap-2">
            {isDevelopmentMode() && (
              <button
                onClick={clearDevModeBookings}
                className="flex items-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md ml-2"
              >
                <HiTrash className="ml-2" />
                ניקוי הזמנות מדומות
              </button>
            )}
            
            <button
              onClick={loadBookings}
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md ml-2"
            >
              <HiOutlineRefresh className="ml-2" />
              רענון
            </button>
            
            <button
              className="bg-accent hover:bg-accent-dark text-white px-4 py-2 rounded-md"
              onClick={() => router.push('/admin/bookings/new')}
            >
              הזמנה חדשה
            </button>
          </div>
        </div>

        {/* פילטרים */}
        <div className="bg-white p-4 rounded-lg shadow-custom mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <HiOutlineSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="חיפוש לפי שם אורח, קוד אישור או מייל"
                className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            
            <div className="md:w-48">
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="">כל הסטטוסים</option>
                <option value="paid">שולם</option>
                <option value="pending">ממתין לתשלום</option>
                <option value="refunded">זוכה</option>
                <option value="cancelled">בוטל</option>
              </select>
            </div>
            
            <div className="md:w-48">
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={filters.dateRange}
                onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
              >
                <option value="all">כל התאריכים</option>
                <option value="today">היום</option>
                <option value="tomorrow">מחר</option>
                <option value="week">השבוע</option>
                <option value="month">החודש</option>
              </select>
            </div>
          </div>
        </div>

        {/* הודעת שגיאה */}
        {error && (
          <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
            <button 
              onClick={loadBookings}
              className="mt-2 text-sm text-red-700 hover:text-red-900 underline flex items-center gap-1"
            >
              <HiOutlineRefresh className="w-4 h-4" /> נסה שוב
            </button>
          </div>
        )}

        {/* טבלת הזמנות */}
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent"></div>
          </div>
        ) : filteredBookings.length > 0 ? (
          <div className="bg-white rounded-lg shadow-custom overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      קוד אישור
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      אורח
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      תאריכים
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      חדר
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      מחיר
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      סטטוס תשלום
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      סטטוס שהייה
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      פעולות
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBookings.map((booking) => (
                    <tr key={booking._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-primary-800">{booking.confirmationCode}</div>
                        {booking._id.toString().startsWith('dev-') && (
                          <div className="text-xs text-gray-400 mt-1">(הזמנה מדומה)</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">{booking.guestName}</div>
                        {booking.guestEmail && <div className="text-sm text-gray-500">{booking.guestEmail}</div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">{formatDate(booking.checkIn)} -</div>
                        <div className="text-sm">{formatDate(booking.checkOut)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium">{booking.roomNumber}</div>
                        <div className="text-sm text-gray-500">{booking.roomType}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium">₪{booking.totalPrice.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <BookingStatusDropdown
                          type="payment"
                          current={booking.paymentStatus}
                          bookingId={booking._id}
                          onUpdate={(newStatus) => {
                            const updatedBookings = bookings.map(b => {
                              if (b._id === booking._id) {
                                return { ...b, paymentStatus: newStatus };
                              }
                              return b;
                            });
                            setBookings(updatedBookings);
                          }}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderCheckStatus(booking)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex flex-col gap-1">
                          <button 
                            className="text-accent hover:text-accent-dark"
                            onClick={() => router.push(`/admin/bookings/${booking._id}`)}
                          >
                            צפייה
                          </button>
                          
                          <button 
                            className="text-blue-600 hover:text-blue-800"
                            onClick={() => router.push(`/admin/bookings/${booking._id}/edit`)}
                          >
                            עריכה
                          </button>
                          
                          {booking._id.toString().startsWith('mock-') && (
                            <button 
                              className="text-red-600 hover:text-red-800"
                              onClick={() => {
                                if (confirm('האם אתה בטוח שברצונך למחוק הזמנה מדומה זו?')) {
                                  try {
                                    const devBookings = JSON.parse(localStorage.getItem('devModeBookings') || '[]');
                                    const updatedBookings = devBookings.filter(b => 
                                      b._id !== booking._id
                                    );
                                    localStorage.setItem('devModeBookings', JSON.stringify(updatedBookings));
                                    toast.success('ההזמנה נמחקה בהצלחה');
                                    loadBookings();
                                  } catch (error) {
                                    console.error('שגיאה במחיקת הזמנה:', error);
                                    toast.error('שגיאה במחיקת ההזמנה');
                                  }
                                }
                              }}
                            >
                              מחיקה
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-custom p-10 text-center">
            <HiOutlineCalendar className="mx-auto text-5xl text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-900">לא נמצאו הזמנות</h3>
            <p className="mt-1 text-gray-500">נסה לשנות את הפילטרים או להוסיף הזמנה חדשה</p>
            <button
              onClick={() => setFilters({ status: '', search: '', dateRange: 'all' })}
              className="mt-4 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              <HiOutlineAdjustments className="ml-2 h-4 w-4 text-gray-500" />
              איפוס פילטרים
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBookings; 