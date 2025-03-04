import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { HiOutlineArrowRight, HiOutlineSave, HiOutlineX } from 'react-icons/hi';
import { fetchBookingById, updateBooking, isDevelopmentMode } from '../../../../lib/api';
import Layout from '../../../../components/Layout';
import { useAuth } from '../../../../contexts/AuthContext';

const EditBooking = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    checkIn: '',
    checkOut: '',
    numGuests: 1,
    roomNumber: '',
    roomType: '',
    totalPrice: 0,
    paymentStatus: 'pending',
    status: 'confirmed',
    specialRequests: '',
  });

  useEffect(() => {
    if (!router.isReady) return;
    
    if (!authLoading) {
      if (!user) {
        router.push('/login?redirect=/admin/bookings');
        return;
      }
      
      if (user.role !== 'admin' && user.role !== 'manager') {
        setError('אין לך הרשאות לערוך הזמנות');
        setLoading(false);
        return;
      }
      
      loadBookingDetails();
    }
  }, [router.isReady, authLoading, user, id]);

  const loadBookingDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // בדיקה אם מדובר בהזמנה מדומה במצב פיתוח
      if (isDevelopmentMode() && id.startsWith('dev-')) {
        const devBookings = JSON.parse(localStorage.getItem('devModeBookings') || '[]');
        const devBooking = devBookings.find(b => b._id === id);
        
        if (devBooking) {
          setFormData({
            ...devBooking,
            checkIn: formatDateForInput(devBooking.checkIn),
            checkOut: formatDateForInput(devBooking.checkOut),
          });
          setLoading(false);
          return;
        }
      }
      
      // אם לא מדובר בהזמנה מדומה, מנסה להביא מהשרת
      const data = await fetchBookingById(id);
      setFormData({
        ...data,
        checkIn: formatDateForInput(data.checkIn),
        checkOut: formatDateForInput(data.checkOut),
      });
    } catch (err) {
      console.error('שגיאה בטעינת פרטי ההזמנה:', err);
      setError('לא ניתן לטעון את פרטי ההזמנה');
      
      // במצב פיתוח, טוען נתונים מדומים
      if (isDevelopmentMode()) {
        loadDummyBooking();
      }
    } finally {
      setLoading(false);
    }
  };

  const loadDummyBooking = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const checkOut = new Date();
    checkOut.setDate(checkOut.getDate() + 3);
    
    const dummyBooking = {
      _id: id,
      confirmationCode: 'DEMO12345',
      guestName: 'ישראל ישראלי',
      guestEmail: 'israel@example.com',
      guestPhone: '050-1234567',
      checkIn: formatDateForInput(tomorrow),
      checkOut: formatDateForInput(checkOut),
      roomNumber: '101',
      roomType: 'סוויטה דה-לוקס',
      numGuests: 2,
      totalPrice: 1500,
      paymentStatus: 'pending',
      status: 'confirmed',
      specialRequests: 'נא להכין מיטה נוספת לילד',
    };
    
    setFormData(dummyBooking);
    toast.info('מציג נתוני הזמנה לדוגמה במצב פיתוח');
  };

  const formatDateForInput = (date) => {
    if (!date) return '';
    
    try {
      const d = new Date(date);
      return d.toISOString().split('T')[0];
    } catch (e) {
      return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'numGuests' || name === 'totalPrice') {
      setFormData({ ...formData, [name]: Number(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    
    try {
      // בדיקה אם מדובר בהזמנה מדומה במצב פיתוח
      if (isDevelopmentMode() && id.startsWith('mock-')) {
        const devBookings = JSON.parse(localStorage.getItem('devModeBookings') || '[]');
        const updatedBookings = devBookings.map(booking => {
          if (booking._id === id) {
            return {
              ...booking,
              ...formData,
              checkIn: new Date(formData.checkIn),
              checkOut: new Date(formData.checkOut),
              updatedAt: new Date()
            };
          }
          return booking;
        });
        
        localStorage.setItem('devModeBookings', JSON.stringify(updatedBookings));
        toast.success('ההזמנה עודכנה בהצלחה');
        router.push('/admin/bookings');
        return;
      }
      
      // אם לא מדובר בהזמנה מדומה, שולח לשרת
      await updateBooking(id, formData);
      toast.success('ההזמנה עודכנה בהצלחה');
      router.push('/admin/bookings');
    } catch (err) {
      console.error('שגיאה בעדכון ההזמנה:', err);
      setError('שגיאה בעדכון ההזמנה. נסה שנית או פנה למנהל המערכת.');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-white rounded-lg shadow-custom p-8 text-center">
          <div className="text-red-500 mb-4 text-xl">
            <HiOutlineX className="mx-auto h-12 w-12" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{error}</h2>
          <p className="text-gray-600 mb-4">לא ניתן לערוך את ההזמנה המבוקשת</p>
          <button
            onClick={() => router.push('/admin/bookings')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent hover:bg-accent-dark focus:outline-none"
          >
            <HiOutlineArrowRight className="ml-2 -mr-1 h-5 w-5" />
            חזרה לרשימת ההזמנות
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto pb-12">
        {/* כותרת וכפתורים */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">עריכת הזמנה</h1>
            <p className="text-gray-600">
              קוד אישור: <span className="font-medium">{formData.confirmationCode}</span>
            </p>
          </div>
          <div className="flex space-x-4 space-x-reverse">
            <button
              onClick={() => router.push(`/admin/bookings/${id}`)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              <HiOutlineX className="ml-2 -mr-1 h-5 w-5 text-gray-500" />
              ביטול
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving || loading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent hover:bg-accent-dark focus:outline-none disabled:opacity-50"
            >
              <HiOutlineSave className="ml-2 -mr-1 h-5 w-5" />
              {saving ? 'שומר...' : 'שמירה'}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-custom overflow-hidden">
            {/* פרטי האורח */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 mb-4">פרטי האורח</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="guestName" className="block text-sm font-medium text-gray-700 mb-1">
                    שם מלא <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="guestName"
                    name="guestName"
                    value={formData.guestName}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="guestEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    אימייל
                  </label>
                  <input
                    type="email"
                    id="guestEmail"
                    name="guestEmail"
                    value={formData.guestEmail}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="guestPhone" className="block text-sm font-medium text-gray-700 mb-1">
                    טלפון
                  </label>
                  <input
                    type="tel"
                    id="guestPhone"
                    name="guestPhone"
                    value={formData.guestPhone}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* פרטי ההזמנה */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 mb-4">פרטי ההזמנה</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="checkIn" className="block text-sm font-medium text-gray-700 mb-1">
                    תאריך כניסה <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="checkIn"
                    name="checkIn"
                    value={formData.checkIn}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="checkOut" className="block text-sm font-medium text-gray-700 mb-1">
                    תאריך יציאה <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="checkOut"
                    name="checkOut"
                    value={formData.checkOut}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="numGuests" className="block text-sm font-medium text-gray-700 mb-1">
                    מספר אורחים <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="numGuests"
                    name="numGuests"
                    value={formData.numGuests}
                    onChange={handleChange}
                    min="1"
                    required
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="roomNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    מספר חדר <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="roomNumber"
                    name="roomNumber"
                    value={formData.roomNumber}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="roomType" className="block text-sm font-medium text-gray-700 mb-1">
                    סוג חדר <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="roomType"
                    name="roomType"
                    value={formData.roomType}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="totalPrice" className="block text-sm font-medium text-gray-700 mb-1">
                    מחיר כולל (₪) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="totalPrice"
                    name="totalPrice"
                    value={formData.totalPrice}
                    onChange={handleChange}
                    min="0"
                    required
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="paymentStatus" className="block text-sm font-medium text-gray-700 mb-1">
                    סטטוס תשלום <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="paymentStatus"
                    name="paymentStatus"
                    value={formData.paymentStatus}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm"
                  >
                    <option value="pending">ממתין לתשלום</option>
                    <option value="paid">שולם</option>
                    <option value="refunded">הוחזר</option>
                    <option value="cancelled">בוטל</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    סטטוס הזמנה <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm"
                  >
                    <option value="confirmed">מאושר</option>
                    <option value="checked_in">נכנס</option>
                    <option value="checked_out">יצא</option>
                    <option value="cancelled">בוטל</option>
                  </select>
                </div>
              </div>
            </div>

            {/* בקשות מיוחדות */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 mb-2">בקשות מיוחדות</h2>
              <textarea
                id="specialRequests"
                name="specialRequests"
                value={formData.specialRequests}
                onChange={handleChange}
                rows={4}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm"
              />
            </div>

            {/* כפתורי פעולות */}
            <div className="p-6 bg-gray-50 flex justify-end">
              <div className="flex space-x-4 space-x-reverse">
                <button
                  type="button"
                  onClick={() => router.push(`/admin/bookings/${id}`)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                >
                  <HiOutlineX className="ml-2 -mr-1 h-5 w-5 text-gray-500" />
                  ביטול
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent hover:bg-accent-dark focus:outline-none disabled:opacity-50"
                >
                  <HiOutlineSave className="ml-2 -mr-1 h-5 w-5" />
                  {saving ? 'שומר...' : 'שמירה'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </Layout>
  );
};

export default EditBooking; 