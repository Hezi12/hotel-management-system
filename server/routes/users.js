const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../middleware/auth');
const { isAdmin, isManager } = require('../middleware/roleCheck');

// כאן אנחנו מניחים שיש קובץ בקר למשתמשים, אם לא נצטרך ליצור אותו בהמשך
// const userController = require('../controllers/userController');

// כרגע נשתמש בהגדרות זמניות לנתיבים
// @route   GET api/users
// @desc    קבלת כל המשתמשים
// @access  Private/Admin
router.get('/', auth, isAdmin, async (req, res) => {
  try {
    const User = require('../models/User');
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('שגיאת שרת');
  }
});

// @route   GET api/users/:id
// @desc    קבלת משתמש לפי מזהה
// @access  Private/Admin
router.get('/:id', auth, isAdmin, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ msg: 'משתמש לא נמצא' });
    }
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'משתמש לא נמצא' });
    }
    res.status(500).send('שגיאת שרת');
  }
});

// @route   POST api/users
// @desc    יצירת משתמש חדש
// @access  Private/Admin
router.post(
  '/',
  [
    auth,
    isAdmin,
    [
      check('name', 'שם נדרש').not().isEmpty(),
      check('email', 'דוא"ל לא תקין').isEmail(),
      check('password', 'סיסמה חייבת להכיל לפחות 6 תווים').isLength({ min: 6 }),
      check('role', 'תפקיד לא תקין').isIn(['admin', 'manager', 'staff', 'user'])
    ]
  ],
  async (req, res) => {
    const { validationResult } = require('express-validator');
    const bcrypt = require('bcryptjs');
    const User = require('../models/User');
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role, phone, isActive } = req.body;

    try {
      // בדיקה אם משתמש קיים
      let user = await User.findOne({ email });

      if (user) {
        return res.status(400).json({ msg: 'משתמש עם כתובת דוא"ל זו כבר קיים' });
      }

      user = new User({
        name,
        email,
        password,
        role: role || 'user',
        phone,
        isActive: isActive !== undefined ? isActive : true
      });

      // הצפנת סיסמה
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();

      res.json({ 
        msg: 'משתמש נוצר בהצלחה',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          isActive: user.isActive
        }
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('שגיאת שרת');
    }
  }
);

// @route   PUT api/users/:id
// @desc    עדכון משתמש
// @access  Private/Admin
router.put('/:id', auth, isAdmin, async (req, res) => {
  const { name, email, role, phone, isActive, password } = req.body;
  const bcrypt = require('bcryptjs');
  const User = require('../models/User');

  // בניית אובייקט המשתמש
  const userFields = {};
  if (name) userFields.name = name;
  if (email) userFields.email = email;
  if (role) userFields.role = role;
  if (phone) userFields.phone = phone;
  if (isActive !== undefined) userFields.isActive = isActive;

  try {
    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ msg: 'משתמש לא נמצא' });
    }

    // אם יש סיסמה חדשה, הצפן אותה
    if (password) {
      const salt = await bcrypt.genSalt(10);
      userFields.password = await bcrypt.hash(password, salt);
    }

    // עדכון המשתמש
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
});

// @route   DELETE api/users/:id
// @desc    מחיקת משתמש
// @access  Private/Admin
router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ msg: 'משתמש לא נמצא' });
    }

    await user.deleteOne();

    res.json({ msg: 'משתמש נמחק בהצלחה' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('שגיאת שרת');
  }
});

module.exports = router; 