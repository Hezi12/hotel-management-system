import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { fetchRooms } from '../lib/api';
import RoomCard from '../components/RoomCard';
import { 
  HiOutlineFilter, 
  HiOutlineX, 
  HiOutlineCalendar, 
  HiOutlineUsers, 
  HiOutlineArrowRight,
  HiOutlineShoppingCart,
  HiOutlinePlusCircle,
  HiOutlineCheck,
  HiOutlineChevronRight,
  HiOutlineChevronLeft
} from 'react-icons/hi';
import { format, addDays, differenceInDays, parseISO } from 'date-fns';
import he from 'date-fns/locale/he';
import Image from 'next/image';

const SearchResultsPage = () => {
  const router = useRouter();
  const { checkIn, checkOut, guests, rooms: requestedRooms } = router.query;
  
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [nightsCount, setNightsCount] = useState(1);
  const [selectedRooms, setSelectedRooms] = useState([]);  // מערך של חדרים נבחרים
  const [totalPrice, setTotalPrice] = useState(0);  // מחיר כולל של החדרים שנבחרו
  const [showCart, setShowCart] = useState(false);  // האם להציג את העגלה
  
  // פילטרים
  const [filters, setFilters] = useState({
    type: '',
    minPrice: 0,
    maxPrice: 5000,
  });
  
  // חישוב מספר הלילות
  useEffect(() => {
    if (checkIn && checkOut) {
      try {
        const start = parseISO(checkIn);
        const end = parseISO(checkOut);
        const nights = differenceInDays(end, start);
        setNightsCount(nights > 0 ? nights : 1);
      } catch (error) {
        console.error('Error calculating nights:', error);
        setNightsCount(1);
      }
    }
  }, [checkIn, checkOut]);
  
  // קבלת החדרים וסינון לפי מספר אורחים
  useEffect(() => {
    const getRooms = async () => {
      try {
        setLoading(true);
        
        // קריאה לפונקציה הלוקאלית שטוענת מה-localStorage במקום לקרוא לשרת
        const data = loadRoomsFromLocalStorage();
        
        // סינון חדרים שאינם פעילים ועומדים בדרישות מספר האורחים
        let filteredData = data.filter(room => room.isActive);
        
        // אם יש פרמטר 'guests', נסנן רק חדרים שיכולים להכיל את מספר האורחים המבוקש
        if (guests) {
          const guestsCount = parseInt(guests);
          if (!isNaN(guestsCount)) {
            filteredData = filteredData.filter(room => room.capacity >= guestsCount);
          }
        }
        
        // מיון החדרים לפי מחיר (מהזול ליקר)
        filteredData = filteredData.sort((a, b) => a.pricePerNight - b.pricePerNight);
        
        // מסנן חדרים שלא בשימוש (חדרים זהים)
        const uniqueRooms = removeDuplicateRooms(filteredData);
        
        setRooms(uniqueRooms);
        setFilteredRooms(uniqueRooms);
      } catch (error) {
        console.error('שגיאה בטעינת החדרים:', error);
        setError('אירעה שגיאה בטעינת החדרים. נסו לרענן את הדף.');
      } finally {
        setLoading(false);
      }
    };
    
    if (router.isReady) {
      getRooms();
    }
  }, [router.isReady, guests]);
  
  // חישוב המחיר הכולל כאשר החדרים הנבחרים משתנים
  useEffect(() => {
    const total = selectedRooms.reduce((sum, room) => sum + (room.pricePerNight || 0), 0) * nightsCount;
    setTotalPrice(total);
  }, [selectedRooms, nightsCount]);
  
  // החלת פילטרים על החדרים
  useEffect(() => {
    if (rooms.length === 0) return;
    
    const result = rooms.filter(room => {
      // פילטר לפי סוג חדר
      if (filters.type && room.type !== filters.type) {
        return false;
      }
      
      // פילטר לפי מחיר
      if (
        (filters.minPrice > 0 && room.pricePerNight < filters.minPrice) ||
        (filters.maxPrice > 0 && room.pricePerNight > filters.maxPrice)
      ) {
        return false;
      }
      
      return true;
    });
    
    setFilteredRooms(result);
  }, [filters, rooms]);
  
  // עדכון פילטר
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: name === 'type' ? value : Number(value)
    }));
  };
  
  // איפוס פילטרים
  const resetFilters = () => {
    setFilters({
      type: '',
      minPrice: 0,
      maxPrice: 5000,
    });
  };
  
  // הוספת או הסרת חדר מהבחירה
  const toggleRoomSelection = (room) => {
    // בדוק אם החדר כבר קיים בבחירה
    const isSelected = selectedRooms.some(selectedRoom => selectedRoom._id === room._id);
    
    if (isSelected) {
      // הסר את החדר מהבחירה
      setSelectedRooms(selectedRooms.filter(selectedRoom => selectedRoom._id !== room._id));
    } else {
      // הוסף את החדר לבחירה
      setSelectedRooms([...selectedRooms, room]);
    }
  };
  
  // בדיקה אם חדר מסוים נבחר
  const isRoomSelected = (roomId) => {
    return selectedRooms.some(room => room._id === roomId);
  };

  // המשך להזמנה עם החדרים שנבחרו
  const proceedToBooking = () => {
    router.push({
      pathname: '/booking',
      query: {
        roomIds: selectedRooms.map(room => room._id).join(','),
        checkIn,
        checkOut,
        guests
      }
    });
  };
  
  // הסרת חדרים כפולים (חדרים זהים לפי סוג, מחיר וקיבולת)
  const removeDuplicateRooms = (roomsData) => {
    // מסיר כפילויות של חדרים מסוג 1, 3, 4 כפי שהוגדר במשימה
    const duplicateRoomNumbers = ['1', '3', '4'];
    const duplicateRoomTypes = {};
    
    return roomsData.filter(room => {
      // אם זה חדר מהחדרים הזהים, בדוק אם כבר הוספנו אחד מהסוג הזה
      if (duplicateRoomNumbers.includes(room.roomNumber)) {
        const roomType = `${room.type}-${room.capacity}-${room.pricePerNight}`;
        if (duplicateRoomTypes[roomType]) {
          return false; // לא להוסיף כפילות
        }
        duplicateRoomTypes[roomType] = true;
      }
      return true;
    });
  };
  
  // פונקציה לטעינת החדרים מ-localStorage - פישוט הקוד
  const loadRoomsFromLocalStorage = () => {
    try {
      const storedRooms = localStorage.getItem('hotelRooms');
      if (storedRooms) {
        // טעינת החדרים מהלוקל סטורג' בדיוק כפי שהם נשמרו
        const parsedRooms = JSON.parse(storedRooms);
        
        // החזרת החדרים כפי שהם, בלי לשנות את התמונות המקוריות
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
        mainImage: "https://placehold.co/800x600/e0e0e0/939393?text=חדר+זוגי+1"
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
        mainImage: "https://placehold.co/800x600/e0e0e0/939393?text=חדר+משפחתי+6"
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
        mainImage: "https://placehold.co/800x600/e0e0e0/939393?text=חדר+משפחתי+13"
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
        mainImage: "https://placehold.co/800x600/e0e0e0/939393?text=חדר+זוגי+פלוס+17"
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
        mainImage: "https://placehold.co/800x600/e0e0e0/939393?text=סוויטה+21"
      },
      {
        _id: '3',
        roomNumber: '3',
        type: 'זוגי',
        description: 'חדר זוגי עם מיטה זוגית, מטבחון קטן, שירותים ומקלחת.',
        capacity: 2,
        pricePerNight: 400,
        isActive: true,
        amenities: ['Wi-Fi', 'מקלחת', 'מיזוג אוויר', 'מטבחון'],
        images: [],
        mainImage: "https://placehold.co/800x600/e0e0e0/939393?text=חדר+זוגי+3"
      },
      {
        _id: '4',
        roomNumber: '4',
        type: 'זוגי',
        description: 'חדר זוגי עם מיטה זוגית, מטבחון קטן, שירותים ומקלחת.',
        capacity: 2,
        pricePerNight: 400,
        isActive: true,
        amenities: ['Wi-Fi', 'מקלחת', 'מיזוג אוויר', 'מטבחון'],
        images: [],
        mainImage: "https://placehold.co/800x600/e0e0e0/939393?text=חדר+זוגי+4"
      }
    ];
  };
  
  // פורמט תאריכים
  const formatDate = (dateString) => {
    try {
      if (!dateString) return '';
      const date = parseISO(dateString);
      return format(date, 'dd/MM/yyyy', { locale: he });
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };
  
  // אנימציה
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };
  
  if (!router.isReady) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent"></div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 min-h-screen">
      <Head>
        <title>תוצאות חיפוש | רוטשילד 79</title>
        <meta name="description" content="החדרים הזמינים ברוטשילד 79 לפי תאריכי החיפוש שלך" />
      </Head>
      
      <div className="container mx-auto py-8 px-4">
        {/* תקציר החיפוש */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex flex-col md:flex-row gap-4 items-center mb-4 md:mb-0">
              <div className="flex items-center">
                <HiOutlineCalendar className="text-primary-600 ml-2" />
                <span>
                  {formatDate(checkIn)} - {formatDate(checkOut)}
                  <span className="text-sm text-gray-700 mr-2">
                    ({nightsCount} {nightsCount === 1 ? 'לילה' : 'לילות'})
                  </span>
                </span>
              </div>
              <div className="flex items-center">
                <HiOutlineUsers className="text-primary-600 ml-2" />
                <span>
                  {guests} {Number(guests) === 1 ? 'אורח' : 'אורחים'}
                </span>
              </div>
            </div>
            <Link href="/" className="flex items-center text-primary-600 hover:text-primary-800">
              <HiOutlineArrowRight className="ml-1" />
              <span>שינוי חיפוש</span>
            </Link>
          </div>
        </div>
        
        {/* עגלת החדרים - כפתור המשך קבוע למעלה כאשר יש חדרים נבחרים */}
        {selectedRooms.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-8 sticky top-4 z-10 border-r-4 border-accent">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div>
                <h2 className="text-lg font-bold flex items-center text-gray-800">
                  <HiOutlineShoppingCart className="ml-2 text-accent" />
                  <span>נבחרו {selectedRooms.length} {selectedRooms.length === 1 ? 'חדר' : 'חדרים'}</span>
                </h2>
                <div className="text-sm text-gray-700 mt-1">סה"כ ל-{nightsCount} לילות: <span className="text-lg font-bold text-accent">₪{totalPrice}</span></div>
              </div>
              <button
                onClick={proceedToBooking}
                className="bg-accent hover:bg-accent-dark text-white py-3 px-6 rounded-md transition-colors font-bold text-lg shadow-md mt-4 md:mt-0 w-full md:w-auto"
              >
                המשך להזמנה
              </button>
            </div>
            
            <div className="mt-3">
              <button 
                onClick={() => setShowCart(!showCart)}
                className="text-primary-600 hover:text-primary-800 text-sm underline"
              >
                {showCart ? 'הסתר פרטים' : 'הצג פרטי חדרים'}
              </button>
            </div>
            
            {showCart && (
              <div className="mt-4 border-t pt-4">
                {selectedRooms.map((room, index) => (
                  <div key={index} className="flex justify-between items-center p-2 border-b border-gray-100 last:border-b-0">
                    <div>
                      <div className="font-medium text-gray-800">{room.type} - חדר {room.roomNumber}</div>
                      <div className="text-sm text-gray-700">₪{room.pricePerNight} ללילה</div>
                    </div>
                    <button 
                      onClick={() => toggleRoomSelection(room)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                      הסר
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            {filteredRooms.length > 0 
              ? 'חדרים זמינים' 
              : 'אין חדרים זמינים לתאריכים אלה'
            }
          </h1>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center bg-white text-gray-700 px-3 py-1.5 rounded border border-gray-200 text-sm hover:bg-gray-50"
            >
              {showFilters ? (
                <>
                  <HiOutlineX className="ml-1" />
                  סגור מסננים
                </>
              ) : (
                <>
                  <HiOutlineFilter className="ml-1" />
                  סנן תוצאות
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* מסננים */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-lg shadow-md p-4 mb-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  סוג חדר
                </label>
                <select
                  id="type"
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                  className="w-full border-gray-300 rounded p-2 text-sm text-gray-700"
                >
                  <option value="">כל הסוגים</option>
                  <option value="זוגי">זוגי</option>
                  <option value="משפחתי">משפחתי</option>
                  <option value="סוויטה">סוויטה</option>
                </select>
              </div>
              <div>
                <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700 mb-1">
                  מחיר מינימלי
                </label>
                <input
                  type="range"
                  id="minPrice"
                  name="minPrice"
                  min="0"
                  max="1000"
                  step="50"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm text-gray-700">₪{filters.minPrice}</span>
              </div>
              <div>
                <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 mb-1">
                  מחיר מקסימלי
                </label>
                <input
                  type="range"
                  id="maxPrice"
                  name="maxPrice"
                  min="0"
                  max="5000"
                  step="50"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm text-gray-700">₪{filters.maxPrice}</span>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={resetFilters}
                className="text-primary-600 hover:text-primary-800 transition-colors font-medium"
              >
                איפוס פילטרים
              </button>
            </div>
          </motion.div>
        )}
        
        {/* רשימת החדרים */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent"></div>
          </div>
        ) : (
          <>
            {filteredRooms.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-lg text-gray-700 mb-4">לא נמצאו חדרים העונים לדרישות החיפוש שלך.</p>
                <Link href="/" className="text-primary-600 hover:text-primary-800 font-medium">
                  חזרה לחיפוש
                </Link>
              </div>
            ) : (
              <motion.div 
                className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                variants={container}
                initial="hidden"
                animate="show"
              >
                {filteredRooms.map((room) => (
                  <motion.div key={room._id} variants={item}>
                    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
                      <div className="grid md:grid-cols-2">
                        <div className="relative w-full h-48 mb-4 rounded-md overflow-hidden">
                          {/* גלריית תמונות */}
                          {(room.images && room.images.length > 0) ? (
                            <div className="relative w-full h-full image-gallery">
                              <Image
                                src={room.images[0]}
                                alt={`חדר ${room.roomNumber}`}
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                className="object-cover hover:scale-105 transition-transform"
                              />
                              
                              {room.images.length > 1 && (
                                <div className="absolute bottom-0 left-0 right-0 flex justify-center p-2 bg-black bg-opacity-40">
                                  <div className="flex space-x-1">
                                    <button 
                                      className="bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full w-8 h-8 flex items-center justify-center text-gray-800 transition-colors"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const currentImageEl = e.currentTarget.closest('.image-gallery').querySelector('img');
                                        const currentSrc = currentImageEl.src;
                                        const allImages = [...room.images];
                                        const currentIndex = allImages.findIndex(img => img === currentSrc || currentSrc.includes(encodeURIComponent(img)));
                                        const prevIndex = (currentIndex - 1 + allImages.length) % allImages.length;
                                        currentImageEl.src = allImages[prevIndex];
                                      }}
                                    >
                                      <HiOutlineChevronRight />
                                    </button>
                                    <button 
                                      className="bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full w-8 h-8 flex items-center justify-center text-gray-800 transition-colors"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const currentImageEl = e.currentTarget.closest('.image-gallery').querySelector('img');
                                        const currentSrc = currentImageEl.src;
                                        const allImages = [...room.images];
                                        const currentIndex = allImages.findIndex(img => img === currentSrc || currentSrc.includes(encodeURIComponent(img)));
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
                          ) : room.mainImage ? (
                            <div className="relative w-full h-full image-gallery">
                              <Image
                                src={room.mainImage}
                                alt={`חדר ${room.roomNumber}`}
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                className="object-cover hover:scale-105 transition-transform"
                              />
                            </div>
                          ) : (
                            <div className="bg-gray-200 h-48 rounded-t-lg flex items-center justify-center">
                              <span className="text-gray-500">אין תמונה</span>
                            </div>
                          )}
                          <div className="absolute top-2 left-2 bg-white bg-opacity-90 px-3 py-1 rounded-full shadow-md">
                            <span className="text-lg font-bold text-accent">{room.pricePerNight} ₪</span>
                            <span className="text-gray-600 text-sm mr-1">/ לילה</span>
                          </div>
                        </div>
                        <div className="p-6 flex flex-col">
                          <h3 className="text-xl font-bold mb-2 text-gray-800">{room.type} - חדר {room.roomNumber}</h3>
                          <div className="mb-2 text-gray-700 font-medium">
                            <span>עד {room.capacity} אורחים</span>
                            {room.size && <span className="mx-2">|</span>}
                            {room.size && <span>{room.size} מ"ר</span>}
                          </div>
                          <p className="text-gray-700 text-sm mb-4 flex-grow">{room.description}</p>
                          <div className="mt-auto">
                            <div className="flex justify-between items-end mb-4">
                              <div>
                                <div className="text-accent text-2xl font-bold">
                                  ₪{room.pricePerNight} 
                                </div>
                                <div className="text-sm text-gray-700">ללילה</div>
                              </div>
                              <div className="text-gray-800 font-bold">
                                סך הכל: ₪{room.pricePerNight * nightsCount}
                              </div>
                            </div>
                            <button
                              onClick={() => toggleRoomSelection(room)}
                              className={`w-full py-4 rounded-lg transition-all flex items-center justify-center font-bold text-lg shadow-lg border-2 ${
                                isRoomSelected(room._id)
                                  ? 'bg-green-600 hover:bg-green-500 text-white border-green-500 mt-2 mb-1'
                                  : 'bg-blue-700 hover:bg-blue-600 text-white border-blue-600 mt-2 mb-1'
                              }`}
                            >
                              {isRoomSelected(room._id) ? (
                                <>
                                  <HiOutlineCheck className="ml-2 text-xl" />
                                  <span className="text-shadow">החדר נבחר - לחץ להסרה</span>
                                </>
                              ) : (
                                <>
                                  <HiOutlinePlusCircle className="ml-2 text-xl" />
                                  <span className="text-shadow">בחר חדר זה</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage;

<style jsx global>{`
  .text-shadow {
    text-shadow: 0px 1px 2px rgba(0,0,0,0.3);
  }
`}</style> 