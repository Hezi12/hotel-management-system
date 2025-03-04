import React, { useState, useEffect, useMemo } from 'react';
import { 
  FaChevronLeft, 
  FaChevronRight, 
  FaCalendarAlt,
  FaCheck,
  FaClock,
  FaMoneyBillWave,
  FaTimesCircle,
  FaExclamationTriangle,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCreditCard,
  FaCalendarCheck,
  FaCalendarTimes,
  FaUsers,
  FaShekelSign,
  FaListAlt,
  FaTimes,
  FaUserAlt,
  FaBed,
  FaSignInAlt,
  FaSignOutAlt,
  FaEdit,
  FaMoneyBillAlt
} from 'react-icons/fa';
import { HiOutlineDocumentText, HiOutlineTrash, HiOutlinePencil, HiOutlineCash, HiOutlineDocument, HiOutlineCreditCard } from 'react-icons/hi';
import { format, addDays, subDays, eachDayOfInterval, isSameDay, isWithinInterval, differenceInDays } from 'date-fns';
import { he } from 'date-fns/locale';
import { updateBookingStatus, checkInBooking, checkOutBooking, updateBooking, updateBookingPaymentStatus, deleteBooking, isDevelopmentMode } from '../../lib/api';
import { toast } from 'react-toastify';

// מיפוי צבעים למצבי הזמנה
const statusColors = {
  confirmed: 'bg-green-500',    // ירוק - מאושר
  pending: 'bg-yellow-400',     // צהוב - ממתין
  checkedIn: 'bg-blue-500',     // כחול - בצ'ק אין
  checkedOut: 'bg-gray-400',    // אפור - בצ'ק אאוט
  cancelled: 'bg-red-500',      // אדום - מבוטל
  noShow: 'bg-orange-500',      // כתום - לא הגיע
  default: 'bg-purple-500'      // סגול - ברירת מחדל
};

// פונקציית עזר לפורמט תאריכים בעברית
const formatDateHe = (date, formatStr = 'dd/MM') => {
  try {
    return format(new Date(date), formatStr, { locale: he });
  } catch (error) {
    console.error('שגיאה בפורמט תאריך:', error);
    return '';
  }
};

// פונקציה שמחזירה את סטטוס הצבע של ההזמנה
const getStatusColor = (status) => {
  return statusColors[status?.toLowerCase()] || statusColors.default;
};

// רכיב להצגת מידע על סטטוס ההזמנה
const StatusBadge = ({ status }) => {
  const statusMap = {
    confirmed: { text: 'מאושר', color: 'bg-green-500' },
    pending: { text: 'ממתין', color: 'bg-yellow-400' },
    checkedIn: { text: 'בצ׳ק-אין', color: 'bg-blue-500' },
    checkedOut: { text: 'צ׳ק-אאוט', color: 'bg-gray-400' },
    cancelled: { text: 'מבוטל', color: 'bg-red-500' },
    noShow: { text: 'לא הגיע', color: 'bg-orange-500' },
    paid: { text: 'שולם', color: 'bg-green-500' },
    refunded: { text: 'הוחזר', color: 'bg-purple-500' }
  };

  const { text, color } = statusMap[status?.toLowerCase()] || { text: status, color: 'bg-gray-500' };

  return (
    <span className={`${color} text-white text-xs px-2 py-1 rounded-full`}>
      {text}
    </span>
  );
};

// רכיב מודאל להצגת פרטי הזמנה
const BookingDetailsModal = ({ booking, room, isOpen, onClose, onBookingUpdated }) => {
  const [showPriceEdit, setShowPriceEdit] = useState(false);
  const [newPrice, setNewPrice] = useState(0);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [generatingInvoice, setGeneratingInvoice] = useState(false);

  // מאתחל את מחיר ברירת המחדל כאשר הפופאפ נפתח
  useEffect(() => {
    if (booking && isOpen) {
      setNewPrice(booking.totalPrice);
      setPaymentAmount(booking.totalPrice);
    }
  }, [booking, isOpen]);

  if (!isOpen || !booking) return null;

  // פונקציה לעדכון סטטוס ההזמנה
  const handleUpdateStatus = async (newStatus) => {
    try {
      // שליחת בקשה לעדכון הסטטוס ב-API
      await updateBookingStatus(booking._id, newStatus);
      
      // עדכון המידע המוצג למשתמש
      toast.success(`סטטוס ההזמנה עודכן ל-${newStatus}`);
      
      // קריאה לפונקציה שתעדכן את נתוני ההזמנות בקומפוננטה האב
      if (onBookingUpdated) {
        onBookingUpdated({
          ...booking,
          status: newStatus
        });
      }
    } catch (error) {
      console.error('שגיאה בעדכון סטטוס ההזמנה:', error);
      toast.error('אירעה שגיאה בעדכון הסטטוס');
    }
  };

  // פונקציה לביצוע צ'ק-אין
  const handleCheckIn = async () => {
    try {
      // שליחת בקשה לצ'ק-אין ב-API
      const updatedBooking = await checkInBooking(booking._id);
      
      // עדכון המידע המוצג למשתמש
      toast.success('בוצע צ\'ק-אין בהצלחה');
      
      // קריאה לפונקציה שתעדכן את נתוני ההזמנות בקומפוננטה האב
      if (onBookingUpdated) {
        onBookingUpdated({
          ...booking,
          status: 'checkedIn',
          isCheckedIn: true,
          checkedInAt: new Date()
        });
      }
    } catch (error) {
      console.error('שגיאה בביצוע צ\'ק-אין:', error);
      toast.error('אירעה שגיאה בביצוע צ\'ק-אין');
    }
  };

  // פונקציה לביצוע צ'ק-אאוט
  const handleCheckOut = async () => {
    try {
      // שליחת בקשה לצ'ק-אאוט ב-API
      const updatedBooking = await checkOutBooking(booking._id);
      
      // עדכון המידע המוצג למשתמש
      toast.success('בוצע צ\'ק-אאוט בהצלחה');
      
      // קריאה לפונקציה שתעדכן את נתוני ההזמנות בקומפוננטה האב
      if (onBookingUpdated) {
        onBookingUpdated({
          ...booking,
          status: 'checkedOut',
          isCheckedOut: true,
          checkedOutAt: new Date()
        });
      }
    } catch (error) {
      console.error('שגיאה בביצוע צ\'ק-אאוט:', error);
      toast.error('אירעה שגיאה בביצוע צ\'ק-אאוט');
    }
  };

  // פונקציה למחיקת הזמנה
  const handleDeleteBooking = async () => {
    try {
      await deleteBooking(booking._id);
      toast.success('ההזמנה נמחקה בהצלחה');
      onClose(); // סגירת הפופאפ
      
      // עדכון הקומפוננטה האב למחיקת ההזמנה מהתצוגה
      if (onBookingUpdated) {
        onBookingUpdated(null, true); // הפרמטר השני מציין שמדובר במחיקה
      }
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
      await updateBooking(booking._id, { totalPrice: Number(newPrice) });
      
      toast.success('המחיר עודכן בהצלחה');
      setShowPriceEdit(false);
      
      // עדכון הקומפוננטה האב
      if (onBookingUpdated) {
        onBookingUpdated({
          ...booking,
          totalPrice: Number(newPrice)
        });
      }
    } catch (error) {
      console.error('שגיאה בעדכון המחיר:', error);
      toast.error('שגיאה בעדכון המחיר');
    }
  };
  
  // פונקציה ליצירת חשבונית
  const generateInvoice = async () => {
    setGeneratingInvoice(true);
    try {
      // סימולציה של פעולה שלוקחת זמן
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // ייצור חשבונית בסיסית כ-HTML
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
      
      // הוספת כפתור להורדה כ-PDF
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
  const handleRecordPayment = async () => {
    try {
      if (paymentAmount <= 0) {
        toast.error('סכום התשלום חייב להיות גדול מאפס');
        return;
      }
      
      // תיעוד התשלום
      await updateBookingPaymentStatus(booking._id, 'paid');
      
      toast.success(`נרשם תשלום על סך ₪${paymentAmount} באמצעות ${paymentMethod === 'credit_card' ? 'כרטיס אשראי' : paymentMethod === 'cash' ? 'מזומן' : 'העברה בנקאית'}`);
      
      setShowPaymentDetails(false);
      
      // עדכון הקומפוננטה האב
      if (onBookingUpdated) {
        onBookingUpdated({
          ...booking,
          paymentStatus: 'paid',
          paymentMethod: paymentMethod
        });
      }
    } catch (error) {
      console.error('שגיאה ברישום התשלום:', error);
      toast.error('שגיאה ברישום התשלום');
    }
  };

  // האם ההזמנה בסטטוס שמאפשר לבצע צ'ק-אין
  const canCheckIn = booking.status === 'confirmed' && !booking.isCheckedIn;
  
  // האם ההזמנה בסטטוס שמאפשר לבצע צ'ק-אאוט
  const canCheckOut = booking.isCheckedIn && !booking.isCheckedOut;
  
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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4 text-center">
        {/* שכבת Overlay */}
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        {/* תוכן החלונית */}
        <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-right bg-white rounded-lg shadow-xl transform transition-all">
          {/* כותרת */}
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none transition ease-in-out duration-150"
            >
              <span className="text-2xl">&times;</span>
            </button>
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              פרטי הזמנה: {booking.confirmationCode}
            </h3>
          </div>

          {/* פרטי ההזמנה */}
          <div className="mt-2 border-b border-gray-200 pb-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center mb-3">
                  <FaUserAlt className="text-gray-500 ml-2" />
                  <h4 className="font-medium text-gray-700">פרטי אורח</h4>
                </div>
                <p className="text-sm text-gray-600">שם: {booking.guestName}</p>
                {booking.guestEmail && <p className="text-sm text-gray-600">אימייל: {booking.guestEmail}</p>}
                {booking.guestPhone && <p className="text-sm text-gray-600">טלפון: {booking.guestPhone}</p>}
              </div>
              
              <div>
                <div className="flex items-center mb-3">
                  <FaCalendarAlt className="text-gray-500 ml-2" />
                  <h4 className="font-medium text-gray-700">פרטי שהייה</h4>
                </div>
                <p className="text-sm text-gray-600">
                  תאריך הגעה: {new Date(booking.checkIn).toLocaleDateString('he-IL')}
                </p>
                <p className="text-sm text-gray-600">
                  תאריך עזיבה: {new Date(booking.checkOut).toLocaleDateString('he-IL')}
                </p>
                <p className="text-sm text-gray-600">
                  מספר לילות: {Math.ceil((new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24))}
                </p>
              </div>
            </div>
          </div>

          {/* פרטי חדר ותשלום */}
          <div className="mt-4 border-b border-gray-200 pb-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center mb-3">
                  <FaBed className="text-gray-500 ml-2" />
                  <h4 className="font-medium text-gray-700">פרטי חדר</h4>
                </div>
                <p className="text-sm text-gray-600">מספר חדר: {booking.roomNumber}</p>
                <p className="text-sm text-gray-600">סוג חדר: {booking.roomType}</p>
                <p className="text-sm text-gray-600">מספר אורחים: {booking.numGuests}</p>
              </div>
              
              <div>
                <div className="flex items-center mb-3">
                  <FaMoneyBillAlt className="text-gray-500 ml-2" />
                  <h4 className="font-medium text-gray-700">פרטי תשלום</h4>
                </div>
                
        <div className="flex items-center">
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
                    אמצעי תשלום: {booking.paymentMethod === 'credit_card' ? 'כרטיס אשראי' : booking.paymentMethod === 'cash' ? 'מזומן' : 'העברה בנקאית'}
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
                    
                    {showPaymentDetails && booking.paymentDetails && (
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
              </div>
            </div>
          </div>

          {/* בקשות מיוחדות */}
          {booking.specialRequests && (
            <div className="mt-4 border-b border-gray-200 pb-4">
              <div className="flex items-center mb-2">
                <FaExclamationTriangle className="text-gray-500 ml-2" />
                <h4 className="font-medium text-gray-700">בקשות מיוחדות</h4>
              </div>
              <p className="text-sm text-gray-600">{booking.specialRequests}</p>
            </div>
          )}

          {/* כפתורי תיעוד תשלום */}
          <div className="mt-4 border-b border-gray-200 pb-4">
            <button
              onClick={() => setShowPaymentDetails(!showPaymentDetails)}
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              <HiOutlineCash className="ml-1 h-4 w-4" />
              {showPaymentDetails ? 'הסתר תיעוד תשלום' : 'תיעוד תשלום'}
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
          </div>

          {/* כפתורי פעולות */}
          <div className="mt-5">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="flex flex-wrap gap-2">
                  {/* כפתור צ'ק-אין */}
                  {canCheckIn && (
                    <button
                      onClick={handleCheckIn}
                      className="inline-flex items-center justify-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                    >
                      <FaSignInAlt className="ml-1" />
                      צ'ק-אין
                    </button>
                  )}
                  
                  {/* כפתור צ'ק-אאוט */}
                  {canCheckOut && (
                    <button
                      onClick={handleCheckOut}
                      className="inline-flex items-center justify-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none"
                    >
                      <FaSignOutAlt className="ml-1" />
                      צ'ק-אאוט
                    </button>
                  )}
                  
                  {/* כפתור שינוי סטטוס תשלום */}
                  {booking.paymentStatus === 'pending' && (
                    <button
                      onClick={() => handleUpdateStatus('paid')}
                      className="inline-flex items-center justify-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none"
                    >
                      סמן כשולם
                    </button>
                  )}
                </div>
              </div>
              
              <div>
                <div className="flex flex-wrap gap-2 justify-end">
                  {/* כפתור יצירת חשבונית */}
                  <button
                    onClick={generateInvoice}
                    disabled={generatingInvoice}
                    className="inline-flex items-center justify-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:opacity-50"
                  >
                    <HiOutlineDocument className="ml-1 h-4 w-4" />
                    {generatingInvoice ? 'מייצר...' : 'חשבונית'}
                  </button>
                  
                  {/* כפתור עריכה מלאה */}
                  <button
                    onClick={() => window.location.href = `/admin/bookings/${booking._id}`}
                    className="inline-flex items-center justify-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                  >
                    <FaEdit className="ml-1" />
                    עריכה מלאה
                  </button>
                  
                  {/* כפתור מחיקה */}
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="inline-flex items-center justify-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none"
                  >
                    <HiOutlineTrash className="ml-1 h-4 w-4" />
                    מחיקה
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* דיאלוג אישור מחיקה */}
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
  );
};

// רכיב תצוגה של הזמנה בודדת בתוך הלוח
const BookingCell = ({ booking, day, onClick }) => {
  // בדיקה אם היום הנוכחי כלול בטווח ההזמנה
  const isInBookingRange = isWithinInterval(day, {
    start: new Date(booking.checkIn),
    end: new Date(booking.checkOut)
  });

  if (!isInBookingRange) return null;

  // בדיקה אם זה היום הראשון או האחרון של ההזמנה
  const isFirstDay = isSameDay(day, new Date(booking.checkIn));
  const isLastDay = isSameDay(day, new Date(booking.checkOut));

  const statusColor = getStatusColor(booking.status);
  let borderClasses = '';
  
  // ריבוע מלא או חלקי לפי המיקום בהזמנה
  if (isFirstDay && isLastDay) {
    // הזמנה של יום אחד
    borderClasses = 'rounded-md';
  } else if (isFirstDay) {
    // היום הראשון - עיגול משמאל
    borderClasses = 'rounded-r-none rounded-l-md border-l border-t border-b';
  } else if (isLastDay) {
    // היום האחרון - עיגול מימין
    borderClasses = 'rounded-l-none rounded-r-md border-r border-t border-b';
  } else {
    // באמצע ההזמנה - ריבוע
    borderClasses = 'rounded-none border-t border-b';
  }

  // מחשב את כמות הימים בהזמנה
  const daysInBooking = Math.round(
    (new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24)
  );

  return (
    <div 
      className={`absolute inset-0 flex items-center justify-center ${statusColor} ${borderClasses} shadow-sm cursor-pointer text-white m-0.5 overflow-hidden hover:opacity-90 transition-opacity`}
      onClick={() => onClick(booking)}
    >
      {/* אנחנו מציגים את שם האורח בשני מצבים:
          1. ביום הראשון של ההזמנה
          2. כאשר ההזמנה ארוכה מספיק (יותר מ-3 ימים) ולא מדובר ביום הראשון או האחרון */}
      {(isFirstDay || (!isFirstDay && !isLastDay && daysInBooking > 3)) && (
        <div className="truncate px-1 text-xs font-medium leading-tight">
          {booking.guestName}
        </div>
      )}
    </div>
  );
};

// style עבור התפריט הנפתח
const GlobalStyle = () => (
  <style jsx global>{`
    .dropdown:hover .dropdown-menu {
      display: block;
    }
  `}</style>
);

const BookingCalendar = ({ 
  bookings = [], 
  rooms = [], 
  dateRange, 
  onDateRangeChange,
  isLoading 
}) => {
  // מספר ימים בטבלה
  const DAYS_TO_SHOW = 14;
  
  // תאריך התחלתי לטבלה (היום הראשון שיוצג)
  const [startDate, setStartDate] = useState(dateRange?.start || new Date());
  
  // מצב המודאל
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // מערך ההזמנות שיוצגו (עם אפשרות לעדכון)
  const [displayedBookings, setDisplayedBookings] = useState(bookings);
  
  // עדכון מערך ההזמנות כאשר הוא משתנה מבחוץ
  useEffect(() => {
    setDisplayedBookings(bookings);
  }, [bookings]);
  
  // חישוב כל התאריכים שיוצגו בטבלה
  const daysToDisplay = useMemo(() => {
    return eachDayOfInterval({
      start: startDate,
      end: addDays(startDate, DAYS_TO_SHOW - 1)
    });
  }, [startDate, DAYS_TO_SHOW]);
  
  // עדכון טווח התאריכים בקונטקסט כאשר טווח התצוגה משתנה
  useEffect(() => {
    if (onDateRangeChange && dateRange) {
      // בודק אם כבר יש ערכים ורק אם הם שונים מהנוכחיים - מעדכן
      const currentEndDate = addDays(startDate, DAYS_TO_SHOW - 1);
      
      // רק אם התאריכים שונים מאלו שכבר קיימים בקונטקסט, מעדכן אותם
      if (!dateRange.start || 
          !dateRange.end || 
          !isSameDay(startDate, dateRange.start) || 
          !isSameDay(currentEndDate, dateRange.end)) {
        onDateRangeChange(startDate, currentEndDate);
      }
    }
  }, [startDate, DAYS_TO_SHOW, onDateRangeChange, dateRange]);

  // פונקציה להזזת הלוח קדימה בזמן
  const moveForward = () => {
    setStartDate(prevDate => addDays(prevDate, DAYS_TO_SHOW));
  };

  // פונקציה להזזת הלוח אחורה בזמן
  const moveBackward = () => {
    setStartDate(prevDate => subDays(prevDate, DAYS_TO_SHOW));
  };

  // פונקציה לקפיצה להיום
  const jumpToToday = () => {
    setStartDate(new Date());
  };

  // פונקציה לטיפול בלחיצה על הזמנה
  const handleBookingClick = (booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };
  
  // פונקציה לסגירת המודאל
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
  };
  
  // פונקציה לעדכון הזמנה לאחר פעולה במודאל
  const handleBookingUpdated = (updatedBooking, isDeleted = false) => {
    // אם ההזמנה נמחקה, מסירים אותה מהרשימה
    if (isDeleted) {
      setDisplayedBookings(prevBookings => 
        prevBookings.filter(booking => booking._id !== selectedBooking._id)
      );
      setSelectedBooking(null);
      setIsModalOpen(false);
      return;
    }
    
    // אם ההזמנה עודכנה, מעדכנים אותה ברשימה
    if (updatedBooking) {
      setDisplayedBookings(prevBookings => 
        prevBookings.map(booking => 
          booking._id === updatedBooking._id ? updatedBooking : booking
        )
      );
      setSelectedBooking(updatedBooking);
    }
  };
  
  // מציאת פרטי החדר עבור ההזמנה הנבחרת
  const selectedRoom = selectedBooking 
    ? rooms.find(room => room._id === selectedBooking.roomId) 
    : null;
  
  // אם אין חדרים או הנתונים עדיין נטענים
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">טוען...</span>
        </div>
      </div>
    );
  }

  // בדיקה אם בחדר הזה יש הזמנה בתאריך ספציפי
  const hasBookingInRange = (roomId, date) => {
    return displayedBookings.some(booking => {
      // בדיקה אם ההזמנה שייכת לחדר הנוכחי
      const isCorrectRoom = booking.roomId === roomId || booking.room?._id === roomId;
      
      // אם אין לנו נתוני roomId, ננסה להשוות לפי roomNumber
      const room = rooms.find(r => r._id === roomId);
      const roomNumber = room?.roomNumber;
      const isCorrectRoomByNumber = roomNumber && booking.roomNumber === roomNumber;
      
      if (!isCorrectRoom && !isCorrectRoomByNumber) return false;
      
      // המרת התאריכים למספרים לצורך השוואה
      const bookingStart = new Date(booking.checkIn).setHours(0, 0, 0, 0);
      const bookingEnd = new Date(booking.checkOut).setHours(0, 0, 0, 0);
      const currentDate = new Date(date).setHours(0, 0, 0, 0);
      
      // בדיקה אם התאריך הנוכחי נמצא בטווח ההזמנה
      return currentDate >= bookingStart && currentDate < bookingEnd;
    });
  };

  return (
    <div className="booking-calendar-container">
      <GlobalStyle />
      {/* כותרת וכפתורי ניווט */}
      <div className="flex justify-between items-center mb-4 px-2">
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <button 
            onClick={moveBackward} 
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <FaChevronRight className="h-5 w-5 text-gray-600" />
          </button>
          <button 
            onClick={moveForward} 
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <FaChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        
        <h3 className="text-lg font-medium text-gray-800 flex items-center">
          <FaCalendarAlt className="mr-2 text-blue-600" />
          {formatDateHe(daysToDisplay[0], 'dd/MM/yyyy')} - {formatDateHe(daysToDisplay[daysToDisplay.length - 1], 'dd/MM/yyyy')}
        </h3>
        
        <button 
          onClick={jumpToToday} 
          className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
        >
          היום
        </button>
      </div>

      {/* טבלת לוח השנה */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed border-collapse">
            <thead>
              <tr className="bg-gray-50">
                {/* תא כותרת לשמות החדרים */}
                <th className="border-b border-r border-gray-200 bg-gray-50 min-w-[100px] py-2 px-3 text-right font-medium text-gray-500 text-sm">
                  חדר/תאריך
                </th>
                
                {/* כותרות של תאריכים */}
                {daysToDisplay.map((day, index) => (
                  <th 
                    key={day.toISOString()} 
                    className={`border-b border-gray-200 p-1 text-center font-medium text-gray-500 text-sm w-[80px] ${
                      isSameDay(day, new Date()) ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-xs">{formatDateHe(day, 'EEEE')}</span>
                      <span className="text-sm font-bold">{formatDateHe(day, 'dd/MM')}</span>
            </div>
                  </th>
                ))}
              </tr>
            </thead>
            
            <tbody>
              {/* שורות החדרים */}
              {rooms.map((room) => (
                <tr key={room._id} className="border-b border-gray-100 hover:bg-gray-50">
                  {/* שם החדר */}
                  <td className="border-r border-gray-200 p-2 text-gray-800 font-medium">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold">דירה {room.roomNumber}</span>
                      <span className="text-xs text-gray-500">{room.type}</span>
                </div>
                  </td>
                  
                  {/* תאי לוח השנה לכל תאריך */}
                  {daysToDisplay.map((day) => {
                    // מציאת כל ההזמנות שקשורות לחדר הזה ביום הזה
                    const roomBookings = displayedBookings.filter(booking => 
                      booking.roomId === room._id &&
                      isWithinInterval(day, {
                        start: new Date(booking.checkIn),
                        end: new Date(booking.checkOut)
                      })
                    );

                    return (
                      <td 
                        key={day.toISOString()} 
                        className={`border border-gray-100 p-0 relative h-12 ${
                          isSameDay(day, new Date()) ? 'bg-blue-50' : ''
                        }`}
                      >
                        {/* אם יש הזמנות באותו יום */}
                        {roomBookings.map((booking) => (
                          <BookingCell
                            key={booking._id}
                            booking={booking}
                            day={day}
                            onClick={handleBookingClick}
                          />
                        ))}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
              </div>
      </div>

      {/* מקרא */}
      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
        <span className="font-medium text-gray-600">מקרא:</span>
          <div className="flex items-center">
          <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"></span>
          <span>מאושר</span>
          </div>
          <div className="flex items-center">
          <span className="inline-block w-3 h-3 rounded-full bg-yellow-400 mr-1"></span>
          <span>ממתין</span>
          </div>
          <div className="flex items-center">
          <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-1"></span>
          <span>צ'ק-אין</span>
          </div>
          <div className="flex items-center">
          <span className="inline-block w-3 h-3 rounded-full bg-gray-400 mr-1"></span>
          <span>צ'ק-אאוט</span>
          </div>
          <div className="flex items-center">
          <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1"></span>
          <span>מבוטל</span>
        </div>
      </div>
      
      {/* מודאל פרטי הזמנה */}
      <BookingDetailsModal 
        booking={selectedBooking}
        room={selectedRoom}
        isOpen={isModalOpen}
        onClose={closeModal}
        onBookingUpdated={handleBookingUpdated}
      />
    </div>
  );
};

export default BookingCalendar; 