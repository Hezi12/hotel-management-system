import { useState, useRef, useEffect } from 'react';
import { HiOutlineChevronDown, HiCheck } from 'react-icons/hi';
import { updateBookingStatus, updateBookingPaymentStatus } from '../../lib/api';
import { toast } from 'react-toastify';

/**
 * קומפוננטת דרופדאון לשינוי סטטוס
 * @param {string} type - סוג הסטטוס (booking או payment)
 * @param {string} current - הסטטוס הנוכחי
 * @param {string} bookingId - מזהה ההזמנה
 * @param {function} onUpdate - פונקציה שתופעל לאחר עדכון הסטטוס
 * @param {object} options - אפשרויות הדרופדאון
 */
const BookingStatusDropdown = ({ type, current, bookingId, onUpdate, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const statusOptions = options || (
    type === 'payment' 
      ? [
          { value: 'pending', label: 'ממתין לתשלום', color: 'bg-yellow-100 text-yellow-800' },
          { value: 'paid', label: 'שולם', color: 'bg-green-100 text-green-800' },
          { value: 'refunded', label: 'זוכה', color: 'bg-blue-100 text-blue-800' },
          { value: 'cancelled', label: 'בוטל', color: 'bg-red-100 text-red-800' }
        ] 
      : [
          { value: 'confirmed', label: 'מאושר', color: 'bg-green-100 text-green-800' },
          { value: 'checkedIn', label: 'התקבל', color: 'bg-purple-100 text-purple-800' },
          { value: 'checkedOut', label: 'עזב', color: 'bg-blue-100 text-blue-800' },
          { value: 'cancelled', label: 'בוטל', color: 'bg-red-100 text-red-800' }
        ]
  );

  // התאמה של תווית הסטטוס הנוכחי
  const currentStatus = statusOptions.find(option => option.value === current) || statusOptions[0];

  // טיפול בלחיצה מחוץ לדרופדאון
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // פונקציה לשינוי סטטוס
  const handleStatusChange = async (newStatus) => {
    if (newStatus === current) {
      setIsOpen(false);
      return;
    }

    setLoading(true);
    
    try {
      if (type === 'payment') {
        await updateBookingPaymentStatus(bookingId, newStatus);
        toast.success(`סטטוס התשלום עודכן ל-${statusOptions.find(o => o.value === newStatus).label}`);
      } else {
        await updateBookingStatus(bookingId, newStatus);
        toast.success(`סטטוס ההזמנה עודכן ל-${statusOptions.find(o => o.value === newStatus).label}`);
      }
      
      if (onUpdate) {
        onUpdate(newStatus);
      }
    } catch (error) {
      console.error(`שגיאה בעדכון סטטוס ${type === 'payment' ? 'תשלום' : 'הזמנה'}:`, error);
      toast.error(`שגיאה בעדכון סטטוס ${type === 'payment' ? 'תשלום' : 'הזמנה'}`);
    } finally {
      setLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative inline-block text-right" ref={dropdownRef}>
      <div>
        <button
          type="button"
          className={`${currentStatus.color} px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 transition-all ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}`}
          onClick={() => setIsOpen(!isOpen)}
          disabled={loading}
        >
          {currentStatus.label}
          {!loading && <HiOutlineChevronDown className="ml-1 h-3 w-3" />}
          {loading && <span className="animate-spin ml-1 h-3 w-3 border-2 border-current rounded-full border-t-transparent"></span>}
        </button>
      </div>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1" role="menu" aria-orientation="vertical">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                className={`w-full text-right px-4 py-2 text-sm ${
                  current === option.value
                    ? 'bg-gray-100 text-gray-900 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                } flex items-center justify-between`}
                onClick={() => handleStatusChange(option.value)}
              >
                <span className={`px-1.5 py-0.5 rounded-full ${option.color}`}>
                  {option.label}
                </span>
                {current === option.value && <HiCheck className="h-4 w-4" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingStatusDropdown; 