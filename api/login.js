const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { connectToDatabase } = require('../utils/mongodb');

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
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// שיטה להשוואת סיסמה
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

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

// משתנה סביבה לסוד ה-JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_for_development';

/**
 * פונקציית עזר להדפסת פרטי בקשה לצורכי דיבוג
 */
function logRequestDetails(req) {
  console.log('==== נכנסה בקשה לנקודת הקצה login ====');
  console.log('Method:', req.method);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body:', JSON.stringify(req.body, null, 2));
  console.log('URL:', req.url);
  console.log('Path:', req.path || 'N/A');
  console.log('IP:', req.headers['x-forwarded-for'] || req.socket.remoteAddress);
  console.log('=============================================');
}

module.exports = async (req, res) => {
  // מדפיס את פרטי הבקשה לצורכי דיבוג
  logRequestDetails(req);

  // טיפול בבקשות OPTIONS עבור CORS
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  // רק בקשות POST מורשות לנקודת קצה זו
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: `שיטת HTTP ${req.method} אינה נתמכת. אנא השתמש ב-POST.`,
      requestInfo: {
        method: req.method,
        url: req.url,
        headers: req.headers,
        timestamp: new Date().toISOString()
      }
    });
  }

  try {
    // חיבור למסד הנתונים
    const { db } = await connectToDatabase();
    const users = db.collection('users');

    const { email, password } = req.body;

    // וידוא שכל השדות הנדרשים התקבלו
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'אנא ספק אימייל וסיסמה'
      });
    }

    // חיפוש המשתמש לפי אימייל
    const user = await users.findOne({ email });

    // בדיקה אם המשתמש קיים
    if (!user) {
      console.log(`User not found: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'פרטי התחברות שגויים'
      });
    }

    // השוואת הסיסמה
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log(`Password mismatch for user: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'פרטי התחברות שגויים'
      });
    }

    // יצירת טוקן JWT
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // מחזיר תשובה מוצלחת עם הטוקן ופרטי המשתמש
    console.log(`User logged in successfully: ${email}`);
    return res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error in login process:', error);
    return res.status(500).json({
      success: false,
      message: 'שגיאת שרת פנימית',
      error: error.message
    });
  }
}; 