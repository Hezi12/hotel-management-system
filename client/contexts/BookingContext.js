import { createContext, useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import { fetchAvailableRooms, createBooking } from '../lib/api';

const BookingContext = createContext();

export const useBooking = () => {
  return useContext(BookingContext);
};

export const BookingProvider = ({ children }) => {
  // תאריכי החיפוש
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [guests, setGuests] = useState(2); // ברירת מחדל - זוג
  
  // רשימת חדרים זמינים
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // פרטי ההזמנה הנוכחית
  const [currentBooking, setCurrentBooking] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  
  // ניקוי של הנתונים בזמן החלפת דף
  const clearBookingData = () => {
    setCheckIn(null);
    setCheckOut(null);
    setSelectedRoom(null);
    setCurrentBooking(null);
  };
  
  // פונקציה לחיפוש חדרים זמינים
  const searchAvailableRooms = async (checkInDate, checkOutDate) => {
    try {
      setLoading(true);
      
      if (!checkInDate || !checkOutDate) {
        toast.error('יש לבחור תאריכי צ\'ק-אין וצ\'ק-אאוט');
        return [];
      }
      
      // וידוא שתאריך צ'ק-אין קודם לתאריך צ'ק-אאוט
      if (new Date(checkInDate) >= new Date(checkOutDate)) {
        toast.error("תאריך צ'ק-אין חייב להיות לפני תאריך צ'ק-אאוט");
        return [];
      }
      
      // וידוא שתאריך צ'ק-אין לא בעבר
      if (new Date(checkInDate) < new Date().setHours(0, 0, 0, 0)) {
        toast.error('לא ניתן להזמין חדר בתאריך שעבר');
        return [];
      }
      
      // פורמט התאריכים ל-ISO
      const formattedCheckIn = new Date(checkInDate).toISOString();
      const formattedCheckOut = new Date(checkOutDate).toISOString();
      
      // שליחת הבקשה לשרת
      const rooms = await fetchAvailableRooms(formattedCheckIn, formattedCheckOut);
      
      // עדכון מצב החיפוש
      setCheckIn(checkInDate);
      setCheckOut(checkOutDate);
      setAvailableRooms(rooms);
      
      return rooms;
    } catch (error) {
      toast.error('שגיאה בחיפוש חדרים זמינים');
      console.error(error);
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  // פונקציה לבחירת חדר
  const selectRoom = (room) => {
    setSelectedRoom(room);
  };
  
  // פונקציה להגשת הזמנה חדשה
  const submitBooking = async (guestInfo) => {
    try {
      setLoading(true);
      
      if (!selectedRoom || !checkIn || !checkOut) {
        toast.error('נתוני ההזמנה חסרים, נא לבחור חדר ותאריכים');
        return null;
      }
      
      // חישוב מספר לילות
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      
      // חישוב מחיר כולל באמצעות הפונקציה הקיימת
      const totalPrice = calculateTotalPrice();
      
      // יצירת אובייקט ההזמנה
      const bookingData = {
        room: selectedRoom._id,
        checkIn: checkInDate.toISOString(),
        checkOut: checkOutDate.toISOString(),
        numberOfGuests: guests,
        totalPrice,
        ...guestInfo,
        bookingSource: 'website',
      };
      
      // שליחת ההזמנה לשרת
      const booking = await createBooking(bookingData);
      
      // שמירת ההזמנה שנוצרה במצב
      setCurrentBooking(booking);
      
      toast.success('ההזמנה בוצעה בהצלחה!');
      return booking;
    } catch (error) {
      const errorMessage = error.response?.data?.msg || 'שגיאה ביצירת ההזמנה. נסה שוב.';
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // חישוב של המחיר הכולל להזמנה נוכחית
  const calculateTotalPrice = () => {
    if (!selectedRoom || !checkIn || !checkOut) {
      return 0;
    }
    
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    
    let totalPrice = 0;
    let currentDate = new Date(checkInDate);
    
    // חישוב מחיר לכל לילה בנפרד כדי לתמוך בתוספת עבור ימי שישי
    for (let i = 0; i < nights; i++) {
      let nightPrice = selectedRoom.pricePerNight;
      
      // תוספת מחיר ליום שישי (יום 5)
      if (currentDate.getDay() === 5) {
        nightPrice += 100; // תוספת של 100 שקל ליום שישי
      }
      
      totalPrice += nightPrice;
      
      // קידום התאריך ליום הבא
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // תוספת עבור אורחים נוספים
    if (selectedRoom.extraBed && selectedRoom.extraBed.available && guests > 2) {
      const extraGuests = Math.min(guests - 2, selectedRoom.extraBed.maxCount);
      totalPrice += extraGuests * selectedRoom.extraBed.pricePerNight * nights;
    }
    
    return totalPrice;
  };
  
  // הערך שיועבר ל-Provider
  const value = {
    checkIn,
    setCheckIn,
    checkOut,
    setCheckOut,
    guests,
    setGuests,
    availableRooms,
    loading,
    currentBooking,
    selectedRoom,
    searchAvailableRooms,
    selectRoom,
    submitBooking,
    calculateTotalPrice,
    clearBookingData
  };
  
  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
}; 