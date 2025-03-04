import React, { createContext, useState, useContext, useEffect } from 'react';
import { addDays, startOfMonth, endOfMonth } from 'date-fns';
import { fetchAllBookings, fetchAllRooms, isDevelopmentMode } from '../lib/api';
import { useAuth } from './AuthContext';

// יצירת קונטקסט להזמנות
const BookingCalendarContext = createContext();

// פונקציית עזר לשימוש בקונטקסט
export const useBookingCalendar = () => useContext(BookingCalendarContext);

export const BookingCalendarProvider = ({ children }) => {
  const { isAuthenticated, isAdminOrManager } = useAuth();
  
  // ניהול מצב הנתונים
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [dateRange, setDateRange] = useState({
    start: startOfMonth(new Date()),
    end: endOfMonth(addDays(new Date(), 30))
  });
  const [loading, setLoading] = useState({
    bookings: false,
    rooms: false
  });
  const [error, setError] = useState(null);

  // פונקציה לעדכון טווח תאריכים
  const updateDateRange = (start, end) => {
    setDateRange({ start, end });
  };

  // בדיקה אם המשתמש מורשה לצפות בלוח ההזמנות
  const hasCalendarAccess = () => {
    // במצב פיתוח, תמיד מאפשר גישה
    if (isDevelopmentMode()) {
      return true;
    }
    
    // בסביבת ייצור, בודק הרשאות
    return isAuthenticated && isAdminOrManager();
  };

  // טעינת נתוני הזמנות
  const loadBookings = async () => {
    // מאפשר למשתמשים במצב פיתוח לראות הזמנות גם בלי התחברות
    if (!hasCalendarAccess()) return;

    try {
      setLoading(prev => ({ ...prev, bookings: true }));
      const data = await fetchAllBookings();
      setBookings(data);
    } catch (err) {
      console.error('שגיאה בטעינת הזמנות:', err);
      setError('לא ניתן לטעון הזמנות');
    } finally {
      setLoading(prev => ({ ...prev, bookings: false }));
    }
  };

  // טעינת נתוני חדרים
  const loadRooms = async () => {
    // מאפשר למשתמשים במצב פיתוח לראות חדרים גם בלי התחברות
    if (!hasCalendarAccess()) return;

    try {
      setLoading(prev => ({ ...prev, rooms: true }));
      const data = await fetchAllRooms();
      setRooms(data);
    } catch (err) {
      console.error('שגיאה בטעינת חדרים:', err);
      setError('לא ניתן לטעון חדרים');
    } finally {
      setLoading(prev => ({ ...prev, rooms: false }));
    }
  };

  // טעינת כל הנתונים מחדש
  const refreshData = () => {
    loadBookings();
    loadRooms();
  };

  // טעינה ראשונית כאשר הקומפוננטה מתחילה
  useEffect(() => {
    // מאפשר למשתמשים במצב פיתוח לראות הזמנות גם בלי התחברות
    if (hasCalendarAccess()) {
      loadBookings();
      loadRooms();
    }
  }, [isAuthenticated, isAdminOrManager]);

  // הערכים שיוחזרו מהקונטקסט
  const value = {
    bookings,
    rooms,
    dateRange,
    loading,
    error,
    updateDateRange,
    refreshData
  };

  return (
    <BookingCalendarContext.Provider value={value}>
      {children}
    </BookingCalendarContext.Provider>
  );
};

export default BookingCalendarProvider; 