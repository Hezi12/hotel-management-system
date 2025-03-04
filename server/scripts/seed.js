const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');
const Room = require('../models/Room');
const connectDB = require('../config/db');

// טעינת משתני סביבה
dotenv.config();

// פונקציה לאכלוס מסד הנתונים בנתוני דמו
const seedDatabase = async () => {
  try {
    // התחברות למסד הנתונים
    await connectDB();
    console.log('התחברות למסד הנתונים הושלמה');

    // מחיקת כל הנתונים הקיימים (זהירות - לא לעשות בסביבת ייצור!)
    await User.deleteMany({});
    await Room.deleteMany({});
    console.log('נתונים קיימים נמחקו בהצלחה');

    // יצירת משתמש אדמין
    const adminUser = new User({
      name: 'מנהל המערכת',
      email: 'schwartzhezi@gmail.com',
      password: '111111',
      role: 'admin',
      phone: '050-1234567',
      position: 'מנהל מלון',
      isActive: true
    });

    await adminUser.save();
    console.log('משתמש אדמין נוצר בהצלחה:', adminUser.email);

    // יצירת משתמש מנהל
    const managerUser = new User({
      name: 'רינת כהן',
      email: 'manager@rothschild-hotel.co.il',
      password: 'manager123',
      role: 'manager',
      phone: '052-9876543',
      position: 'מנהלת קבלה',
      isActive: true
    });

    await managerUser.save();
    console.log('משתמש מנהל נוצר בהצלחה:', managerUser.email);

    // יצירת חדרים לדוגמה
    const roomsData = [
      {
        roomNumber: '1',
        type: 'זוגי',
        capacity: 2,
        pricePerNight: 400,
        size: 20,
        description: 'חדר זוגי עם מיטה זוגית, מטבחון קטן, שירותים ומקלחת.',
        features: ['מיטה זוגית', 'מטבחון', 'מקלחת', 'שירותים', 'מיזוג אוויר', 'טלוויזיה', 'Wi-Fi חופשי'],
        images: [
          'https://placehold.co/600x400/f8f8f8/d8d8d8?text=חדר+1',
          'https://placehold.co/600x400/f8f8f8/d8d8d8?text=מקלחת+1'
        ],
        floor: 1,
        isActive: true,
        extraBed: {
          available: false,
          maxCount: 0,
          pricePerNight: 0
        }
      },
      {
        roomNumber: '3',
        type: 'זוגי',
        capacity: 2,
        pricePerNight: 400,
        size: 20,
        description: 'חדר זוגי עם מיטה זוגית, מטבחון קטן, שירותים ומקלחת.',
        features: ['מיטה זוגית', 'מטבחון', 'מקלחת', 'שירותים', 'מיזוג אוויר', 'טלוויזיה', 'Wi-Fi חופשי'],
        images: [
          'https://placehold.co/600x400/f8f8f8/d8d8d8?text=חדר+3',
          'https://placehold.co/600x400/f8f8f8/d8d8d8?text=מקלחת+3'
        ],
        floor: 1,
        isActive: true,
        extraBed: {
          available: false,
          maxCount: 0,
          pricePerNight: 0
        }
      },
      {
        roomNumber: '4',
        type: 'זוגי',
        capacity: 2,
        pricePerNight: 400,
        size: 20,
        description: 'חדר זוגי עם מיטה זוגית, מטבחון קטן, שירותים ומקלחת.',
        features: ['מיטה זוגית', 'מטבחון', 'מקלחת', 'שירותים', 'מיזוג אוויר', 'טלוויזיה', 'Wi-Fi חופשי'],
        images: [
          'https://placehold.co/600x400/f8f8f8/d8d8d8?text=חדר+4',
          'https://placehold.co/600x400/f8f8f8/d8d8d8?text=מקלחת+4'
        ],
        floor: 1,
        isActive: true,
        extraBed: {
          available: false,
          maxCount: 0,
          pricePerNight: 0
        }
      },
      {
        roomNumber: '6',
        type: 'זוגי',
        capacity: 2,
        pricePerNight: 400,
        size: 20,
        description: 'חדר זוגי עם מיטה זוגית, מטבחון קטן, שירותים ומקלחת.',
        features: ['מיטה זוגית', 'מטבחון', 'מקלחת', 'שירותים', 'מיזוג אוויר', 'טלוויזיה', 'Wi-Fi חופשי'],
        images: [
          'https://placehold.co/600x400/f8f8f8/d8d8d8?text=חדר+6',
          'https://placehold.co/600x400/f8f8f8/d8d8d8?text=מקלחת+6'
        ],
        floor: 1,
        isActive: true,
        extraBed: {
          available: false,
          maxCount: 0,
          pricePerNight: 0
        }
      },
      {
        roomNumber: '13',
        type: 'זוגי פלוס',
        capacity: 3,
        pricePerNight: 420,
        size: 24,
        description: 'חדר זוגי עם אפשרות למיטה נוספת, מתאים עד 3 אנשים. כולל מטבחון, שירותים ומקלחת.',
        features: ['מיטה זוגית', 'מיטה נוספת אופציונלית', 'מטבחון', 'מקלחת', 'שירותים', 'מיזוג אוויר', 'טלוויזיה', 'Wi-Fi חופשי'],
        images: [
          'https://placehold.co/600x400/f8f8f8/d8d8d8?text=חדר+13',
          'https://placehold.co/600x400/f8f8f8/d8d8d8?text=מקלחת+13'
        ],
        floor: 2,
        isActive: true,
        extraBed: {
          available: true,
          maxCount: 1,
          pricePerNight: 50
        }
      },
      {
        roomNumber: '21',
        type: 'זוגי פלוס',
        capacity: 3,
        pricePerNight: 450,
        size: 28,
        description: 'חדר זוגי מפנק עם אמבטיה וג׳קוזי ומרפסת. אפשרות למיטה נוספת, מתאים עד 3 אנשים.',
        features: ['מיטה זוגית', 'אמבטיה עם ג׳קוזי', 'מרפסת', 'מיטה נוספת אופציונלית', 'מטבחון', 'שירותים', 'מיזוג אוויר', 'טלוויזיה', 'Wi-Fi חופשי'],
        images: [
          'https://placehold.co/600x400/f8f8f8/d8d8d8?text=חדר+21',
          'https://placehold.co/600x400/f8f8f8/d8d8d8?text=אמבטיה+21',
          'https://placehold.co/600x400/f8f8f8/d8d8d8?text=מרפסת+21'
        ],
        floor: 2,
        isActive: true,
        extraBed: {
          available: true,
          maxCount: 1,
          pricePerNight: 50
        }
      },
      {
        roomNumber: '17',
        type: 'משפחתי',
        capacity: 4,
        pricePerNight: 470,
        size: 32,
        description: 'חדר משפחתי עם מיטה זוגית וספה הנפתחת למיטה זוגית, מתאים עד 4 אנשים.',
        features: ['מיטה זוגית', 'ספה נפתחת למיטה זוגית', 'מטבחון', 'מקלחת', 'שירותים', 'מיזוג אוויר', 'טלוויזיה', 'Wi-Fi חופשי'],
        images: [
          'https://placehold.co/600x400/f8f8f8/d8d8d8?text=חדר+17',
          'https://placehold.co/600x400/f8f8f8/d8d8d8?text=מקלחת+17'
        ],
        floor: 2,
        isActive: true,
        extraBed: {
          available: true,
          maxCount: 2,
          pricePerNight: 50
        }
      }
    ];

    const rooms = await Room.insertMany(roomsData);
    console.log(`${rooms.length} חדרים נוצרו בהצלחה`);

    console.log('תהליך אכלוס מסד הנתונים הושלם בהצלחה');
    process.exit(0);
  } catch (error) {
    console.error('שגיאה באכלוס מסד הנתונים:', error);
    process.exit(1);
  }
};

// הפעלת פונקציית האכלוס
seedDatabase(); 