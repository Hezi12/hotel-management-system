import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { HiOutlineArrowRight, HiOutlineCash, HiOutlineCalendar, HiOutlineUser, HiOutlineHome, HiOutlineDocumentText, HiOutlinePrinter, HiOutlineRefresh, HiOutlineTrash, HiOutlinePencil, HiOutlineDocument, HiOutlineCreditCard } from 'react-icons/hi';
import Layout from '../../../../components/Layout';
import { fetchBookingById, isDevelopmentMode, updateBookingStatus, updateBookingPaymentStatus, deleteBooking } from '../../../../lib/api';
import { useAuth } from '../../../../contexts/AuthContext';

const BookingDetails = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user, loading: authLoading } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPriceEdit, setShowPriceEdit] = useState(false);
  const [newPrice, setNewPrice] = useState(0);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [generatingInvoice, setGeneratingInvoice] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;
    
    if (!authLoading) {
      if (!user) {
        router.push('/login?redirect=/admin/bookings');
        return;
      }
      
      if (user.role !== 'admin' && user.role !== 'manager') {
        setError('אין לך הרשאות לצפות בדף זה');
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
          setBooking({
            ...devBooking,
            createdAt: new Date(devBooking.createdAt),
            checkIn: new Date(devBooking.checkIn),
            checkOut: new Date(devBooking.checkOut),
          });
          setLoading(false);
          setNewPrice(devBooking.totalPrice);
          setPaymentAmount(devBooking.totalPrice);
          return;
        }
      }
      
      // אם לא מדובר בהזמנה מדומה, מנסה להביא מהשרת
      const data = await fetchBookingById(id);
      setBooking(data);
      setNewPrice(data.totalPrice);
      setPaymentAmount(data.totalPrice);
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
    const dummyBooking = {
      _id: id,
      confirmationCode: 'DEMO12345',
      guestName: 'ישראל ישראלי',
      guestEmail: 'israel@example.com',
      guestPhone: '050-1234567',
      checkIn: new Date(Date.now() + 86400000), // מחר
      checkOut: new Date(Date.now() + 86400000 * 3), // עוד 3 ימים
      roomNumber: '101',
      roomType: 'סוויטה דה-לוקס',
      numGuests: 2,
      totalPrice: 1500,
      paymentStatus: 'paid',
      status: 'confirmed',
      specialRequests: 'נא להכין מיטה נוספת לילד',
      createdAt: new Date(),
    };
    
    setBooking(dummyBooking);
    toast.info('מציג נתוני הזמנה לדוגמה במצב פיתוח');
    setNewPrice(dummyBooking.totalPrice);
    setPaymentAmount(dummyBooking.totalPrice);
  };

  const formatDate = (date) => {
    if (!date) return 'תאריך לא תקין';
    
    try {
      const d = new Date(date);
      return d.toLocaleDateString('he-IL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return 'תאריך לא תקין';
    }
  };

  const renderPaymentStatus = (status) => {
    switch (status) {
      case 'paid':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">שולם</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">ממתין לתשלום</span>;
      case 'refunded':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">הוחזר</span>;
      case 'cancelled':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">בוטל</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const printBooking = () => {
    window.print();
  };

  // פונקציה לשינוי סטטוס תשלום
  const handlePaymentStatusChange = async (newStatus) => {
    try {
      // עדכון סטטוס תשלום
      await updateBookingPaymentStatus(id, newStatus);
      toast.success(`סטטוס התשלום עודכן ל-${newStatus}`);
      
      // רענון הנתונים
      loadBookingDetails();
    } catch (error) {
      console.error('שגיאה בעדכון סטטוס תשלום:', error);
      toast.error('שגיאה בעדכון סטטוס תשלום');
    }
  };
  
  // פונקציה לשינוי סטטוס הזמנה
  const handleBookingStatusChange = async (newStatus) => {
    try {
      // עדכון סטטוס הזמנה
      await updateBookingStatus(id, newStatus);
      toast.success(`סטטוס ההזמנה עודכן ל-${newStatus}`);
      
      // רענון הנתונים
      loadBookingDetails();
    } catch (error) {
      console.error('שגיאה בעדכון סטטוס הזמנה:', error);
      toast.error('שגיאה בעדכון סטטוס הזמנה');
    }
  };

  // פונקציה למחיקת הזמנה
  const handleDeleteBooking = async () => {
    try {
      await deleteBooking(id);
      toast.success('ההזמנה נמחקה בהצלחה');
      router.push('/admin/bookings');
    } catch (error) {
      console.error('שגיאה במחיקת ההזמנה:', error);
      toast.error('שגיאה במחיקת ההזמנה');
    }
  };
  
  // פונקציה לעדכון מחיר
  const handlePriceUpdate = async () => {
    try {
      if (newPrice <= 0) {
        toast.error('המחיר חייב להיות גדול מאפס');
        return;
      }
      
      // עדכון ההזמנה עם המחיר החדש
      const updatedBooking = { ...booking, totalPrice: Number(newPrice) };
      
      if (isDevelopmentMode() && booking._id.startsWith('mock-')) {
        // עדכון הזמנה מדומה
        const devBookings = JSON.parse(localStorage.getItem('devModeBookings') || '[]');
        const updatedBookings = devBookings.map(b => {
          if (b._id === booking._id) {
            return { ...b, totalPrice: Number(newPrice) };
          }
          return b;
        });
        localStorage.setItem('devModeBookings', JSON.stringify(updatedBookings));
      } else {
        // שליחה לשרת
        await updateBooking(id, { totalPrice: Number(newPrice) });
      }
      
      toast.success('המחיר עודכן בהצלחה');
      setShowPriceEdit(false);
      loadBookingDetails(); // רענון ההזמנה
    } catch (error) {
      console.error('שגיאה בעדכון המחיר:', error);
      toast.error('שגיאה בעדכון המחיר');
    }
  };
  
  // פונקציה ליצירת חשבונית
  const generateInvoice = async () => {
    setGeneratingInvoice(true);
    try {
      // במצב אמיתי, כאן תהיה קריאה לשרת ליצירת חשבונית
      await new Promise(resolve => setTimeout(resolve, 1000)); // סימולציה של פעולה שלוקחת זמן
      
      // ייצור חשבונית בסיסית כ-HTML ושינוי שלה ל-PDF בצד הלקוח לצורך דוגמה
      // במערכת אמיתית, ייצור ה-PDF יהיה בצד השרת
      
      const invoiceContent = `
        <html dir="rtl">
        <head>
          <title>חשבונית עבור הזמנה ${booking.confirmationCode}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .invoice-header { text-align: center; margin-bottom: 30px; }
            .invoice-header h1 { margin-bottom: 5px; }
            .invoice-details { margin-bottom: 30px; }
            .invoice-details table { width: 100%; border-collapse: collapse; }
            .invoice-details th, .invoice-details td { padding: 10px; text-align: right; border-bottom: 1px solid #ddd; }
            .invoice-total { margin-top: 20px; text-align: left; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="invoice-header">
            <h1>חשבונית</h1>
            <div>מלון דוגמה</div>
            <div>עבור הזמנה: ${booking.confirmationCode}</div>
            <div>תאריך: ${new Date().toLocaleDateString('he-IL')}</div>
          </div>
          
          <div class="invoice-details">
            <h2>פרטי לקוח</h2>
            <div>שם: ${booking.guestName}</div>
            <div>אימייל: ${booking.guestEmail || 'לא צוין'}</div>
            <div>טלפון: ${booking.guestPhone || 'לא צוין'}</div>
            
            <h2>פרטי ההזמנה</h2>
            <div>תאריך הגעה: ${new Date(booking.checkIn).toLocaleDateString('he-IL')}</div>
            <div>תאריך עזיבה: ${new Date(booking.checkOut).toLocaleDateString('he-IL')}</div>
            <div>מספר לילות: ${Math.ceil((new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24))}</div>
            <div>מספר חדר: ${booking.roomNumber}</div>
            <div>סוג חדר: ${booking.roomType}</div>
            
            <h2>פרטי תשלום</h2>
            <table>
              <tr>
                <th>פריט</th>
                <th>מחיר</th>
              </tr>
              <tr>
                <td>שהייה - ${booking.roomType}</td>
                <td>₪${booking.totalPrice.toLocaleString()}</td>
              </tr>
              <tr>
                <td><strong>סה"כ</strong></td>
                <td><strong>₪${booking.totalPrice.toLocaleString()}</strong></td>
              </tr>
            </table>
            
            <div class="invoice-total">
              סטטוס תשלום: ${booking.paymentStatus === 'paid' ? 'שולם' : 'ממתין לתשלום'}
            </div>
          </div>
        </body>
        </html>
      `;
      
      // יצירת חלון חדש להדפסה
      const printWindow = window.open('', '_blank');
      printWindow.document.write(invoiceContent);
      printWindow.document.close();
      printWindow.focus();
      
      // הוספת כפתור להורדה כ-PDF (ההורדה תתבצע באמצעות הורדת הדף)
      printWindow.document.body.innerHTML += `
        <div style="text-align: center; margin-top: 20px;">
          <button onclick="window.print();" style="padding: 10px 20px; background-color: #4f46e5; color: white; border: none; border-radius: 5px; cursor: pointer;">
            הורד כ-PDF
          </button>
        </div>
      `;
      
      toast.success('החשבונית נוצרה בהצלחה');
    } catch (error) {
      console.error('שגיאה ביצירת החשבונית:', error);
      toast.error('שגיאה ביצירת החשבונית');
    } finally {
      setGeneratingInvoice(false);
    }
  };
  
  // פונקציה לתיעוד תשלום
  const handleRecordPayment = () => {
    try {
      // כאן אפשר להוסיף שמירה של פרטי התשלום לצורך תיעוד
      // במערכת אמיתית, זה יהיה קשור למערכת פיננסית

      toast.success(`נרשם תשלום על סך ₪${paymentAmount} באמצעות ${paymentMethod === 'credit_card' ? 'כרטיס אשראי' : 'מזומן'}`);
      
      // אם ההזמנה עדיין לא משולמת, נשנה את הסטטוס לשולם
      if (booking.paymentStatus !== 'paid') {
        handlePaymentStatusChange('paid');
      }
      
      setShowPaymentDetails(false);
    } catch (error) {
      console.error('שגיאה ברישום התשלום:', error);
      toast.error('שגיאה ברישום התשלום');
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
            <HiOutlineDocumentText className="mx-auto h-12 w-12" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{error}</h2>
          <p className="text-gray-600 mb-4">לא ניתן לטעון את פרטי ההזמנה המבוקשת</p>
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
            <h1 className="text-2xl font-bold text-gray-900">פרטי הזמנה</h1>
            <p className="text-gray-600">
              קוד אישור: <span className="font-medium">{booking?.confirmationCode}</span>
            </p>
          </div>
          <div className="flex space-x-4 space-x-reverse">
            <button
              onClick={() => router.push('/admin/bookings')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              <HiOutlineArrowRight className="ml-2 -mr-1 h-5 w-5 text-gray-500" />
              חזרה
            </button>
            <button
              onClick={printBooking}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent hover:bg-accent-dark focus:outline-none"
            >
              <HiOutlinePrinter className="ml-2 -mr-1 h-5 w-5" />
              הדפסה
            </button>
            <button
              onClick={() => generateInvoice()}
              disabled={generatingInvoice}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none disabled:opacity-50"
            >
              <HiOutlineDocument className="ml-2 -mr-1 h-5 w-5" />
              {generatingInvoice ? 'מייצר חשבונית...' : 'יצירת חשבונית'}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent"></div>
          </div>
        ) : booking ? (
          <div className="bg-white rounded-lg shadow-custom overflow-hidden">
            {/* פרטי ההזמנה */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 mb-4">פרטי ההזמנה</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <HiOutlineCalendar className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="mr-4">
                    <h3 className="text-sm font-medium text-gray-900">תאריכי שהייה</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      כניסה: {formatDate(booking.checkIn).split(',')[0]}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      יציאה: {formatDate(booking.checkOut).split(',')[0]}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      מספר לילות: {Math.ceil((new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24))}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <HiOutlineHome className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="mr-4">
                    <h3 className="text-sm font-medium text-gray-900">פרטי החדר</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      מספר חדר: {booking.roomNumber}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      סוג חדר: {booking.roomType}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      מספר אורחים: {booking.numGuests}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <HiOutlineUser className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="mr-4">
                    <h3 className="text-sm font-medium text-gray-900">פרטי האורח</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      שם: {booking.guestName}
                    </p>
                    {booking.guestEmail && (
                      <p className="mt-1 text-sm text-gray-600">
                        אימייל: {booking.guestEmail}
                      </p>
                    )}
                    {booking.guestPhone && (
                      <p className="mt-1 text-sm text-gray-600">
                        טלפון: {booking.guestPhone}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <HiOutlineCash className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="mr-4">
                    <h3 className="text-sm font-medium text-gray-900">פרטי תשלום</h3>
                    <div className="flex items-center mt-1">
                      <p className="text-sm text-gray-600 ml-2">
                        סכום כולל: ₪{booking.totalPrice.toLocaleString()}
                      </p>
                      <button 
                        onClick={() => setShowPriceEdit(!showPriceEdit)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="שינוי מחיר"
                      >
                        <HiOutlinePencil className="h-4 w-4" />
                      </button>
                    </div>
                    
                    {showPriceEdit && (
                      <div className="mt-2 flex items-center">
                        <input
                          type="number"
                          min="0"
                          value={newPrice}
                          onChange={(e) => setNewPrice(e.target.value)}
                          className="w-24 border-gray-300 rounded-md shadow-sm focus:border-accent focus:ring-accent text-sm ml-2"
                        />
                        <button
                          onClick={handlePriceUpdate}
                          className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded text-xs"
                        >
                          עדכון
                        </button>
                        <button
                          onClick={() => setShowPriceEdit(false)}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-1 px-2 rounded text-xs mr-1"
                        >
                          ביטול
                        </button>
                      </div>
                    )}
                    
                    <div className="mt-1">
                      סטטוס תשלום: {renderPaymentStatus(booking.paymentStatus)}
                    </div>
                    
                    {booking.paymentMethod && (
                      <p className="mt-1 text-sm text-gray-600">
                        אמצעי תשלום: {booking.paymentMethod === 'credit_card' ? 'כרטיס אשראי' : booking.paymentMethod}
                      </p>
                    )}
                    
                    {booking.paymentMethod === 'credit_card' && booking.paymentDetails && (
                      <div className="mt-1">
                        <button
                          onClick={() => setShowPaymentDetails(!showPaymentDetails)}
                          className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                        >
                          <HiOutlineCreditCard className="ml-1 h-4 w-4" />
                          {showPaymentDetails ? 'הסתר פרטי אשראי' : 'הצג פרטי אשראי'}
                        </button>
                        
                        {showPaymentDetails && (
                          <div className="mt-2 p-3 bg-gray-50 rounded-md text-sm">
                            {booking.paymentDetails.cardHolder && (
                              <div className="mb-1">
                                <span className="font-medium">בעל הכרטיס:</span> {booking.paymentDetails.cardHolder}
                              </div>
                            )}
                            {booking.paymentDetails.cardLast4 && (
                              <div className="mb-1">
                                <span className="font-medium">4 ספרות אחרונות:</span> {booking.paymentDetails.cardLast4}
                              </div>
                            )}
                            {booking.paymentDetails.cardExpiry && (
                              <div className="mb-1">
                                <span className="font-medium">תוקף:</span> {booking.paymentDetails.cardExpiry}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <button
                      onClick={() => setShowPaymentDetails(true)}
                      className="mt-2 inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                    >
                      <HiOutlineCash className="ml-1 h-4 w-4" />
                      תיעוד תשלום
                    </button>
                    
                    {showPaymentDetails && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-md">
                        <h4 className="text-sm font-medium mb-2">תיעוד תשלום</h4>
                        <div className="mb-2">
                          <label className="block text-xs font-medium text-gray-700 mb-1">סכום</label>
                          <input
                            type="number"
                            min="0"
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(e.target.value)}
                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-accent focus:ring-accent text-sm"
                          />
                        </div>
                        <div className="mb-3">
                          <label className="block text-xs font-medium text-gray-700 mb-1">אמצעי תשלום</label>
                          <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-accent focus:ring-accent text-sm"
                          >
                            <option value="credit_card">כרטיס אשראי</option>
                            <option value="cash">מזומן</option>
                            <option value="bank_transfer">העברה בנקאית</option>
                          </select>
                        </div>
                        <div className="flex justify-between">
                          <button
                            onClick={() => setShowPaymentDetails(false)}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-1 px-2 rounded text-xs"
                          >
                            ביטול
                          </button>
                          <button
                            onClick={handleRecordPayment}
                            className="bg-green-600 hover:bg-green-700 text-white py-1 px-2 rounded text-xs"
                          >
                            שמירה
                          </button>
                        </div>
                      </div>
                    )}
                    
                    <p className="mt-1 text-sm text-gray-600">
                      תאריך יצירה: {formatDate(booking.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* בקשות מיוחדות */}
            {booking.specialRequests && (
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 mb-2">בקשות מיוחדות</h2>
                <p className="text-sm text-gray-600 whitespace-pre-line">{booking.specialRequests}</p>
              </div>
            )}

            {/* כפתורי פעולות */}
            <div className="p-6 bg-gray-50">
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => router.push(`/admin/bookings/${id}/edit`)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                >
                  עריכה מלאה
                </button>
                
                {booking.paymentStatus === 'pending' && (
                  <button
                    onClick={() => handlePaymentStatusChange('paid')}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none"
                  >
                    סמן כשולם
                  </button>
                )}
                
                {(booking.paymentStatus === 'paid' || booking.paymentStatus === 'pending') && (
                  <button
                    onClick={() => handlePaymentStatusChange('cancelled')}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                  >
                    ביטול הזמנה
                  </button>
                )}
                
                {booking.paymentStatus === 'paid' && (
                  <button
                    onClick={() => handlePaymentStatusChange('refunded')}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                  >
                    החזר כספי
                  </button>
                )}
                
                {!booking.isCheckedIn && booking.status !== 'cancelled' && (
                  <button
                    onClick={() => handleBookingStatusChange('checkedIn')}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none"
                  >
                    צ'ק-אין
                  </button>
                )}
                
                {booking.isCheckedIn && !booking.isCheckedOut && (
                  <button
                    onClick={() => handleBookingStatusChange('checkedOut')}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none"
                  >
                    צ'ק-אאוט
                  </button>
                )}
                
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none"
                >
                  <HiOutlineTrash className="ml-2 -mr-1 h-5 w-5" />
                  מחיקת הזמנה
                </button>
              </div>
              
              {/* חלונית אישור מחיקה */}
              {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">אישור מחיקת הזמנה</h3>
                    <p className="text-gray-600 mb-6">
                      האם אתה בטוח שברצונך למחוק את ההזמנה? פעולה זו אינה ניתנת לביטול.
                    </p>
                    <div className="flex justify-end gap-4">
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                      >
                        ביטול
                      </button>
                      <button
                        onClick={() => {
                          setShowDeleteConfirm(false);
                          handleDeleteBooking();
                        }}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none"
                      >
                        מחק הזמנה
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-custom p-8 text-center">
            <div className="text-gray-500 mb-4 text-xl">
              <HiOutlineDocumentText className="mx-auto h-12 w-12" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">הזמנה לא נמצאה</h2>
            <p className="text-gray-600 mb-4">לא ניתן למצוא את ההזמנה המבוקשת</p>
            <button
              onClick={() => router.push('/admin/bookings')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent hover:bg-accent-dark focus:outline-none"
            >
              <HiOutlineArrowRight className="ml-2 -mr-1 h-5 w-5" />
              חזרה לרשימת ההזמנות
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BookingDetails; 