import axios from 'axios';

// הגדרת מופע axios עם הגדרות בסיסיות
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  // הוספת timeout לבקשות
  timeout: 10000, // 10 שניות
});

// פונקציית עזר כללית לבדיקה אם המערכת במצב פיתוח
export const isDevelopmentMode = () => {
  return process.env.NODE_ENV === 'development';
};

// פונקציית עזר לטיפול בשגיאות API באופן עקבי
export const handleApiError = (error, fallbackValue = null, errorMessage = 'שגיאת שרת') => {
  // לוג השגיאה לקונסול במצב פיתוח
  if (isDevelopmentMode()) {
    console.error('API Error:', error.response?.data || error.message || error);
  }
  
  // החזר שגיאה באופן מסודר
  throw {
    status: error.response?.status || 500,
    message: error.response?.data?.msg || errorMessage,
    data: error.response?.data || {},
    originalError: error
  };
};

// הוספת Interceptor להוספת טוקן האימות לבקשות
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['x-auth-token'] = token;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// הוספת Interceptor לטיפול בשגיאות
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // יצירת הודעת שגיאה ידידותית למשתמש
    let errorMessage = 'שגיאה בתקשורת עם השרת';
    
    if (error.response) {
      // במקרה של תשובה עם קוד שגיאה מהשרת
      switch (error.response.status) {
        case 400:
          errorMessage = 'נתונים לא תקינים';
          break;
        case 401:
          errorMessage = 'אין הרשאת גישה. יש להתחבר מחדש';
          // ניתן להוסיף כאן ניווט לדף התחברות
          break;
        case 403:
          errorMessage = 'אין לך הרשאה לבצע פעולה זו';
          break;
        case 404:
          errorMessage = 'המשאב המבוקש לא נמצא';
          break;
        case 500:
          errorMessage = 'שגיאה פנימית בשרת';
          break;
        default:
          errorMessage = `שגיאה ${error.response.status}`;
      }
      
      // במקרה שיש הודעת שגיאה מפורטת מהשרת
      if (error.response.data && error.response.data.msg) {
        errorMessage = error.response.data.msg;
      }
    } else if (error.request) {
      // הבקשה יצאה אך לא התקבלה תשובה
      errorMessage = 'לא התקבלה תשובה מהשרת, נא לנסות שוב מאוחר יותר';
    }
    
    console.error(errorMessage, error);
    return Promise.reject(error);
  }
);

// פונקציות API לחדרים
export const fetchRooms = async () => {
  try {
    const response = await api.get('/rooms');
    return response.data;
  } catch (error) {
    // השתמש בפונקציית טיפול בשגיאות ובמצב פיתוח החזר נתוני דמו
    if (isDevelopmentMode()) {
      console.warn('Using demo data for rooms in development mode');
      return getFallbackRooms();
    }
    return handleApiError(error, [], 'שגיאה בטעינת החדרים');
  }
};

export const fetchRoomById = async (roomId) => {
  // במצב פיתוח, נחזיר נתוני דמה
  if (isDevelopmentMode()) {
    console.log(`Development mode: Using mock data for room ${roomId}`);
    const rooms = getFallbackRooms();
    const room = rooms.find(r => r._id === roomId) || rooms[0];
    return room;
  }

  // במצב ייצור, גישה רגילה לשרת
  try {
    const response = await api.get(`/rooms/${roomId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error, null, 'החדר המבוקש לא נמצא');
  }
};

export const fetchAvailableRooms = async (checkIn, checkOut) => {
  // במצב פיתוח, נחזיר נתוני דמה
  if (isDevelopmentMode()) {
    console.log('Development mode: Using mock data for available rooms');
    return getFallbackRooms();
  }

  // במצב ייצור, גישה רגילה לשרת
  try {
    const response = await api.get(`/rooms/available/${checkIn}/${checkOut}`);
    return response.data;
  } catch (error) {
    return handleApiError(error, [], 'שגיאה בחיפוש חדרים זמינים');
  }
};

// פונקציות API להזמנות
export const createBooking = async (bookingData) => {
  try {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  } catch (error) {
    if (isDevelopmentMode()) {
      console.warn('Using mock data for booking creation in development mode');
      // החזר אובייקט דמו של הזמנה עם קוד אישור
      
      // השג את החדר מתוך רשימת החדרים המדומים
      let bookingRoom = null;
      const rooms = getFallbackRooms();
      if (bookingData.roomId) {
        bookingRoom = rooms.find(room => room._id === bookingData.roomId);
      }
      
      if (!bookingRoom) {
        // אם לא נמצא חדר, השתמש בחדר הראשון כברירת מחדל
        bookingRoom = rooms[0];
        console.warn(`Room with ID ${bookingData.roomId} not found in mock data, using default room`);
      }

      const mockBooking = {
        _id: `mock-${Date.now()}`,
        confirmationCode: `DEMO${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        ...bookingData,
        roomId: bookingRoom._id, // עדכון שדה roomId
        room: bookingRoom, // הוספת אובייקט החדר המלא
        createdAt: new Date()
      };
      
      // שמירת ההזמנה המדומה ב-localStorage
      try {
        const existingBookings = JSON.parse(localStorage.getItem('devModeBookings') || '[]');
        existingBookings.push(mockBooking);
        localStorage.setItem('devModeBookings', JSON.stringify(existingBookings));
      } catch (storageError) {
        console.error('Error saving to localStorage:', storageError);
      }
      
      return mockBooking;
    }
    return handleApiError(error, null, 'שגיאה ביצירת ההזמנה');
  }
};

export const fetchBookingByCode = async (confirmationCode) => {
  try {
    const response = await api.get(`/bookings/confirmation/${confirmationCode}`);
    return response.data;
  } catch (error) {
    if (isDevelopmentMode() && confirmationCode.startsWith('DEMO')) {
      console.warn('Using mock data for booking confirmation in development mode');
      // בדיקה אם קיימת הזמנה מדומה בלוקל סטורג' עם קוד האישור המבוקש
      try {
        const bookings = JSON.parse(localStorage.getItem('devModeBookings') || '[]');
        const booking = bookings.find(b => b.confirmationCode === confirmationCode);
        if (booking) {
          return booking;
        }
      } catch (err) {
        console.error('Error retrieving bookings from localStorage:', err);
      }
      
      // אם לא נמצאה הזמנה, החזר הזמנה לדוגמה
      return {
        _id: `mock-${Date.now()}`,
        confirmationCode: confirmationCode,
        guestName: 'אורח לדוגמה',
        checkIn: new Date(),
        checkOut: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        room: getFallbackRooms()[0],
        totalPrice: 800,
        paymentStatus: 'paid',
        createdAt: new Date()
      };
    }
    return handleApiError(error, null, 'הזמנה לא נמצאה');
  }
};

// פונקציית עזר - נתוני חדרים לדוגמה במצב פיתוח
function getFallbackRooms() {
  return [
    { 
      _id: '1', 
      roomNumber: '1', 
      type: 'זוגי', 
      capacity: 2, 
      pricePerNight: 400, 
      description: 'חדר זוגי עם מיטה זוגית, מטבחון קטן, שירותים ומקלחת.',
      isActive: true,
      amenities: ['Wi-Fi', 'מקלחת', 'מיזוג אוויר', 'מטבחון'],
      mainImage: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    { 
      _id: '6', 
      roomNumber: '6', 
      type: 'משפחתי', 
      capacity: 3, 
      pricePerNight: 500, 
      description: 'חדר משפחתי קומפקטי עם מיטה זוגית ומיטת יחיד, מטבחון, שירותים ומקלחת.',
      isActive: true,
      amenities: ['Wi-Fi', 'מקלחת', 'מיזוג אוויר', 'מטבחון', 'טלוויזיה'],
      mainImage: "https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    { 
      _id: '13', 
      roomNumber: '13', 
      type: 'משפחתי', 
      capacity: 4, 
      pricePerNight: 600, 
      description: 'חדר משפחתי מרווח עם מיטה זוגית ושתי מיטות יחיד, מטבחון, פינת ישיבה, שירותים ומקלחת.',
      isActive: true,
      amenities: ['Wi-Fi', 'מקלחת', 'מיזוג אוויר', 'מטבחון', 'פינת ישיבה'],
      mainImage: "https://images.unsplash.com/photo-1586105251261-72a756497a11?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    { 
      _id: '17', 
      roomNumber: '17', 
      type: 'זוגי פלוס', 
      capacity: 2, 
      pricePerNight: 450, 
      description: 'חדר זוגי מרווח עם מיטה זוגית רחבה, פינת ישיבה, מטבחון, שירותים ומקלחת מפנקת.',
      isActive: true,
      amenities: ['Wi-Fi', 'מקלחת', 'מיזוג אוויר', 'מטבחון', 'טלוויזיה', 'פינת ישיבה'],
      mainImage: "https://images.unsplash.com/photo-1576675784201-0e142b423952?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    { 
      _id: '21', 
      roomNumber: '21', 
      type: 'סוויטה', 
      capacity: 2, 
      pricePerNight: 800, 
      description: 'סוויטה יוקרתית עם סלון נפרד, חדר שינה עם מיטה זוגית גדולה, מטבחון מאובזר, ג׳קוזי, שירותים ומקלחת.',
      isActive: true,
      amenities: ['Wi-Fi', 'מקלחת', 'מיזוג אוויר', 'מטבחון', 'ג׳קוזי', 'סלון נפרד'],
      mainImage: "https://images.unsplash.com/photo-1591088398332-8a7791972843?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    { 
      _id: '3', 
      roomNumber: '3', 
      type: 'זוגי', 
      capacity: 2, 
      pricePerNight: 400, 
      description: 'חדר זוגי עם מיטה זוגית, מטבחון קטן, שירותים ומקלחת.',
      isActive: true,
      amenities: ['Wi-Fi', 'מקלחת', 'מיזוג אוויר', 'מטבחון'],
      mainImage: "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    { 
      _id: '4', 
      roomNumber: '4', 
      type: 'זוגי', 
      capacity: 2, 
      pricePerNight: 400, 
      description: 'חדר זוגי עם מיטה זוגית, מטבחון קטן, שירותים ומקלחת.',
      isActive: true,
      amenities: ['Wi-Fi', 'מקלחת', 'מיזוג אוויר', 'מטבחון'],
      mainImage: "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    }
  ];
}

export const fetchAllBookings = async () => {
  // במצב פיתוח, נחזיר ישירות נתוני דמה ללא ניסיון לגשת לשרת
  if (isDevelopmentMode()) {
    console.log('Development mode: Using mock booking data');
    
    const today = new Date();
    const twoWeeksFromNow = new Date(today);
    twoWeeksFromNow.setDate(today.getDate() + 14);
    
    const twoWeeksAgo = new Date(today);
    twoWeeksAgo.setDate(today.getDate() - 14);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    const fiveDaysFromNow = new Date(today);
    fiveDaysFromNow.setDate(today.getDate() + 5);
    
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(today.getDate() + 3);
    
    // בדיקה אם קיימות הזמנות דמו ב-localStorage
    let devModeBookings = [];
    if (typeof window !== 'undefined') {
      try {
        const localStorageBookings = JSON.parse(localStorage.getItem('devModeBookings') || '[]');
        devModeBookings = localStorageBookings.map((booking, index) => ({
          _id: booking._id || `dev-${index}`,
          roomId: booking.roomId || booking.room?._id || 'room1',
          roomNumber: booking.roomNumber || '101',
          roomType: booking.roomType || 'חדר זוגי סטנדרטי',
          guestName: booking.guestName || `${booking.firstName} ${booking.lastName}`,
          guestEmail: booking.guestEmail || booking.email,
          checkIn: new Date(booking.checkIn),
          checkOut: new Date(booking.checkOut),
          numGuests: booking.numGuests || booking.numberOfGuests || 2,
          totalPrice: booking.totalPrice,
          status: booking.status || 'confirmed',
          paymentStatus: booking.paymentStatus || 'paid',
          createdAt: booking.createdAt ? new Date(booking.createdAt) : new Date(),
          confirmationCode: booking.confirmationCode
        }));
      } catch (error) {
        console.error('Error parsing localStorage bookings:', error);
      }
    }
    
    // שילוב נתוני ברירת המחדל עם הנתונים מה-localStorage
    return [
      ...devModeBookings,
      {
        _id: 'booking1',
        roomId: '1',
        roomNumber: '1',
        roomType: 'זוגי',
        guestName: 'ישראל ישראלי',
        checkIn: twoWeeksAgo,
        checkOut: new Date(twoWeeksAgo.getTime() + 2 * 24 * 60 * 60 * 1000),
        numGuests: 2,
        totalPrice: 640,
        status: 'checkedOut',
        paymentStatus: 'paid',
        createdAt: new Date(twoWeeksAgo.getTime() - 5 * 24 * 60 * 60 * 1000),
        confirmationCode: 'DEMO0001'
      },
      {
        _id: 'booking2',
        roomId: '2',
        roomNumber: '2',
        roomType: 'יחיד',
        guestName: 'משה כהן',
        checkIn: tomorrow,
        checkOut: new Date(tomorrow.getTime() + 3 * 24 * 60 * 60 * 1000),
        numGuests: 2,
        totalPrice: 1200,
        status: 'confirmed',
        paymentStatus: 'paid',
        createdAt: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
        confirmationCode: 'DEMO0002'
      },
      {
        _id: 'booking3',
        roomId: '3',
        roomNumber: '3',
        roomType: 'סוויטה',
        guestName: 'שרה לוי',
        checkIn: today,
        checkOut: tomorrow,
        numGuests: 3,
        totalPrice: 480,
        status: 'checkedIn',
        paymentStatus: 'paid',
        createdAt: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000),
        confirmationCode: 'DEMO0003'
      },
      {
        _id: 'booking4',
        roomId: '4',
        roomNumber: '4',
        roomType: 'משפחתי',
        guestName: 'דן אבידן',
        checkIn: nextWeek,
        checkOut: new Date(nextWeek.getTime() + 5 * 24 * 60 * 60 * 1000),
        numGuests: 4,
        totalPrice: 3600,
        status: 'pending',
        paymentStatus: 'pending',
        createdAt: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
        confirmationCode: 'DEMO0004'
      },
      {
        _id: 'booking5',
        roomId: '5',
        roomNumber: '5',
        roomType: 'זוגי פלוס',
        guestName: 'לימור כהן',
        checkIn: threeDaysFromNow,
        checkOut: fiveDaysFromNow,
        numGuests: 2,
        totalPrice: 960,
        status: 'confirmed',
        paymentStatus: 'paid',
        createdAt: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000),
        confirmationCode: 'DEMO0005'
      }
    ];
  }

  // במצב ייצור, גישה רגילה לשרת
  try {
    const response = await api.get('/bookings');
    return response.data;
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    return []; // החזר מערך ריק במקרה של שגיאה
  }
};

/**
 * פונקציה לעדכון הזמנה קיימת
 * @param {string} id - מזהה ההזמנה
 * @param {object} bookingData - נתוני ההזמנה המעודכנים
 * @returns {Promise<Object>} - ההזמנה המעודכנת
 */
export const updateBooking = async (id, bookingData) => {
  try {
    const response = await api.put(`/bookings/${id}`, bookingData);
    return response.data;
  } catch (error) {
    if (isDevelopmentMode()) {
      console.warn('שגיאה בעדכון הזמנה, משתמש בנתונים מדומים במצב פיתוח');
      
      // מחזיר את הנתונים שהתקבלו כאילו העדכון הצליח
      return {
        ...bookingData,
        _id: id,
        updatedAt: new Date()
      };
    }
    
    console.error('Error updating booking:', error);
    return handleApiError(error, null, 'שגיאה בעדכון ההזמנה');
  }
};

export const updateBookingPayment = async (bookingId, paymentData) => {
  try {
    const response = await api.put(`/bookings/${bookingId}/payment`, paymentData);
    return response.data;
  } catch (error) {
    console.error('Error updating booking payment:', error);
    throw error;
  }
};

export const performCheckIn = async (bookingId) => {
  try {
    const response = await api.put(`/bookings/${bookingId}/checkin`, {});
    return response.data;
  } catch (error) {
    console.error('Error performing check-in:', error);
    throw error;
  }
};

export const performCheckOut = async (bookingId) => {
  try {
    const response = await api.put(`/bookings/${bookingId}/checkout`, {});
    return response.data;
  } catch (error) {
    console.error('Error performing check-out:', error);
    throw error;
  }
};

// פונקציות API לאימות
export const loginUser = async (credentials) => {
  try {
    // בדיקה אם הסביבה היא Vercel או פיתוח
    const isVercel = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app');
    
    // קביעת נתיב נכון להתחברות
    const endpoint = isVercel ? 'login' : 'auth/login';
    
    console.log(`Using login endpoint: ${endpoint}`);
    console.log('Credentials:', JSON.stringify(credentials));
    console.log('API baseURL:', api.defaults.baseURL);
    
    // קביעת הפרמטרים של הבקשה באופן מפורש
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    // שליחת הבקשה עם פרמטרים מפורשים
    const response = await api.post(endpoint, credentials, config);
    console.log('Login response:', response.status);
    return response.data;
  } catch (error) {
    console.error('Error during login:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    throw error;
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    console.error('Error during registration:', error);
    throw error;
  }
};

export const fetchUserProfile = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const changePassword = async (passwordData) => {
  try {
    const response = await api.put('/auth/change-password', passwordData);
    return response.data;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

// פונקציות API לפיננסים
export const fetchFinances = async (filters = {}) => {
  try {
    const response = await api.get('/finances', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching finances:', error);
    throw error;
  }
};

export const fetchFinanceSummary = async (filters = {}) => {
  try {
    const response = await api.get('/finances/summary', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching finance summary:', error);
    throw error;
  }
};

export const createFinanceRecord = async (financeData) => {
  try {
    const response = await api.post('/finances', financeData);
    return response.data;
  } catch (error) {
    console.error('Error creating finance record:', error);
    throw error;
  }
};

// פונקציות API לדאשבורד
export const fetchDashboardSummary = async () => {
  try {
    const response = await api.get('/dashboard/summary');
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    throw error;
  }
};

export const fetchOccupancyHeatmap = async (params = {}) => {
  try {
    // נתוני דמו עבור תפוסה
    const startDate = new Date(params.startDate || new Date());
    const endDate = new Date(params.endDate || new Date());
    endDate.setDate(endDate.getDate() + 30);
    
    const days = [];
    const tempDate = new Date(startDate);
    
    while (tempDate <= endDate) {
      days.push(new Date(tempDate));
      tempDate.setDate(tempDate.getDate() + 1);
    }
    
    const demoOccupancyData = days.map(day => {
      // תפוסה אקראית בין 30% ל-90%
      const randomOccupancy = Math.floor(Math.random() * 60) + 30;
      
      return {
        date: day.toISOString().split('T')[0],
        occupancy: randomOccupancy
      };
    });
    
    return demoOccupancyData;
  } catch (error) {
    console.error('שגיאה בטעינת נתוני תפוסה:', error);
    throw error;
  }
};

export const fetchRevenueStats = async (params = {}) => {
  try {
    // נתוני דמו עבור הכנסות
    const startDate = new Date(params.startDate || new Date());
    const endDate = new Date(params.endDate || new Date());
    endDate.setDate(endDate.getDate() + 30);
    
    const days = [];
    const tempDate = new Date(startDate);
    
    while (tempDate <= endDate) {
      days.push(new Date(tempDate));
      tempDate.setDate(tempDate.getDate() + 1);
    }
    
    const demoRevenueData = days.map(day => {
      // הכנסה יומית אקראית בין 2000 ל-8000 ש"ח
      const randomRevenue = Math.floor(Math.random() * 6000) + 2000;
      
      return {
        date: day.toISOString().split('T')[0],
        revenue: randomRevenue
      };
    });
    
    return demoRevenueData;
  } catch (error) {
    console.error('שגיאה בטעינת נתוני הכנסות:', error);
    throw error;
  }
};

// פונקציה לקבלת כל החדרים
export const fetchAllRooms = async () => {
  // במצב פיתוח, מחזיר נתוני דמה ישירות בלי לגשת לשרת
  if (isDevelopmentMode()) {
    console.log('Development mode: Using mock room data');
    return getFallbackRooms();
  }

  // במצב ייצור, גישה רגילה לשרת
  try {
    const response = await api.get('/rooms');
    return response.data;
  } catch (error) {
    console.error('שגיאה בטעינת רשימת החדרים:', error);
    return [];
  }
};

/**
 * פונקציה לעדכון סטטוס הזמנה
 * @param {string} id - מזהה ההזמנה
 * @param {string} status - הסטטוס החדש להזמנה
 * @returns {Promise<Object>} - ההזמנה המעודכנת
 */
export const updateBookingStatus = async (id, status) => {
  try {
    const response = await api.patch(`/bookings/${id}/status`, { status });
    return response.data;
  } catch (error) {
    if (isDevelopmentMode()) {
      console.warn('שגיאה בעדכון סטטוס שהייה, משתמש בנתונים מדומים במצב פיתוח');
      
      // מחזיר אובייקט מדומה עם הסטטוס החדש
      return {
        _id: id,
        status: status,
        updatedAt: new Date()
      };
    }
    
    console.error('שגיאה בעדכון סטטוס ההזמנה:', error);
    return handleApiError(error, null, 'שגיאה בעדכון סטטוס ההזמנה');
  }
};

/**
 * פונקציה לביצוע צ'ק-אין של הזמנה
 * @param {string} bookingId - מזהה ההזמנה
 * @returns {Promise<Object>} - ההזמנה המעודכנת
 */
export const checkInBooking = async (bookingId) => {
  try {
    const response = await api.put(`/bookings/${bookingId}/checkin`);
    return response.data;
  } catch (error) {
    console.error('שגיאה בביצוע צ\'ק-אין:', error);
    throw error;
  }
};

/**
 * פונקציה לביצוע צ'ק-אאוט של הזמנה
 * @param {string} bookingId - מזהה ההזמנה
 * @returns {Promise<Object>} - ההזמנה המעודכנת
 */
export const checkOutBooking = async (bookingId) => {
  try {
    const response = await api.put(`/bookings/${bookingId}/checkout`);
    return response.data;
  } catch (error) {
    console.error('שגיאה בביצוע צ\'ק-אאוט:', error);
    throw error;
  }
};

/**
 * מביא הזמנה לפי מזהה
 * @param {string} id - מזהה ההזמנה
 * @returns {Promise<Object>} - פרטי ההזמנה
 */
export const fetchBookingById = async (id) => {
  try {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  } catch (error) {
    if (isDevelopmentMode()) {
      console.warn('שגיאה בטעינת פרטי הזמנה, משתמש בנתונים מדומים במצב פיתוח');
      
      // בדיקה אם יש הזמנות מדומות ב-localStorage
      const devBookings = JSON.parse(localStorage.getItem('devModeBookings') || '[]');
      const booking = devBookings.find(b => b._id === id);
      
      if (booking) {
        return {
          ...booking,
          checkIn: new Date(booking.checkIn),
          checkOut: new Date(booking.checkOut),
          createdAt: new Date(booking.createdAt)
        };
      }
      
      // אם לא נמצאה הזמנה מדומה, זורק שגיאה
      throw new Error('הזמנה לא נמצאה');
    }
    
    handleApiError(error);
  }
};

/**
 * מוחק הזמנה
 * @param {string} id - מזהה ההזמנה
 * @returns {Promise<Object>} - תשובת השרת
 */
export const deleteBooking = async (id) => {
  try {
    const response = await api.delete(`/bookings/${id}`);
    return response.data;
  } catch (error) {
    if (isDevelopmentMode()) {
      console.warn('שגיאה במחיקת הזמנה, משתמש בנתונים מדומים במצב פיתוח');
      return { success: true, message: 'ההזמנה נמחקה בהצלחה' };
    }
    
    handleApiError(error);
  }
};

/**
 * משנה סטטוס תשלום של הזמנה
 * @param {string} id - מזהה ההזמנה
 * @param {string} status - סטטוס התשלום החדש
 * @returns {Promise<Object>} - ההזמנה המעודכנת
 */
export const updateBookingPaymentStatus = async (id, status) => {
  try {
    const response = await api.patch(`/bookings/${id}/payment-status`, { status });
    return response.data;
  } catch (error) {
    if (isDevelopmentMode()) {
      console.warn('שגיאה בעדכון סטטוס תשלום, משתמש בנתונים מדומים במצב פיתוח');
      
      // מחזיר אובייקט מדומה עם הסטטוס החדש
      return {
        _id: id,
        paymentStatus: status,
        updatedAt: new Date()
      };
    }
    
    handleApiError(error);
  }
};

// פונקציית בדיקה לנקודת קצה
export const testApiEndpoint = async (endpointPath) => {
  try {
    // הסרת ה-/api המיותר אם הוא קיים בתחילת הנתיב
    const cleanEndpoint = endpointPath.startsWith('/api/') 
      ? endpointPath.substring(4) // מסיר את '/api/' מהתחלה
      : endpointPath.startsWith('/api') 
        ? endpointPath.substring(4) // מסיר את '/api' מהתחלה
        : endpointPath;
    
    console.log(`בודק נקודת קצה: ${cleanEndpoint}`);
    
    const response = await api.post(cleanEndpoint, {
      test: true,
      timestamp: new Date().toISOString()
    });
    
    console.log('תוצאת בדיקה:', response.data);
    return response.data;
  } catch (error) {
    console.error(`שגיאה בבדיקת ${endpointPath}:`, error);
    return {
      success: false,
      error: error.message,
      status: error.response?.status,
      data: error.response?.data
    };
  }
};

export default api; 