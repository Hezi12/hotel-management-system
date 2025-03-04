const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: [true, 'יש להזין מספר חדר'],
    unique: true,
    trim: true
  },
  type: {
    type: String,
    required: [true, 'יש להזין סוג חדר'],
    enum: [
      'יחיד',
      'זוגי',
      'זוגי פלוס',
      'משפחתי',
      'סוויטה',
      'סוויטת יוקרה'
    ]
  },
  capacity: {
    type: Number,
    required: [true, 'יש להזין קיבולת אורחים'],
    min: 1,
    max: 6
  },
  pricePerNight: {
    type: Number,
    required: [true, 'יש להזין מחיר ללילה'],
    min: 0
  },
  description: {
    type: String,
    required: [true, 'יש להזין תיאור חדר'],
    trim: true
  },
  features: {
    type: [String],
    default: []
  },
  images: {
    type: [String],
    default: []
  },
  mainImage: {
    type: String,
    default: 'https://placehold.co/600x400?text=חדר'
  },
  floor: {
    type: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['פנוי', 'תפוס', 'בניקיון', 'בתחזוקה'],
    default: 'פנוי'
  },
  size: {
    type: Number, // במטרים רבועים
    default: 0
  },
  amenities: {
    wifi: {
      type: Boolean,
      default: true
    },
    tv: {
      type: Boolean,
      default: true
    },
    airConditioner: {
      type: Boolean,
      default: true
    },
    minibar: {
      type: Boolean,
      default: false
    },
    safetyBox: {
      type: Boolean,
      default: false
    },
    balcony: {
      type: Boolean,
      default: false
    },
    parkingIncluded: {
      type: Boolean,
      default: false
    },
    breakfastIncluded: {
      type: Boolean,
      default: false
    }
  },
  bedType: {
    type: String,
    enum: ['יחיד', 'זוגי', 'זוגי גדול', 'מיטות נפרדות', 'משפחתי'],
    default: 'זוגי'
  },
  extraBed: {
    available: {
      type: Boolean,
      default: false
    },
    maxCount: {
      type: Number,
      default: 0
    },
    pricePerNight: {
      type: Number,
      default: 0
    }
  },
  notes: {
    type: String,
    default: ''
  },
  lastMaintenance: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// וירטואל לשם המלא של החדר (מספר חדר + סוג)
RoomSchema.virtual('fullName').get(function() {
  return `${this.roomNumber} - ${this.type}`;
});

// מתודה סטטית לבדיקת זמינות חדרים
RoomSchema.statics.checkAvailability = async function(checkIn, checkOut) {
  const Booking = require('./Booking');
  
  // המרת תאריכים ל-Date objects אם הם לא כאלה
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  
  // קבלת כל החדרים הפעילים
  const rooms = await this.find({ isActive: true });
  
  // עבור כל חדר, נבדוק אם יש לו הזמנות בתאריכים המבוקשים
  const availableRooms = [];
  
  for (const room of rooms) {
    const bookings = await Booking.find({
      room: room._id,
      $or: [
        // הזמנה שמתחילה בטווח המבוקש
        { checkIn: { $gte: checkInDate, $lt: checkOutDate } },
        // הזמנה שמסתיימת בטווח המבוקש
        { checkOut: { $gt: checkInDate, $lte: checkOutDate } },
        // הזמנה שמכסה את כל הטווח המבוקש
        { checkIn: { $lte: checkInDate }, checkOut: { $gte: checkOutDate } }
      ]
    });
    
    if (bookings.length === 0) {
      availableRooms.push(room);
    }
  }
  
  return availableRooms;
};

// שימוש בטוסטמפים ובוירטואלס
RoomSchema.set('toJSON', { virtuals: true });
RoomSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Room', RoomSchema); 