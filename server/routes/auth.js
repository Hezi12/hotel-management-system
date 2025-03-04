const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../middleware/auth');
const authController = require('../controllers/authController');

// @route   POST api/auth/register
// @desc    הרשמת משתמש חדש
// @access  Private/Admin
router.post('/register', [
  auth(['admin']),
  [
    check('name', 'שם הוא שדה חובה').not().isEmpty(),
    check('email', 'יש להכניס כתובת מייל תקינה').isEmail(),
    check('password', 'יש להכניס סיסמה באורך 6 תווים לפחות').isLength({ min: 6 }),
    check('role', 'תפקיד חייב להיות תקין').isIn(['admin', 'manager', 'staff'])
  ]
], authController.register);

// @route   POST api/auth/login
// @desc    התחברות משתמש וקבלת טוקן
// @access  Public
router.post('/login', [
  check('email', 'יש להכניס כתובת מייל תקינה').isEmail(),
  check('password', 'יש להכניס סיסמה').exists()
], authController.login);

// @route   GET api/auth/me
// @desc    קבלת פרטי המשתמש המחובר
// @access  Private
router.get('/me', auth(), authController.getMe);

// @route   GET api/auth/users
// @desc    קבלת כל המשתמשים
// @access  Private/Admin
router.get('/users', auth(['admin']), authController.getUsers);

// @route   PUT api/auth/users/:id
// @desc    עדכון פרטי משתמש
// @access  Private/Admin
router.put('/users/:id', auth(['admin']), authController.updateUser);

// @route   PUT api/auth/password
// @desc    שינוי סיסמה
// @access  Private
router.put('/password', [
  auth(),
  [
    check('currentPassword', 'יש להכניס את הסיסמה הנוכחית').exists(),
    check('newPassword', 'יש להכניס סיסמה חדשה באורך 6 תווים לפחות').isLength({ min: 6 })
  ]
], authController.updatePassword);

// @route   DELETE api/auth/users/:id
// @desc    מחיקת משתמש
// @access  Private/Admin
router.delete('/users/:id', auth(['admin']), authController.deleteUser);

module.exports = router; 