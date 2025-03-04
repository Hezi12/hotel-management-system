const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const crypto = require('crypto');

/**
 * @desc    הרשמת משתמש חדש
 * @route   POST /api/auth/register
 * @access  Private/Admin
 */
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, role, phone, position } = req.body;

  try {
    // בדיקה אם המייל כבר קיים
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'משתמש עם מייל זה כבר קיים' });
    }

    // יצירת משתמש חדש
    user = new User({
      name,
      email,
      password,
      role: role || 'staff',
      phone: phone || '',
      position: position || ''
    });

    await user.save();

    // יצירת טוקן JWT
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '30d' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('שגיאת שרת');
  }
};

/**
 * @desc    התחברות משתמש
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // בדיקה אם המשתמש קיים
    let user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ msg: 'פרטי התחברות שגויים' });
    }

    // בדיקה אם המשתמש פעיל
    if (!user.isActive) {
      return res.status(401).json({ msg: 'חשבון משתמש זה אינו פעיל' });
    }

    // בדיקת התאמת סיסמה
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'פרטי התחברות שגויים' });
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

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '30d' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('שגיאת שרת');
  }
};

/**
 * @desc    קבלת פרטי המשתמש המחובר
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res) => {
  try {
    res.json(req.user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('שגיאת שרת');
  }
};

/**
 * @desc    קבלת כל המשתמשים
 * @route   GET /api/auth/users
 * @access  Private/Admin
 */
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('שגיאת שרת');
  }
};

/**
 * @desc    עדכון פרטי משתמש
 * @route   PUT /api/auth/users/:id
 * @access  Private/Admin
 */
exports.updateUser = async (req, res) => {
  const { name, email, role, phone, position, isActive } = req.body;

  try {
    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'משתמש לא נמצא' });
    }

    const userFields = {};
    if (name) userFields.name = name;
    if (email) userFields.email = email;
    if (role) userFields.role = role;
    if (phone) userFields.phone = phone;
    if (position) userFields.position = position;
    if (isActive !== undefined) userFields.isActive = isActive;

    user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: userFields },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('שגיאת שרת');
  }
};

/**
 * @desc    שינוי סיסמה
 * @route   PUT /api/auth/password
 * @access  Private
 */
exports.updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    // קבלת המשתמש עם הסיסמה
    const user = await User.findById(req.user.id).select('+password');

    // בדיקת התאמת הסיסמה הנוכחית
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ msg: 'הסיסמה הנוכחית שגויה' });
    }

    // עדכון הסיסמה
    user.password = newPassword;
    await user.save();

    res.json({ msg: 'הסיסמה עודכנה בהצלחה' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('שגיאת שרת');
  }
};

/**
 * @desc    מחיקת משתמש
 * @route   DELETE /api/auth/users/:id
 * @access  Private/Admin
 */
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'משתמש לא נמצא' });
    }

    await User.findByIdAndRemove(req.params.id);
    res.json({ msg: 'המשתמש נמחק בהצלחה' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('שגיאת שרת');
  }
}; 