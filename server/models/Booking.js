const mongoose = require('mongoose');
const crypto = require('crypto');

const BookingSchema = new mongoose.Schema({
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  guestName: {
    type: String,
    required: [true, 'שם האורח הוא שדה חובה'],
    trim: true
  },
  guestEmail: {
    type: String,
    required: [true, 'דוא"ל האורח הוא שדה חובה'],
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'נא להזין כתובת דוא"ל תקינה'
    ]
  },
  guestPhone: {
    type: String,
    required: [true, 'מספר טלפון האורח הוא שדה חובה'],
    trim: true
  },
  checkIn: {
    type: Date,
    required: [true, "תאריך צ'ק-אין הוא שדה חובה"]
  },
  checkOut: {
    type: Date,
    required: [true, "תאריך צ'ק-אאוט הוא שדה חובה"]
  },
  numberOfGuests: {
    type: Number,
    required: [true, 'מספר אורחים הוא שדה חובה'],
    min: 1,
    max: 6
  },
  totalPrice: {
    type: Number,
    required: [true, 'מחיר סופי הוא שדה חובה']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'paypal', 'cash', 'bank_transfer', 'other'],
    default: 'credit_card'
  },
  paymentDetails: {
    type: Object,
    default: {}
  },
  confirmationCode: {
    type: String,
    unique: true
  },
  specialRequests: {
    type: String,
    default: ''
  },
  isCheckedIn: {
    type: Boolean,
    default: false
  },
  checkedInAt: {
    type: Date,
    default: null
  },
  isCheckedOut: {
    type: Boolean,
    default: false
  },
  checkedOutAt: {
    type: Date,
    default: null
  },
  cancellationReason: {
    type: String,
    default: ''
  },
  bookingSource: {
    type: String,
    enum: ['website', 'phone', 'walk_in', 'agency', 'other'],
    default: 'website'
  },
  additionalCharges: [{
    description: String,
    amount: Number,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  notes: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// וירטואל פרופרטי לחישוב מספר לילות
BookingSchema.virtual('numberOfNights').get(function() {
  return Math.ceil((this.checkOut - this.checkIn) / (1000 * 60 * 60 * 24));
});

// וירטואל פרופרטי לבדיקה אם ההזמנה פעילה (כלומר, צ'ק-אין עוד לא בוצע)
BookingSchema.virtual('isActive').get(function() {
  return this.paymentStatus !== 'cancelled' && !this.isCheckedOut;
});

// מידלוור לפני שמירה - יצירת קוד אישור ייחודי
BookingSchema.pre('save', async function(next) {
  // אם כבר יש קוד אישור או שזו לא הזמנה חדשה, נמשיך
  if (this.confirmationCode || !this.isNew) {
    return next();
  }
  
  // יצירת קוד אישור אקראי בן 6 תווים
  this.confirmationCode = crypto.randomBytes(3).toString('hex').toUpperCase();
  
  // בדיקה שהקוד אכן ייחודי
  const existingBooking = await this.constructor.findOne({ 
    confirmationCode: this.confirmationCode 
  });
  
  if (existingBooking) {
    // אם הקוד כבר קיים, ננסה שוב
    return this.save();
  }
  
  next();
});

// מידלוור לעדכון זמני צ'ק-אין וצ'ק-אאוט
BookingSchema.pre('save', function(next) {
  // אם בוצע צ'ק-אין ואין תאריך צ'ק-אין
  if (this.isCheckedIn && !this.checkedInAt) {
    this.checkedInAt = new Date();
  }
  
  // אם בוצע צ'ק-אאוט ואין תאריך צ'ק-אאוט
  if (this.isCheckedOut && !this.checkedOutAt) {
    this.checkedOutAt = new Date();
  }
  
  next();
});

// הוספת וירטואלס לתוצאות
BookingSchema.set('toJSON', { virtuals: true });
BookingSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Booking', BookingSchema); 