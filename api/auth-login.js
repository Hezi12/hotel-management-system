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

module.exports = async (req, res) => {
  // רק בקשות POST
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      msg: 'שיטה לא מאושרת. יש להשתמש ב-POST'
    });
  }

  try {
    // התחברות למסד הנתונים
    await connectDB();

    const { email, password } = req.body;

    // בדיקה שהנתונים תקינים
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        msg: 'נא לספק אימייל וסיסמה'
      });
    }

    // בדיקה אם המשתמש קיים
    let user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        msg: 'פרטי התחברות שגויים'
      });
    }

    // בדיקה אם המשתמש פעיל
    if (!user.isActive) {
      return res.status(401).json({ 
        success: false, 
        msg: 'חשבון משתמש זה אינו פעיל'
      });
    }

    // בדיקת התאמת סיסמה
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        msg: 'פרטי התחברות שגויים'
      });
    }

    // עדכון זמן התחברות אחרון
    await User.findByIdAndUpdate(user._id, { lastLogin: Date.now() });

    // יצירת טוקן JWT
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '30d' }
    );

    // החזרת המידע למשתמש
    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('שגיאה בהתחברות:', error);
    return res.status(500).json({
      success: false,
      msg: 'שגיאת שרת בעת התחברות',
      error: error.message
    });
  }
}; 