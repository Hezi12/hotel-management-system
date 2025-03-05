import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Head from 'next/head';
import { FaPlus, FaEdit, FaTrash, FaEye, FaBed, FaUsers, FaTag, FaLevelUpAlt, FaCheck, FaTimes, FaImages } from 'react-icons/fa';
import axios from 'axios';
import { useRouter } from 'next/router';

const RoomsManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(null);
  const router = useRouter();
  
  // מצב טופס
  const [formData, setFormData] = useState({
    roomNumber: '',
    type: '',
    description: '',
    capacity: 1,
    pricePerNight: 0,
    floor: 0,
    isActive: true,
    amenities: []
  });
  
  // רשימת תוספות אפשריות לחדר
  const availableAmenities = [
    'מיזוג אוויר',
    'טלוויזיה',
    'WiFi',
    'מקרר',
    'מיני בר',
    'כספת',
    'מרפסת',
    'נוף לים',
    'ג׳קוזי',
    'מכונת קפה'
  ];
  
  // סוגי חדרים
  const roomTypes = [
    'סטנדרט',
    'דלקס',
    'סוויטה',
    'סוויטה משפחתית',
    'פנטהאוז'
  ];
  
  // הגדרת החדרים הקבועים במערכת - הוספת חדר 17
  const predefinedRooms = [
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
      mainImage: "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
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
      mainImage: "https://images.unsplash.com/photo-1625244724120-1fd1d34d00f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    }
  ];
  
  // משתנה מצב חדש - האם יש שינויים שטרם נשמרו
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  
  // פונקציה להצגת התצוגה של ניהול תמונות לחדר ספציפי
  const [showImageManager, setShowImageManager] = useState(false);
  const [currentRoomForImages, setCurrentRoomForImages] = useState(null);
  
  useEffect(() => {
    // ננסה לטעון מ-localStorage בעת טעינת הדף
    try {
      const savedRooms = localStorage.getItem('hotelRooms');
      if (savedRooms) {
        setRooms(JSON.parse(savedRooms));
        setIsLoading(false);
      } else {
        // אם אין נתונים ב-localStorage, נטען באמצעות fetchRooms
        fetchRooms();
      }
    } catch (error) {
      console.error('שגיאה בטעינת חדרים מ-localStorage:', error);
      fetchRooms();
    }
  }, []);
  
  const fetchRooms = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // נדמה השהיה קצרה כמו בקריאת שרת אמיתית
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // קודם כל ננסה לטעון מ-localStorage
      const storedRooms = localStorage.getItem('hotelRooms');
      if (storedRooms) {
        setRooms(JSON.parse(storedRooms));
      } else {
        // אם אין נתונים ב-localStorage, נשתמש בחדרים המוגדרים מראש
        setRooms(predefinedRooms);
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('שגיאה בטעינת החדרים:', err);
      setError('אירעה שגיאה בטעינת נתוני החדרים. נסה שוב מאוחר יותר.');
      setIsLoading(false);
    }
  };
  
  const handleAddRoom = () => {
    setCurrentRoom({
      _id: '',
      roomNumber: '',
      type: '',
      description: '',
      capacity: 2,
      pricePerNight: 0,
      isActive: true,
      amenities: [],
      images: [],
      mainImage: null
    });
    setShowModal(true);
  };
  
  const handleEditRoom = (room) => {
    setCurrentRoom(room);
    setFormData({
      roomNumber: room.roomNumber,
      type: room.type,
      description: room.description,
      capacity: room.capacity,
      pricePerNight: room.pricePerNight,
      floor: room.floor,
      isActive: room.isActive,
      amenities: [...room.amenities]
    });
    setShowModal(true);
  };
  
  const handleDeleteRoom = async (roomId) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק חדר זה?')) {
      try {
        // במערכת אמיתית נקרא ל-API
        // await axios.delete(`/api/rooms/${roomId}`);
        
        // עדכון זמני של הממשק
        setRooms(rooms.filter(room => room._id !== roomId));
        alert('החדר נמחק בהצלחה!');
      } catch (err) {
        console.error('שגיאה במחיקת החדר:', err);
        alert('אירעה שגיאה במחיקת החדר.');
      }
    }
  };
  
  const handleToggleStatus = async (room) => {
    try {
      const updatedRoom = { ...room, isActive: !room.isActive };
      
      // במערכת אמיתית נקרא ל-API
      // await axios.put(`/api/rooms/${room._id}`, updatedRoom);
      
      // עדכון זמני של הממשק
      setRooms(rooms.map(r => r._id === room._id ? updatedRoom : r));
    } catch (err) {
      console.error('שגיאה בעדכון סטטוס החדר:', err);
      alert('אירעה שגיאה בעדכון סטטוס החדר.');
    }
  };
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleAmenityChange = (amenity) => {
    const updatedAmenities = formData.amenities.includes(amenity)
      ? formData.amenities.filter(a => a !== amenity)
      : [...formData.amenities, amenity];
    
    setFormData({
      ...formData,
      amenities: updatedAmenities
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // וידוא תקינות הנתונים
    if (!currentRoom.roomNumber || !currentRoom.type || !currentRoom.description || !currentRoom.capacity || !currentRoom.pricePerNight) {
      setError('נא למלא את כל השדות החובה');
      return;
    }
    
    try {
      let updatedRooms;
      
      if (currentRoom._id) {
        // עדכון חדר קיים
        updatedRooms = rooms.map(room => 
          room._id === currentRoom._id ? currentRoom : room
        );
      } else {
        // הוספת חדר חדש
        const newRoom = {
          ...currentRoom,
          _id: Date.now().toString(), // מזהה זמני לחדר חדש
        };
        updatedRooms = [...rooms, newRoom];
      }
      
      setRooms(updatedRooms);
      setUnsavedChanges(true);
      setShowModal(false);
      setCurrentRoom(null);
      
      // שמירה אוטומטית לאחר שינוי חדר
      try {
        localStorage.setItem('hotelRooms', JSON.stringify(updatedRooms));
        setUnsavedChanges(false);
      } catch (error) {
        console.error('שגיאה בשמירת השינויים:', error);
      }
      
    } catch (err) {
      console.error('שגיאה בשמירת החדר:', err);
      setError('אירעה שגיאה בשמירת החדר. נסה שוב מאוחר יותר.');
    }
  };
  
  // עדכון פונקציית העלאת התמונות המרובות
  const handleMultipleImageUpload = async (e, roomId) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const newImages = [];
      
      // עיבוד התמונות שנבחרו
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // וידוא שזה קובץ תמונה
        if (!file.type.startsWith('image/')) {
          alert(`הקובץ ${file.name} אינו תמונה ולכן דולג.`);
          continue;
        }
        
        // המרת התמונה ל-Base64
        const base64 = await convertToBase64(file);
        newImages.push(base64);
      }
      
      if (newImages.length === 0) {
        alert('לא נמצאו תמונות תקינות להעלאה');
        return;
      }
      
      let updatedRoom = null;
      
      // עדכון מערך החדרים
      const updatedRooms = rooms.map(room => {
        if (room._id === roomId) {
          // עיבוד התמונות הקיימות והחדשות
          const allImages = [...newImages, ...(room.images || [])];
          
          // שימוש בתמונה הראשונה מהחדשות כתמונה ראשית אם מעלים תמונות חדשות
          updatedRoom = {
            ...room,
            images: allImages,
            // כאשר מעלים תמונות חדשות, התמונה הראשונה מהן תהיה התמונה הראשית
            mainImage: newImages[0]
          };
          return updatedRoom;
        }
        return room;
      });
      
      setRooms(updatedRooms);
      
      // עדכון גם את החדר הנוכחי במודאל ניהול התמונות אם זה אותו חדר
      if (currentRoomForImages && currentRoomForImages._id === roomId) {
        setCurrentRoomForImages(updatedRoom);
      }
      
      setUnsavedChanges(true);
      
      // שמירה אוטומטית ל-localStorage מיד לאחר העלאה
      localStorage.setItem('hotelRooms', JSON.stringify(updatedRooms));
      
      // הודעה למשתמש
      alert(`הועלו ${newImages.length} תמונות בהצלחה לחדר ${rooms.find(r => r._id === roomId)?.roomNumber || roomId}!`);
    } catch (err) {
      console.error('שגיאה בהעלאת התמונות:', err);
      alert('אירעה שגיאה בהעלאת התמונות.');
    }
  };
  
  // פונקציה לשמירת השינויים
  const saveChanges = () => {
    try {
      // שמירה ב-localStorage - ללא עיבוד נוסף של התמונות
      localStorage.setItem('hotelRooms', JSON.stringify(rooms));
      
      setUnsavedChanges(false);
      alert('השינויים נשמרו בהצלחה!');
    } catch (error) {
      console.error('שגיאה בשמירת השינויים:', error);
      alert('אירעה שגיאה בשמירת השינויים.');
    }
  };
  
  // פונקציה להגדרת תמונה ראשית
  const setMainImage = (roomId, imageUrl) => {
    let updatedRoom = null;
    const updatedRooms = rooms.map(room => {
      if (room._id === roomId) {
        updatedRoom = {
          ...room,
          mainImage: imageUrl
        };
        return updatedRoom;
      }
      return room;
    });
    
    setRooms(updatedRooms);
    
    // עדכון גם את החדר הנוכחי במודאל ניהול התמונות אם זה אותו חדר
    if (currentRoomForImages && currentRoomForImages._id === roomId) {
      setCurrentRoomForImages(updatedRoom);
    }
    
    setUnsavedChanges(true);
    
    // שמירה אוטומטית ל-localStorage
    localStorage.setItem('hotelRooms', JSON.stringify(updatedRooms));
  };
  
  // פונקציה להסרת תמונה
  const removeImage = (roomId, imageUrl) => {
    let updatedRoom = null;
    const updatedRooms = rooms.map(room => {
      if (room._id === roomId) {
        const updatedImages = room.images.filter(img => img !== imageUrl);
        
        // אם התמונה שהוסרה היא התמונה הראשית, נעדכן את התמונה הראשית
        let updatedMainImage = room.mainImage;
        if (room.mainImage === imageUrl) {
          updatedMainImage = updatedImages.length > 0 ? updatedImages[0] : null;
        }
        
        updatedRoom = {
          ...room,
          images: updatedImages,
          mainImage: updatedMainImage
        };
        return updatedRoom;
      }
      return room;
    });
    
    setRooms(updatedRooms);
    
    // עדכון גם את החדר הנוכחי במודאל ניהול התמונות אם זה אותו חדר
    if (currentRoomForImages && currentRoomForImages._id === roomId) {
      setCurrentRoomForImages(updatedRoom);
    }
    
    setUnsavedChanges(true);
    
    // שמירה אוטומטית ל-localStorage
    localStorage.setItem('hotelRooms', JSON.stringify(updatedRooms));
  };
  
  // פונקציה לפתיחת מנהל התמונות
  const openImageManager = (room) => {
    setCurrentRoomForImages(room);
    setShowImageManager(true);
  };
  
  // פונקציה לסגירת מנהל התמונות
  const closeImageManager = () => {
    setShowImageManager(false);
    setCurrentRoomForImages(null);
  };
  
  // עדכון פונקציית החדרים ב-localStorage בכל פעם שהם משתנים
  useEffect(() => {
    if (rooms.length > 0) {
      try {
        localStorage.setItem('hotelRooms', JSON.stringify(rooms));
      } catch (error) {
        console.error('שגיאה בשמירת החדרים ל-localStorage:', error);
      }
    }
  }, [rooms]);
  
  // פונקציה להמרת קובץ ל-Base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };
  
  return (
    <Layout>
      <Head>
        <title>ניהול חדרים | רוטשילד 79</title>
      </Head>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">ניהול חדרים</h1>
          <div className="flex items-center space-x-3 space-x-reverse">
            {unsavedChanges && (
              <button 
                onClick={saveChanges}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center ml-3"
              >
                <FaCheck className="mr-2" /> שמור שינויים
              </button>
            )}
            <button 
              onClick={handleAddRoom}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <FaPlus className="mr-2" /> הוסף חדר חדש
            </button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="text-center py-20">
            <div className="spinner"></div>
            <p className="mt-4 text-gray-600">טוען נתונים...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border-r-4 border-red-500 text-red-700 p-4 rounded mb-6">
            <p>{error}</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      מספר חדר
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      סוג
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      קיבולת
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      מחיר ללילה
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      תמונות
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      סטטוס
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      פעולות
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rooms.map((room) => (
                    <tr key={room._id} className={!room.isActive ? 'bg-gray-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {room.roomNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {room.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <div className="flex items-center">
                          <FaUsers className="text-gray-400 ml-1" />
                          <span>{room.capacity}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <div className="flex items-center">
                          <FaTag className="text-gray-400 ml-1" />
                          <span>₪{room.pricePerNight}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <div className="flex items-center">
                          {room.images && room.images.length > 0 ? (
                            <div className="flex space-x-1 space-x-reverse">
                              {room.images.slice(0, 3).map((image, index) => (
                                <div key={index} className="h-8 w-8 rounded overflow-hidden relative">
                                  <img
                                    src={image}
                                    alt={`תמונה ${index + 1}`}
                                    className="h-full w-full object-cover"
                                  />
                                  {room.mainImage === image && (
                                    <div className="absolute top-0 right-0 h-2 w-2 bg-accent rounded-full"></div>
                                  )}
                                </div>
                              ))}
                              {room.images.length > 3 && (
                                <span className="text-xs text-gray-500">+{room.images.length - 3}</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">אין תמונות</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span 
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${room.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'}`}
                        >
                          {room.isActive ? 'פעיל' : 'לא פעיל'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 space-x-reverse">
                        <button
                          onClick={() => openImageManager(room)}
                          className="text-blue-600 hover:text-blue-900 ml-2"
                          title="ניהול תמונות"
                        >
                          <FaImages className="inline" /> תמונות
                        </button>
                        <button
                          onClick={() => handleEditRoom(room)}
                          className="text-indigo-600 hover:text-indigo-900 ml-2"
                        >
                          <FaEdit className="inline" /> עריכה
                        </button>
                        <button
                          onClick={() => handleToggleStatus(room)}
                          className={`ml-2 ${room.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                        >
                          {room.isActive ? (
                            <>
                              <FaTimes className="inline" /> השבת
                            </>
                          ) : (
                            <>
                              <FaCheck className="inline" /> הפעל
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      
      {/* מודאל הוספת/עריכת חדר */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b">
              <h3 className="text-xl font-medium">
                {currentRoom?._id ? 'עריכת חדר' : 'הוספת חדר חדש'}
              </h3>
            </div>
            
            <div className="px-6 py-4">
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="roomNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    מספר חדר <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="roomNumber"
                    name="roomNumber"
                    value={currentRoom?.roomNumber || ''}
                    onChange={handleChange}
                    required
                    className="shadow-sm focus:ring-accent focus:border-accent block w-full sm:text-sm border-gray-300 rounded-md p-2"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                    סוג חדר <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="type"
                    name="type"
                    value={currentRoom?.type || ''}
                    onChange={handleChange}
                    required
                    className="shadow-sm focus:ring-accent focus:border-accent block w-full sm:text-sm border-gray-300 rounded-md p-2"
                    placeholder="למשל: זוגי, משפחתי, זוגי פלוס, סוויטה"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    הזן את סוג החדר ישירות (לדוגמה: זוגי, משפחתי, זוגי פלוס, סוויטה)
                  </p>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    תיאור <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={currentRoom?.description || ''}
                    onChange={handleChange}
                    rows={3}
                    required
                    className="shadow-sm focus:ring-accent focus:border-accent block w-full sm:text-sm border-gray-300 rounded-md p-2"
                  />
                </div>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="mb-4">
                    <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">
                      קיבולת <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="capacity"
                      name="capacity"
                      value={currentRoom?.capacity || ''}
                      onChange={handleChange}
                      min={1}
                      required
                      className="shadow-sm focus:ring-accent focus:border-accent block w-full sm:text-sm border-gray-300 rounded-md p-2"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="pricePerNight" className="block text-sm font-medium text-gray-700 mb-1">
                      מחיר ללילה (₪) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="pricePerNight"
                      name="pricePerNight"
                      value={currentRoom?.pricePerNight || ''}
                      onChange={handleChange}
                      min={0}
                      required
                      className="shadow-sm focus:ring-accent focus:border-accent block w-full sm:text-sm border-gray-300 rounded-md p-2"
                    />
                  </div>
                </div>
                
                {/* תוספות */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">תוספות</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {availableAmenities.map((amenity, index) => (
                      <label key={index} className="inline-flex items-center bg-gray-50 p-2 rounded">
                        <input
                          type="checkbox"
                          checked={formData.amenities.includes(amenity)}
                          onChange={() => handleAmenityChange(amenity)}
                          className="form-checkbox"
                        />
                        <span className="mr-2 text-sm">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* תמונות */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">תמונות החדר</label>
                  
                  {/* תצוגת התמונות הקיימות */}
                  {currentRoom?.images && currentRoom.images.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-4">
                      {currentRoom.images.map((imageUrl, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={imageUrl} 
                            alt={`תמונה ${index + 1}`} 
                            className={`w-full h-24 object-cover rounded ${currentRoom.mainImage === imageUrl ? 'border-2 border-accent' : ''}`}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity rounded">
                            {currentRoom.mainImage !== imageUrl && (
                              <button
                                type="button"
                                onClick={() => setMainImage(currentRoom._id, imageUrl)}
                                className="bg-blue-500 hover:bg-blue-600 text-white p-1 rounded text-xs"
                              >
                                הגדר כראשית
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => removeImage(currentRoom._id, imageUrl)}
                              className="bg-red-500 hover:bg-red-600 text-white p-1 rounded text-xs"
                            >
                              הסר
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 mb-4 text-sm">אין תמונות לחדר זה</p>
                  )}
                  
                  {/* טופס העלאת תמונות - תמיכה בהעלאה מרובה */}
                  {currentRoom?._id && (
                    <div className="border border-dashed border-gray-300 rounded p-4">
                      <p className="text-sm text-gray-600 mb-2">העלה תמונות לחדר:</p>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleMultipleImageUpload(e, currentRoom._id)}
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded file:border-0
                          file:text-sm file:font-semibold
                          file:bg-accent file:text-white
                          hover:file:bg-accent-dark
                        "
                      />
                      <p className="mt-2 text-xs text-gray-500">
                        ניתן לבחור מספר תמונות בו-זמנית (העלאה מרובה). תמונות מומלצות: רזולוציה גבוהה ביחס 16:9 (מומלץ 1920x1080 פיקסלים).
                      </p>
                      <p className="mt-1 text-xs text-gray-500 font-medium">
                        לאחר העלאת התמונות, לחץ על כפתור "שמור שינויים" בראש העמוד כדי לשמור את השינויים.
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded"
                  >
                    ביטול
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-accent hover:bg-accent-dark text-white rounded"
                  >
                    {currentRoom?._id ? 'עדכן חדר' : 'הוסף חדר'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* מודל ניהול תמונות */}
      {showImageManager && currentRoomForImages && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">ניהול תמונות - חדר {currentRoomForImages.roomNumber}</h2>
              <button onClick={closeImageManager} className="text-gray-500 hover:text-gray-700">
                <FaTimes className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6 p-4 bg-gray-50 rounded border border-gray-200">
              <h3 className="text-md font-medium mb-2 text-gray-700">הנחיות:</h3>
              <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                <li>העלה תמונות ספציפיות לחדר זה בלבד</li>
                <li>התמונה המסומנת במסגרת צבעונית היא התמונה הראשית שתופיע בדף הראשי ובחיפוש</li>
                <li>לחץ על "הגדר כראשית" כדי לשנות את התמונה הראשית</li>
                <li>מומלץ להעלות תמונות באיכות טובה וביחס גובה-רוחב אחיד</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">תמונות חדר {currentRoomForImages.roomNumber}</h3>
              {currentRoomForImages.images && currentRoomForImages.images.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                  {currentRoomForImages.images.map((imageUrl, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={imageUrl} 
                        alt={`תמונה ${index + 1}`} 
                        className={`w-full h-40 object-cover rounded ${currentRoomForImages.mainImage === imageUrl ? 'border-4 border-blue-500' : 'border border-gray-200'}`}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity rounded">
                        {currentRoomForImages.mainImage !== imageUrl && (
                          <button
                            type="button"
                            onClick={() => setMainImage(currentRoomForImages._id, imageUrl)}
                            className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded text-sm"
                          >
                            הגדר כראשית
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(currentRoomForImages._id, imageUrl)}
                          className="bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded text-sm"
                        >
                          הסר
                        </button>
                      </div>
                      {currentRoomForImages.mainImage === imageUrl && (
                        <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs py-1 px-2 rounded-full">
                          ראשית
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                  <p className="text-gray-500 mb-2">אין תמונות לחדר זה</p>
                  <p className="text-gray-400 text-sm">העלה תמונות באמצעות הכפתור למטה</p>
                </div>
              )}

              <label htmlFor="roomImages" className="block w-full">
                <div className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-lg p-6 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                  <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12"></path>
                  </svg>
                  <p className="text-sm text-gray-600">לחץ להעלאת תמונות חדשות לחדר זה</p>
                  <p className="text-xs text-gray-500 mt-1">ניתן לבחור מספר תמונות בבת אחת</p>
                </div>
                <input 
                  id="roomImages" 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  className="hidden" 
                  onChange={(e) => handleMultipleImageUpload(e, currentRoomForImages._id)}
                />
              </label>
            </div>

            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={closeImageManager}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                סגור
              </button>
            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .spinner {
          border: 4px solid rgba(0, 0, 0, 0.1);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border-left-color: #3b82f6;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </Layout>
  );
};

export default RoomsManagement; 