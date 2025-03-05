import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { HiOutlineUsers, HiOutlineHome } from 'react-icons/hi';

const RoomCard = ({ room }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // נתונים לדוגמה במקרה שאין נתוני חדר אמיתיים
  const demoRoom = {
    _id: 'demo-room-1',
    roomNumber: '101',
    type: 'חדר סטנדרט',
    capacity: 2,
    pricePerNight: 350,
    description: 'חדר נעים עם כל הנוחיות הבסיסיות',
    amenities: ['מקלחת', 'מיזוג אוויר', 'Wi-Fi', 'טלוויזיה'],
    images: ['https://placehold.co/600x400/f8f8f8/d8d8d8?text=תמונת+חדר'],
    isActive: true,
    floor: 1
  };

  // שימוש בנתוני דמו אם אין נתונים אמיתיים
  const roomData = room || demoRoom;
  
  // לוגיקה משופרת לבחירת תמונת תצוגה:
  // 1. אם יש תמונות אחרות במערך images, נשתמש בתמונה הראשונה משם ונתעלם מ-mainImage
  // 2. אם אין תמונות ב-images, רק אז נשתמש ב-mainImage אם הוא קיים
  // 3. אם אין גם mainImage וגם אין תמונות ב-images, נציג תמונת ברירת מחדל
  const displayImage = 
    (roomData.images && roomData.images.length > 0) ? 
      roomData.images[0] : 
      (roomData.mainImage || 'https://placehold.co/600x400/f8f8f8/d8d8d8?text=אין+תמונה');
  
  return (
    <motion.div 
      className="card-minimal group"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={displayImage}
          alt={`חדר ${roomData.roomNumber}`}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          style={{ 
            objectFit: 'cover',
            filter: isHovered ? 'none' : 'grayscale(10%)'
          }}
          className="transition-all duration-300 ease-in-out"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-white px-3 py-1.5 text-sm text-gray-700">
          {roomData.roomNumber} | {roomData.type}
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <HiOutlineUsers className="text-gray-400" />
            <span className="text-sm text-gray-500">{roomData.capacity} אורחים</span>
          </div>
          <div className="text-lg font-medium">₪{roomData.pricePerNight}</div>
        </div>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{roomData.description}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {roomData.amenities.slice(0, 3).map((amenity, index) => (
            <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded-sm">
              {amenity}
            </span>
          ))}
          {roomData.amenities.length > 3 && (
            <span className="text-xs text-gray-500">
              +{roomData.amenities.length - 3}
            </span>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Link href={`/rooms/${roomData._id}`} className="block flex-1">
            <button className="w-full text-center py-2 border border-neutral-500 hover:border-neutral-700 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-medium text-sm transition-colors">
              פרטים נוספים
            </button>
          </Link>
          <Link href={`/booking?roomId=${roomData._id}`} className="block flex-1">
            <button className="w-full text-center py-2 bg-neutral-800 text-white hover:bg-neutral-900 font-medium text-sm transition-colors">
              הזמן עכשיו
            </button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default RoomCard;