// API להגדרת משתמש אדמין ראשוני בסביבת Vercel
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// התחברות למסד הנתונים
const connectDB = async () => {
  if (mongoose.connections[0].readyState) {
    return;
  }
  
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('התחברות למסד הנתונים הצליחה');
  } catch (error) {
    console.error('שגיאה בהתחברות למסד הנתונים:', error.message);
    process.exit(1);
  }
};

// סכמת משתמש
const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'נא להזין שם פרטי'],
  },
  lastName: {
    type: String,
    required: [true, 'נא להזין שם משפחה'],
  },
  email: {
    type: String,
    required: [true, 'נא להזין כתובת אימייל'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'נא להזין כתובת אימייל תקינה',
    ],
  },
  password: {
    type: String,
    required: [true, 'נא להזין סיסמה'],
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ['admin', 'reception', 'employee'],
    default: 'employee',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// הצפנת סיסמה לפני שמירה
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// מודל המשתמש (אם לא קיים עדיין)
const User = mongoose.models.User || mongoose.model('User', UserSchema);

module.exports = async (req, res) => {
  // רק בקשות POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'שיטה לא מאושרת' });
  }

  try {
    // התחברות למסד הנתונים
    await connectDB();

    // בדיקה אם פרטי המשתמש נמצאים בבקשה או שימוש בפרטים קבועים
    const email = req.body.email || 'schwartzhezi@gmail.com';
    const password = req.body.password || '111111';
    const firstName = req.body.firstName || 'חזי';
    const lastName = req.body.lastName || 'שוורץ';
    
    // בדיקה אם משתמש כבר קיים
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'משתמש עם כתובת אימייל זו כבר קיים' 
      });
    }

    // יצירת משתמש אדמין חדש
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: 'admin', // אדמין
    });

    // החזרת תשובה מוצלחת
    return res.status(201).json({
      success: true,
      message: 'משתמש אדמין נוצר בהצלחה',
      data: {
        id: user._id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        role: user.role,
      }
    });
  } catch (error) {
    console.error('שגיאה ביצירת משתמש אדמין:', error);
    return res.status(500).json({
      success: false,
      message: 'שגיאה ביצירת משתמש אדמין',
      error: error.message,
    });
  }
}; 