const mongoose = require('mongoose');

const FinanceSchema = new mongoose.Schema({
  // מזהה עסקה
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  
  // סוג העסקה
  type: {
    type: String,
    enum: ['reservation', 'expense', 'refund', 'other'],
    required: true
  },
  
  // קטגוריה של העסקה (לדוגמה: לינה, ארוחות, תחזוקה...)
  category: {
    type: String,
    required: true,
    default: 'general'
  },
  
  // סכום העסקה
  amount: {
    type: Number,
    required: true
  },
  
  // תאריך העסקה
  date: {
    type: Date,
    default: Date.now
  },
  
  // תיאור העסקה
  description: {
    type: String,
    required: true
  },
  
  // אמצעי תשלום
  paymentMethod: {
    type: String,
    enum: ['credit card', 'cash', 'bank transfer', 'other'],
    required: true
  },
  
  // סטטוס תשלום
  status: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'cancelled', 'failed'],
    default: 'pending'
  },
  
  // הזמנה מקושרת (אם יש)
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    default: null
  },
  
  // אורח מקושר (אם יש)
  guest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // משתמש שיצר את העסקה
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // מסמכים קשורים (חשבוניות, קבלות וכדומה)
  documents: [{
    type: {
      type: String,
      enum: ['invoice', 'receipt', 'other'],
      required: true
    },
    fileUrl: {
      type: String,
      required: true
    },
    fileNumber: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // מידע נוסף
  additionalInfo: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// אינדקסים לחיפוש יעיל
FinanceSchema.index({ transactionId: 1 });
FinanceSchema.index({ date: 1 });
FinanceSchema.index({ type: 1 });
FinanceSchema.index({ booking: 1 });
FinanceSchema.index({ guest: 1 });
FinanceSchema.index({ status: 1 });

module.exports = mongoose.model('Finance', FinanceSchema); 