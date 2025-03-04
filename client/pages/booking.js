import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useBooking } from '../contexts/BookingContext';
import BookingSearchForm from '../components/BookingSearchForm';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { format, differenceInDays, addDays } from 'date-fns';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { HiOutlineExclamationCircle, HiOutlineCheckCircle, HiOutlineChevronRight, HiOutlineChevronLeft } from 'react-icons/hi';
import { FaUsers } from 'react-icons/fa';
import { createBooking } from '../lib/api';

const BookingPage = () => {
  const router = useRouter();
  const { 
    checkIn: checkInParam, 
    checkOut: checkOutParam, 
    guests, 
    roomId,
    roomIds  // הוספת תמיכה בריבוי חדרים
  } = router.query;
  const [isLoading, setIsLoading] = useState(true);
  
  const { 
    searchAvailableRooms, 
    availableRooms, 
    loading: bookingLoading,
    setCheckIn: setBookingCheckIn,
    setCheckOut: setBookingCheckOut,
    setGuests: setBookingGuests
  } = useBooking();
  
  const [rooms, setRooms] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState([]); // שינוי למערך של חדרים
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [numGuests, setNumGuests] = useState(guests || 2);
  const [price, setPrice] = useState(0);
  const [totalNights, setTotalNights] = useState(1);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0); // תיקון: התחלה משלב 0 במקום 1
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: '',
    // פרטי אשראי
    cardHolder: '', // תיקון: שינוי השם cardName ל-cardHolder כדי שיתאים לפונקציית הוולידציה
    cardNumber: '',
    cardExpiry: '',
    cardCVC: '',
    notes: '' // הוספת שדה notes שחסר כאן אבל נמצא בטופס
  });
  const [errors, setErrors] = useState({});
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [bookingReference, setBookingReference] = useState('');
  
  // המרת פרמטרים מה-URL לתאריכים תקינים
  const [checkIn, setCheckIn] = useState(checkInParam ? new Date(checkInParam) : addDays(new Date(), 1));
  const [checkOut, setCheckOut] = useState(checkOutParam ? new Date(checkOutParam) : addDays(new Date(), 2));
  
  const [firstRender, setFirstRender] = useState(true);

  // useEffect שמתבצע רק בעלייה הראשונה של הדף
  useEffect(() => {
    setFirstRender(false);
  }, []);
  
  // עיבוד פרמטרים מה-URL
  useEffect(() => {
    try {
      if (!router.isReady) return;
      
      console.log('Router query params:', router.query);
      
      // עיבוד roomId או roomIds
      if (router.query.roomId) {
        // מקרה של חדר יחיד
        setSelectedRooms([{
          roomId: router.query.roomId,
          quantity: 1
        }]);
      } else if (router.query.roomIds) {
        // מקרה של מספר חדרים
        const roomIdArray = Array.isArray(router.query.roomIds) 
          ? router.query.roomIds 
          : [router.query.roomIds];
          
        setSelectedRooms(roomIdArray.map(id => ({
          roomId: id,
          quantity: 1
        })));
      }
      
      // עיבוד תאריכים
      if (router.query.checkIn) {
        const checkInDate = new Date(router.query.checkIn);
        if (!isNaN(checkInDate.getTime())) {
          setCheckIn(checkInDate);
        } else {
          setCheckIn(new Date());
        }
      } else {
        setCheckIn(new Date());
      }
      
      if (router.query.checkOut) {
        const checkOutDate = new Date(router.query.checkOut);
        if (!isNaN(checkOutDate.getTime())) {
          setCheckOut(checkOutDate);
        } else {
          // ברירת מחדל - יום אחרי צ'ק-אין
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          setCheckOut(tomorrow);
        }
      } else {
        // ברירת מחדל - יום אחרי צ'ק-אין
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setCheckOut(tomorrow);
      }
      
      // עיבוד מספר אורחים
      if (router.query.guests) {
        const guestsNum = parseInt(router.query.guests);
        if (!isNaN(guestsNum) && guestsNum > 0) {
          setNumGuests(guestsNum);
        }
      }
      
    } catch (error) {
      console.error('שגיאה בעיבוד פרמטרים מה-URL:', error);
    }
  }, [router.isReady, router.query]);
  
  // השתמש בפונקציה fetchRoomDetails לטעינת החדרים כשהפרמטרים של הURL מוכנים
  useEffect(() => {
    if (router.isReady) {
      if (roomIds) {
        fetchRoomDetails();
      } else {
        // אם אין roomIds, ניקח את החדרים ברירת מחדל מהlocalstorage
        const allRooms = loadRoomsFromLocalStorage();
        if (allRooms && allRooms.length > 0) {
          setRooms([allRooms[0]]);  // רק החדר הראשון ברשימה
        }
      }
      setIsLoading(false);
    }
  }, [router.isReady, roomIds]);
  
  // אתחול החדר הנבחר אם אין חדר נבחר
  useEffect(() => {
    // בדיקה אם קיימים חדרים ואין חדר נבחר
    if (rooms && rooms.length > 0 && !selectedRoom) {
      // בחירת החדר הראשון כחדר ברירת מחדל
      console.log('בחירת חדר ברירת מחדל:', rooms[0]);
      setSelectedRoom(rooms[0]);
    }
  }, [rooms, selectedRoom]);
  
  // עדכון פונקציית טעינת החדרים
  useEffect(() => {
    if (selectedRooms && selectedRooms.length > 0) {
      const fetchRoomDetails = async () => {
        try {
          setIsLoading(true);
          
          // טעינת כל החדרים מה-localStorage
          const allRooms = loadRoomsFromLocalStorage();
          
          // סינון רק החדרים שנבחרו
          const roomDetails = selectedRooms.map(selectedRoom => {
            const roomDetail = allRooms.find(room => room._id === selectedRoom.roomId);
            return {
              ...roomDetail,
              quantity: selectedRoom.quantity
            };
          }).filter(room => room); // סינון חדרים שלא נמצאו
          
          setRooms(roomDetails);
          
          // הגדרת החדר הראשון כחדר נבחר אם הגענו ישירות לדף הזמנה עם פרמטר roomId
          if (!selectedRoom && roomDetails.length > 0) {
            setSelectedRoom(roomDetails[0]);
          }
          
          setIsLoading(false);
        } catch (error) {
          console.error('שגיאה בטעינת פרטי החדרים:', error);
          setErrors({ general: 'אירעה שגיאה בטעינת פרטי החדרים. נסה שוב מאוחר יותר.' });
          setIsLoading(false);
        }
      };
      
      fetchRoomDetails();
    }
  }, [selectedRooms, selectedRoom]);
  
  // פונקציה לטעינת פרטי החדרים
  const fetchRoomDetails = async () => {
    try {
      setIsLoading(true);
      
      // קבלת מזהי החדרים מהURL
      const selectedRoomIds = roomIds?.split(',') || [];
      if (selectedRoomIds.length === 0) return;
      
      // טעינת כל החדרים מlocalstorage
      const allRooms = loadRoomsFromLocalStorage();
      
      // סינון רק החדרים שנבחרו
      const selectedRoomsData = allRooms.filter(room => 
        selectedRoomIds.includes(room._id)
      );
      
      setRooms(selectedRoomsData);
      
      // חישוב המחיר הכולל
      if (checkIn && checkOut && selectedRoomsData.length > 0) {
        const nights = differenceInDays(new Date(checkOut), new Date(checkIn));
        setTotalNights(nights > 0 ? nights : 1);
        
        const total = selectedRoomsData.reduce(
          (sum, room) => sum + (room.pricePerNight || 0), 
          0
        ) * (nights > 0 ? nights : 1);
        
        setPrice(total);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('שגיאה בטעינת פרטי החדרים:', error);
      setErrors({ general: 'אירעה שגיאה בטעינת פרטי החדרים. נסה שוב מאוחר יותר.' });
      setIsLoading(false);
    }
  };
  
  // חישוב מחיר ההזמנה
  const calculatePrice = (room, startDate, endDate) => {
    if (!startDate || !endDate || !room) return;
    
    try {
      // ודא שהתאריכים הם אובייקטי Date תקינים
      const start = startDate instanceof Date ? startDate : new Date(startDate);
      const end = endDate instanceof Date ? endDate : new Date(endDate);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        console.error('תאריכים לא תקינים:', { startDate, endDate });
        return;
      }
      
      const nights = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
      setTotalNights(nights);
      
      const basePrice = room.pricePerNight * nights;
      const totalPrice = basePrice;
      setPrice(totalPrice);
    } catch (error) {
      console.error('שגיאה בחישוב המחיר:', error);
    }
  };
  
  // עדכון המחיר כאשר תאריכי ההזמנה משתנים
  useEffect(() => {
    if (rooms && rooms.length > 0) {
      const total = calculateTotalPrice(rooms, checkIn, checkOut);
      setPrice(total);
    }
  }, [checkIn, checkOut, rooms]);
  
  // טיפול בשינוי תאריך צ'ק-אין
  const handleCheckInChange = (date) => {
    setCheckIn(date);
    
    // אם תאריך צ'ק-אאוט מוקדם מתאריך צ'ק-אין החדש, עדכן אותו
    if (checkOut && date && checkOut <= date) {
      const newCheckOut = new Date(date);
      newCheckOut.setDate(date.getDate() + 1);
      setCheckOut(newCheckOut);
    }
  };
  
  // טיפול בשינוי תאריך צ'ק-אאוט
  const handleCheckOutChange = (date) => {
    setCheckOut(date);
  };
  
  // טיפול בשינוי חדר
  const handleRoomChange = (e) => {
    const roomId = e.target.value;
    const room = rooms.find(r => r._id === roomId);
    setSelectedRoom(room);
    
    if (room) {
      setNumGuests(Math.min(numGuests, room.capacity));
      calculatePrice(room, checkIn, checkOut);
    }
  };
  
  // טיפול בשינויים בטופס
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    console.log(`Updating form field ${name} to value: ${value}`);
    
    setFormData({
      ...formData,
      [name]: value
    });
    
    // ניקוי שגיאות אם קיימות
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  // עדכון הפונקציה לאיסוף נתונים מהטופס
  const collectFormData = () => {
    // במקום לאסוף את הנתונים מה-DOM, נחזיר את ה-state של formData
    console.log('Collecting form data from state:', formData);
    
    // בדיקה אם יש אימייל בפרטים
    if (!formData.email) {
      console.error('Email is missing from form data!');
      setErrors({...errors, email: 'אימייל הוא שדה חובה', general: 'חסר אימייל בטופס' });
    }
    
    return formData;
  };
  
  // עדכון פונקציית validatePaymentDetails לאסוף נתונים לפני וידוא
  const validatePaymentDetails = () => {
    const formValues = collectFormData();
    const newErrors = {};
    
    if (!formValues.cardHolder || formValues.cardHolder.trim() === '') {
      newErrors.cardHolder = 'נדרש שם בעל הכרטיס';
    }
    
    if (!formValues.cardNumber || formValues.cardNumber.trim() === '') {
      newErrors.cardNumber = 'נדרש מספר כרטיס תקין';
    } else if (formValues.cardNumber.replace(/\D/g, '').length < 15) {
      newErrors.cardNumber = 'מספר כרטיס לא תקין';
    }
    
    if (!formValues.cardExpiry || formValues.cardExpiry.trim() === '') {
      newErrors.cardExpiry = 'נדרש תאריך תפוגה';
    }
    
    if (!formValues.cardCVC || formValues.cardCVC.trim() === '') {
      newErrors.cardCVC = 'נדרש קוד אבטחה';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // עדכון validateCustomerDetails
  const validateCustomerDetails = () => {
    const formValues = collectFormData();
    const newErrors = {};
    
    if (!formValues.firstName || formValues.firstName.trim() === '') {
      newErrors.firstName = 'שם פרטי נדרש';
    }
    
    if (!formValues.lastName || formValues.lastName.trim() === '') {
      newErrors.lastName = 'שם משפחה נדרש';
    }
    
    if (!formValues.email || formValues.email.trim() === '') {
      newErrors.email = 'אימייל נדרש';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email)) {
      newErrors.email = 'אימייל לא תקין';
    }
    
    if (!formValues.phone || formValues.phone.trim() === '') {
      newErrors.phone = 'מספר טלפון נדרש';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // וידוא פרטי הזמנה
  const validateBookingDetails = () => {
    const newErrors = {};
    
    if (!selectedRoom) {
      newErrors.room = 'יש לבחור חדר';
    }
    
    if (checkIn >= checkOut) {
      newErrors.dates = "תאריך צ'ק-אאוט חייב להיות מאוחר יותר מתאריך צ'ק-אין";
    }
    
    if (numGuests < 1) {
      newErrors.guests = 'יש להזין לפחות אורח אחד';
    }
    
    if (selectedRoom && numGuests > selectedRoom.capacity) {
      newErrors.guests = `החדר מתאים למקסימום ${selectedRoom.capacity} אורחים`;
    }
    
    setErrors(newErrors);
    console.log('validateBookingDetails errors:', newErrors); // הוספת לוג לדיבאג
    return Object.keys(newErrors).length === 0;
  };
  
  // מעבר לשלב הבא
  const handleNextStep = async () => {
    if (step === 0) {
      // בדיקת תקינות פרטי ההזמנה
      if (validateBookingDetails()) {
        setStep(1);
      }
    } else if (step === 1) {
      // בדיקת תקינות פרטי הלקוח
      if (validateCustomerDetails()) {
        setStep(2);
      }
    } else if (step === 2) {
      // בדיקת תקינות פרטי התשלום
      if (validatePaymentDetails()) {
        console.log('Payment details valid, submitting booking');
        // שליחת ההזמנה
        await submitBooking();
      } else {
        console.log('Payment details invalid, staying on payment step');
      }
    }
  };
  
  // חזרה לשלב הקודם
  const handlePrevStep = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };
  
  // טיפול בשליחת הטופס
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('handleSubmit: Current step =', step);
    
    if (step === 2) {
      // אם בשלב תשלום, בדוק תקינות ושלח
      if (validatePaymentDetails()) {
        try {
          // אסוף נתונים מהטופס
          const currentFormData = collectFormData();
          console.log('Form data collected:', currentFormData);
          
          // הדפס את פרטי האימייל לפני השליחה לצורך בדיקה
          console.log('Email being sent:', currentFormData.email);
          
          // הכן אובייקט הזמנה
          const bookingData = {
            roomId: selectedRoom?._id || "6",  // השתמש ב-ID תקף שקיים בנתוני הדגימה
            guestName: `${currentFormData.firstName} ${currentFormData.lastName}`,
            guestEmail: currentFormData.email,
            guestPhone: currentFormData.phone,
            checkIn: format(checkIn, 'yyyy-MM-dd'),
            checkOut: format(checkOut, 'yyyy-MM-dd'),
            numberOfGuests: parseInt(numGuests, 10),
            totalPrice: parseFloat(price),
            specialRequests: currentFormData.specialRequests || '',
            paymentMethod: 'credit_card',
            paymentDetails: {
              cardHolder: currentFormData.cardHolder,
              // עבור דמו - לא שומרים את כל פרטי הכרטיס אלא רק 4 ספרות אחרונות
              cardLast4: currentFormData.cardNumber.slice(-4),
              cardExpiry: currentFormData.cardExpiry
            }
          };
          
          console.log('Booking data sent to server:', JSON.stringify(bookingData, null, 2));
          
          // בדיקה נוספת לפני השליחה
          if (!bookingData.guestEmail) {
            console.error('Email is missing from booking data!');
            setErrors({ email: 'אימייל הוא שדה חובה', general: 'חסר אימייל בנתוני ההזמנה' });
            return; // עצור את התהליך אם חסר אימייל
          }

          // שליחה לשרת באמצעות ה-API
          try {
            // הוסף בדיקה האם אנחנו במצב פיתוח
            let data;
            if (process.env.NODE_ENV === 'development') {
              // במצב פיתוח - התעלם מהשרת והשתמש בנתוני דמו
              console.log('DEVELOPMENT MODE: Using mock data instead of server call');
              
              // שימוש ב-API שיטפל בהתאמה של החדר למערך החדרים המדומים
              data = await createBooking(bookingData);
              
            } else {
              // במצב ייצור - בצע קריאת שרת רגילה
              data = await createBooking(bookingData);
            }
            console.log('Booking submitted successfully:', data);
            setBookingReference(data.confirmationCode);
            setBookingSubmitted(true);
          } catch (error) {
            console.error('Error creating booking:', error);
            // הצג את השגיאה המדויקת שהתקבלה מהשרת
            if (error.response) {
              console.error('Server error status:', error.response.status);
              console.error('Server error details:', JSON.stringify(error.response.data));
              
              // בדיקה לשגיאות ספציפיות
              if (error.response.status === 500) {
                console.error('Internal server error. Check server logs for details.');
                setErrors({ general: 'שגיאה פנימית בשרת. נא לפנות למנהל המערכת.' });
              } else if (error.response.data.msg) {
                setErrors({ general: error.response.data.msg });
              } else if (error.response.data.errors && error.response.data.errors.length > 0) {
                // אם יש רשימת שגיאות תיקוף
                setErrors({ general: error.response.data.errors[0].msg });
              } else {
                setErrors({ general: 'אירעה שגיאה בתהליך ההזמנה. אנא נסו שוב.' });
              }
            } else {
              setErrors({ general: 'אירעה שגיאה בתהליך ההזמנה. אנא נסו שוב.' });
            }
          }
        } catch (error) {
          console.error('Error in handleSubmit:', error);
          setErrors({ general: 'אירעה שגיאה בעיבוד נתוני ההזמנה. אנא נסו שוב.' });
        }
      }
    } else {
      // אם לא בשלב האחרון, עבור לשלב הבא
      handleNextStep();
    }
  };
  
  // אם ההזמנה הושלמה, הצג מסך אישור
  if (bookingSubmitted) {
    return (
      <Layout>
        <Head>
          <title>הזמנה התקבלה | רוטשילד 79</title>
        </Head>
        
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto bg-white p-6 border border-gray-100"
          >
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-500 mb-4">
                <HiOutlineCheckCircle className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-medium mb-2">ההזמנה התקבלה!</h1>
              <p className="text-gray-600">תודה שבחרת ברוטשילד 79</p>
            </div>
            
            <div className="mb-6 p-4 bg-gray-50 rounded">
              <div className="text-center mb-4">
                <h2 className="text-lg font-medium">מספר אסמכתא להזמנה</h2>
                <div className="text-2xl font-bold mt-1">{bookingReference}</div>
              </div>
              
              <div className="border-t border-b py-4 my-4">
                <div className="mb-4">
                  <h3 className="font-medium mb-2">פרטי החדרים:</h3>
                  {selectedRooms.map((room, index) => (
                    <div key={index} className="flex justify-between mb-2">
                      <span>{room.type} - חדר {room.roomNumber}</span>
                      <span>₪{room.pricePerNight} / לילה</span>
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <h3 className="text-sm font-medium">תאריך הגעה</h3>
                    <p>{format(checkIn, 'dd/MM/yyyy')}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">תאריך עזיבה</h3>
                    <p>{format(checkOut, 'dd/MM/yyyy')}</p>
                  </div>
                </div>
                
                <div className="flex justify-between font-medium pt-2">
                  <span>סה"כ עבור {totalNights} לילות:</span>
                  <span>₪{price}</span>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-4">
                פרטי ההזמנה נשלחו לכתובת האימייל שהזנת.
                <br />
                בכל שאלה ניתן ליצור קשר במספר 054-1234567.
              </p>
              <button
                onClick={() => router.push('/')}
                className="btn-primary"
              >
                חזרה לדף הבית
              </button>
            </div>
          </motion.div>
        </div>
      </Layout>
    );
  }
  
  // פונקציה להבאת נתוני החדרים ממערך של מזהים
  const fetchRoomsFromIds = async (roomIdArray) => {
    try {
      // אם זו מערכת דמו, יצירת חדרים לדוגמה
      const demoRooms = fetchDemoRooms();
      
      // מציאת החדרים לפי המזהים
      const foundRooms = roomIdArray.map(id => 
        demoRooms.find(room => room._id === id)
      ).filter(room => room); // סינון חדרים שלא נמצאו
      
      return foundRooms;
    } catch (error) {
      console.error('Error fetching rooms from IDs:', error);
      return [];
    }
  };

  // פונקציה לחישוב המחיר הכולל עבור כל החדרים הנבחרים
  const calculateTotalPrice = (roomsArray, startDate, endDate) => {
    if (!roomsArray || !roomsArray.length || !startDate || !endDate) return 0;
    
    // חישוב מספר הלילות
    const nights = differenceInDays(new Date(endDate), new Date(startDate));
    if (nights <= 0) return 0;
    
    // סכום מחירי כל החדרים
    const totalPrice = roomsArray.reduce(
      (sum, room) => sum + (room.pricePerNight || 0), 
      0
    ) * nights;
    
    return totalPrice;
  };

  // פונקציה לטעינת החדרים מ-localStorage - פישוט הקוד
  const loadRoomsFromLocalStorage = () => {
    try {
      const storedRooms = localStorage.getItem('hotelRooms');
      if (storedRooms) {
        // טעינת החדרים מהלוקל סטורג' בדיוק כפי שהם נשמרו
        const parsedRooms = JSON.parse(storedRooms);
        
        // החזרת החדרים כפי שהם
        return parsedRooms;
      }
    } catch (error) {
      console.error('שגיאה בטעינת החדרים מהאחסון המקומי:', error);
    }
    // חדרים ברירת מחדל אם אין נתונים באחסון מקומי
    return [
      {
        _id: '1',
        roomNumber: '1',
        type: 'זוגי',
        description: 'חדר זוגי עם מיטה זוגית, מטבחון קטן, שירותים ומקלחת.',
        capacity: 2,
        pricePerNight: 400,
        isActive: true,
        amenities: ['Wi-Fi', 'מקלחת', 'מיזוג אוויר', 'מטבחון'],
        images: [],
        mainImage: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
      },
      {
        _id: '6',
        roomNumber: '6',
        type: 'משפחתי',
        description: 'חדר משפחתי קומפקטי עם מיטה זוגית ומיטת יחיד, מטבחון, שירותים ומקלחת.',
        capacity: 3,
        pricePerNight: 500,
        isActive: true,
        amenities: ['Wi-Fi', 'מקלחת', 'מיזוג אוויר', 'מטבחון', 'טלוויזיה'],
        images: [],
        mainImage: "https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
      },
      {
        _id: '13',
        roomNumber: '13',
        type: 'משפחתי',
        description: 'חדר משפחתי מרווח עם מיטה זוגית ושתי מיטות יחיד, מטבחון, פינת ישיבה, שירותים ומקלחת.',
        capacity: 4,
        pricePerNight: 600,
        isActive: true,
        amenities: ['Wi-Fi', 'מקלחת', 'מיזוג אוויר', 'מטבחון', 'פינת ישיבה'],
        images: [],
        mainImage: "https://images.unsplash.com/photo-1586105251261-72a756497a11?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
      },
      {
        _id: '17',
        roomNumber: '17',
        type: 'זוגי פלוס',
        description: 'חדר זוגי מרווח עם מיטה זוגית רחבה, פינת ישיבה, מטבחון, שירותים ומקלחת מפנקת.',
        capacity: 2,
        pricePerNight: 450,
        isActive: true,
        amenities: ['Wi-Fi', 'מקלחת', 'מיזוג אוויר', 'מטבחון', 'טלוויזיה', 'פינת ישיבה'],
        images: [],
        mainImage: "https://images.unsplash.com/photo-1576675784201-0e142b423952?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
      },
      {
        _id: '21',
        roomNumber: '21',
        type: 'סוויטה',
        description: 'סוויטה יוקרתית עם סלון נפרד, חדר שינה עם מיטה זוגית גדולה, מטבחון מאובזר, ג׳קוזי, שירותים ומקלחת.',
        capacity: 2,
        pricePerNight: 800,
        isActive: true,
        amenities: ['Wi-Fi', 'מקלחת', 'מיזוג אוויר', 'מטבחון', 'ג׳קוזי', 'סלון נפרד'],
        images: [],
        mainImage: "https://images.unsplash.com/photo-1591088398332-8a7791972843?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
      }
    ];
  };

  // שליחת ההזמנה לשרת
  const submitBooking = async () => {
    try {
      // אסוף נתונים מהטופס
      const currentFormData = collectFormData();
      
      // הכן אובייקט עם כל הנתונים
      const bookingData = {
        roomId: selectedRoom?._id || "6",  // השתמש ב-ID תקף שקיים בנתוני הדגימה
        guestName: `${currentFormData.firstName} ${currentFormData.lastName}`,
        guestEmail: currentFormData.email,
        guestPhone: currentFormData.phone,
        checkIn: format(checkIn, 'yyyy-MM-dd'),
        checkOut: format(checkOut, 'yyyy-MM-dd'),
        numberOfGuests: parseInt(numGuests, 10),
        totalPrice: parseFloat(price),
        specialRequests: currentFormData.specialRequests || '',
        paymentMethod: 'credit_card',
        paymentDetails: {
          cardHolder: currentFormData.cardHolder,
          // עבור דמו - לא שומרים את כל פרטי הכרטיס אלא רק 4 ספרות אחרונות
          cardLast4: currentFormData.cardNumber.slice(-4),
          cardExpiry: currentFormData.cardExpiry
        }
      };
      
      console.log('Booking data sent to server:', JSON.stringify(bookingData, null, 2));
      
      // בדיקה נוספת לפני השליחה
      if (!bookingData.guestEmail) {
        console.error('Email is missing from booking data!');
        setErrors({ email: 'אימייל הוא שדה חובה', general: 'חסר אימייל בנתוני ההזמנה' });
        return; // עצור את התהליך אם חסר אימייל
      }

      // שליחה לשרת באמצעות ה-API
      try {
        // הוסף בדיקה האם אנחנו במצב פיתוח
        let data;
        if (process.env.NODE_ENV === 'development') {
          // במצב פיתוח - התעלם מהשרת והשתמש בנתוני דמו
          console.log('DEVELOPMENT MODE: Using mock data instead of server call');
          
          // שימוש ב-API שיטפל בהתאמה של החדר למערך החדרים המדומים
          data = await createBooking(bookingData);
          
        } else {
          // במצב ייצור - בצע קריאת שרת רגילה
          data = await createBooking(bookingData);
        }
        console.log('Booking submitted successfully:', data);
        setBookingReference(data.confirmationCode);
        setBookingSubmitted(true);
      } catch (error) {
        console.error('Error creating booking:', error);
        // הצג את השגיאה המדויקת שהתקבלה מהשרת
        if (error.response) {
          console.error('Server error status:', error.response.status);
          console.error('Server error details:', JSON.stringify(error.response.data));
          
          // בדיקה לשגיאות ספציפיות
          if (error.response.status === 500) {
            console.error('Internal server error. Check server logs for details.');
            setErrors({ general: 'שגיאה פנימית בשרת. נא לפנות למנהל המערכת.' });
          } else if (error.response.data.msg) {
            setErrors({ general: error.response.data.msg });
          } else if (error.response.data.errors && error.response.data.errors.length > 0) {
            // אם יש רשימת שגיאות תיקוף
            setErrors({ general: error.response.data.errors[0].msg });
          } else {
            setErrors({ general: 'אירעה שגיאה בתהליך ההזמנה. אנא נסו שוב.' });
          }
        } else {
          setErrors({ general: 'אירעה שגיאה בתהליך ההזמנה. אנא נסו שוב.' });
        }
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
      setErrors({ general: 'שגיאה בשליחת ההזמנה. אנא נסו שוב מאוחר יותר.' });
    }
  };

  return (
    <Layout>
      <Head>
        <title>הזמנת חדר | רוטשילד 79</title>
        <meta name="description" content="הזמינו חדר במלון רוטשילד 79" />
      </Head>
      
      <div className="container mx-auto p-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">הזמנה</h1>
        
        {/* הצגת שגיאות כלליות */}
        {errors.general && (
          <div className="bg-red-50 border-r-4 border-red-500 p-4 mb-6 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <HiOutlineExclamationCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="mr-3">
                <p className="text-sm text-red-700">{errors.general}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* שלבי ההזמנה */}
        <div className="flex justify-center mb-8">
          <div className="w-full max-w-3xl flex justify-between relative">
            {/* קו מחבר בין השלבים */}
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 -z-10"></div>
            
            {/* שלב 1 - פרטי הזמנה */}
            <div className="flex flex-col items-center">
              <div className={`rounded-full w-8 h-8 flex items-center justify-center font-medium ${step >= 0 ? 'bg-accent text-white' : 'bg-gray-200 text-gray-600'}`}>
                1
              </div>
              <div className="text-sm mt-1 text-center">פרטי הזמנה</div>
            </div>
            
            {/* שלב 2 - פרטי לקוח */}
            <div className="flex flex-col items-center">
              <div className={`rounded-full w-8 h-8 flex items-center justify-center font-medium ${step >= 1 ? 'bg-accent text-white' : 'bg-gray-200 text-gray-600'}`}>
                2
              </div>
              <div className="text-sm mt-1 text-center">פרטי לקוח</div>
            </div>
            
            {/* שלב 3 - אישור ותשלום */}
            <div className="flex flex-col items-center">
              <div className={`rounded-full w-8 h-8 flex items-center justify-center font-medium ${step >= 2 ? 'bg-accent text-white' : 'bg-gray-200 text-gray-600'}`}>
                3
              </div>
              <div className="text-sm mt-1 text-center">אישור ותשלום</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto">
          {/* תוכן דינמי לפי השלב הנוכחי */}
          <form onSubmit={handleSubmit}>
            {step === 0 && (
              <>
                <h2 className="text-xl font-bold mb-6 pb-2 border-b border-gray-100">בחירת חדרים ותאריכים</h2>
                
                {/* בלוק התאריכים */}
                <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">תאריך הגעה</label>
                    <DatePicker
                      selected={checkIn}
                      onChange={handleCheckInChange}
                      selectsStart
                      startDate={checkIn}
                      endDate={checkOut}
                      minDate={new Date()}
                      dateFormat="dd/MM/yyyy"
                      locale="he"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">תאריך עזיבה</label>
                    <DatePicker
                      selected={checkOut}
                      onChange={handleCheckOutChange}
                      selectsEnd
                      startDate={checkIn}
                      endDate={checkOut}
                      minDate={addDays(checkIn, 1)}
                      dateFormat="dd/MM/yyyy"
                      locale="he"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                {/* בלוק החדרים - מציג את החדרים שנבחרו */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-4">החדרים שבחרתם:</h3>
                  {isLoading ? (
                    <div className="flex justify-center items-center p-10">
                      <div className="spinner w-10 h-10 rounded-full border-4 border-accent border-t-transparent animate-spin"></div>
                    </div>
                  ) : (
                    rooms.map((room) => (
                      <div key={room._id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mb-4">
                        <div className="flex flex-col md:flex-row">
                          <div className="w-full md:w-1/3 h-48 relative">
                            <div className="relative w-full h-full image-gallery">
                              <img
                                src={room.mainImage || "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?ixlib=rb-4.0.3&auto=format&fit=crop&w=1471&q=80"}
                                alt={`חדר ${room.roomNumber}`}
                                className="w-full h-full object-cover"
                              />
                              
                              {room.images && room.images.length > 0 && (
                                <div className="absolute bottom-0 left-0 right-0 flex justify-center p-2 bg-black bg-opacity-40">
                                  <div className="flex space-x-1">
                                    <button 
                                      type="button"
                                      className="bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full w-8 h-8 flex items-center justify-center text-gray-800 transition-colors"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        const currentImageEl = e.currentTarget.closest('.image-gallery').querySelector('img');
                                        const currentSrc = currentImageEl.src;
                                        const allImages = [room.mainImage, ...(room.images.filter(img => img !== room.mainImage))];
                                        const currentIndex = allImages.indexOf(currentSrc);
                                        const prevIndex = (currentIndex - 1 + allImages.length) % allImages.length;
                                        currentImageEl.src = allImages[prevIndex];
                                      }}
                                    >
                                      <HiOutlineChevronRight />
                                    </button>
                                    <button 
                                      type="button"
                                      className="bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full w-8 h-8 flex items-center justify-center text-gray-800 transition-colors"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        const currentImageEl = e.currentTarget.closest('.image-gallery').querySelector('img');
                                        const currentSrc = currentImageEl.src;
                                        const allImages = [room.mainImage, ...(room.images.filter(img => img !== room.mainImage))];
                                        const currentIndex = allImages.indexOf(currentSrc);
                                        const nextIndex = (currentIndex + 1) % allImages.length;
                                        currentImageEl.src = allImages[nextIndex];
                                      }}
                                    >
                                      <HiOutlineChevronLeft />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="p-4 flex-grow">
                            <h4 className="text-lg font-bold mb-2">{room.type} - חדר {room.roomNumber}</h4>
                            <div className="text-sm text-gray-600 mb-2">
                              <span>עד {room.capacity} אורחים</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-4">{room.description}</p>
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-gray-700 font-medium">מחיר ללילה: ₪{room.pricePerNight}</p>
                                <p className="text-sm text-gray-600">סה"כ לתקופה: ₪{room.pricePerNight * totalNights}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                {/* סיכום מחירים */}
                <div className="bg-gray-50 p-4 rounded-md mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">סה"כ לילות:</span>
                    <span className="font-medium">{totalNights}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">מחיר ללילה (ממוצע):</span>
                    <span className="font-medium">₪{price / totalNights}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-800 font-medium">סה"כ לתשלום:</span>
                      <span className="text-lg font-bold text-accent">₪{price}</span>
                    </div>
                  </div>
                </div>
                
                {/* כפתור המשך */}
                <div className="flex justify-end mt-6">
                  <button 
                    type="button" 
                    onClick={handleNextStep}
                    className="btn-primary"
                  >
                    המשך
                  </button>
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <h2 className="text-xl font-bold mb-6 pb-2 border-b border-gray-100">פרטי לקוח</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* שם פרטי */}
                  <div className="mb-4">
                    <label htmlFor="firstName" className="form-label">שם פרטי *</label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={formData.firstName || ''}
                      onChange={handleChange}
                      placeholder=""
                      className={`form-input ${errors.firstName ? 'border-red-500' : ''}`}
                      required
                    />
                    {errors.firstName && <div className="form-error">{errors.firstName}</div>}
                  </div>
                  
                  {/* שם משפחה */}
                  <div className="mb-4">
                    <label htmlFor="lastName" className="form-label">שם משפחה *</label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={formData.lastName || ''}
                      onChange={handleChange}
                      placeholder=""
                      className={`form-input ${errors.lastName ? 'border-red-500' : ''}`}
                      required
                    />
                    {errors.lastName && <div className="form-error">{errors.lastName}</div>}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* דוא"ל */}
                  <div className="mb-4">
                    <label htmlFor="email" className="form-label">דוא״ל *</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email || ''}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      className={`form-input ${errors.email ? 'border-red-500' : ''}`}
                      required
                    />
                    {errors.email && <div className="form-error">{errors.email}</div>}
                  </div>
                  
                  {/* טלפון */}
                  <div className="mb-4">
                    <label htmlFor="phone" className="form-label">טלפון *</label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone || ''}
                      onChange={handleChange}
                      placeholder=""
                      className={`form-input ${errors.phone ? 'border-red-500' : ''}`}
                      required
                    />
                    {errors.phone && <div className="form-error">{errors.phone}</div>}
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="specialRequests" className="form-label">בקשות מיוחדות (כגון: חדר יחיד, מיטת תינוק וכו')</label>
                  <textarea
                    id="specialRequests"
                    name="specialRequests"
                    value={formData.specialRequests || ''}
                    onChange={handleChange}
                    rows="4"
                    className="form-textarea"
                  ></textarea>
                </div>
                
                <div className="flex justify-between">
                  <button 
                    type="button" 
                    onClick={handlePrevStep}
                    className="btn-secondary"
                  >
                    חזרה
                  </button>
                  <button 
                    type="button" 
                    onClick={handleNextStep}
                    className="btn-primary"
                  >
                    המשך
                  </button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="text-xl font-bold mb-6 pb-2 border-b border-gray-100">תשלום ואישור הזמנה</h2>
                
                {/* מידע של החדרים שנבחרו */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-4">סיכום ההזמנה:</h3>
                  <div className="bg-gray-50 p-4 rounded-md mb-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="font-medium">חדר:</div>
                      <div>{selectedRoom ? `${selectedRoom.type} - חדר ${selectedRoom.roomNumber}` : ''}</div>
                      
                      <div className="font-medium">תאריך הגעה:</div>
                      <div>{format(checkIn, 'dd/MM/yyyy')}</div>
                      
                      <div className="font-medium">תאריך עזיבה:</div>
                      <div>{format(checkOut, 'dd/MM/yyyy')}</div>
                      
                      <div className="font-medium">מספר לילות:</div>
                      <div>{totalNights}</div>
                      
                      <div className="font-medium">אורחים:</div>
                      <div>{numGuests}</div>
                    </div>
                  </div>
                </div>
                
                {/* פרטי כרטיס אשראי */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-4">פרטי תשלום:</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="mb-4">
                      <label htmlFor="cardHolder" className="form-label">שם בעל הכרטיס *</label>
                      <input
                        id="cardHolder"
                        name="cardHolder"
                        type="text"
                        value={formData.cardHolder || ''}
                        onChange={handleChange}
                        placeholder=""
                        className={`form-input ${errors.cardHolder ? 'border-red-500' : ''}`}
                        required
                      />
                      {errors.cardHolder && <div className="form-error">{errors.cardHolder}</div>}
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="cardNumber" className="form-label">מספר כרטיס *</label>
                      <input
                        id="cardNumber"
                        name="cardNumber"
                        type="text"
                        value={formData.cardNumber || ''}
                        onChange={handleChange}
                        placeholder="XXXX XXXX XXXX XXXX"
                        className={`form-input ${errors.cardNumber ? 'border-red-500' : ''}`}
                        required
                      />
                      {errors.cardNumber && <div className="form-error">{errors.cardNumber}</div>}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="mb-4">
                      <label htmlFor="cardExpiry" className="form-label">תוקף *</label>
                      <input
                        id="cardExpiry"
                        name="cardExpiry"
                        type="text"
                        value={formData.cardExpiry || ''}
                        onChange={handleChange}
                        placeholder="MM/YY"
                        className={`form-input ${errors.cardExpiry ? 'border-red-500' : ''}`}
                        required
                      />
                      {errors.cardExpiry && <div className="form-error">{errors.cardExpiry}</div>}
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="cardCVC" className="form-label">קוד אבטחה *</label>
                      <input
                        id="cardCVC"
                        name="cardCVC"
                        type="text"
                        value={formData.cardCVC || ''}
                        onChange={handleChange}
                        placeholder="CVC"
                        className={`form-input ${errors.cardCVC ? 'border-red-500' : ''}`}
                        required
                      />
                      {errors.cardCVC && <div className="form-error">{errors.cardCVC}</div>}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <button 
                    type="button" 
                    onClick={handlePrevStep}
                    className="btn-secondary"
                  >
                    חזרה
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary"
                  >
                    השלם הזמנה
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default BookingPage; 