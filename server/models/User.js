const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'נא להזין שם'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'נא להזין כתובת אימייל'],
    unique: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'נא להזין כתובת אימייל תקינה'
    ]
  },
  password: {
    type: String,
    required: [true, 'נא להזין סיסמה'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['staff', 'manager', 'admin'],
    default: 'staff'
  },
  phone: {
    type: String,
    default: ''
  },
  position: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// הצפנת סיסמה לפני שמירה
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// השוואת סיסמה מוצפנת
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// חתימת JWT
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '30d' }
  );
};

// יצירת טוקן לאיפוס סיסמה
UserSchema.methods.getResetPasswordToken = function() {
  // יצירת טוקן
  const resetToken = crypto.randomBytes(20).toString('hex');

  // הצפנת הטוקן ושמירה בדאטה בייס
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // קביעת תוקף לטוקן - 10 דקות
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model('User', UserSchema); 