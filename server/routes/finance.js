const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../middleware/auth');
const { isAdmin } = require('../middleware/roleCheck');
const financeController = require('../controllers/financeController');

// @route   POST api/finance
// @desc    יצירת עסקה פיננסית חדשה
// @access  Private/Admin
router.post(
  '/',
  [
    auth,
    isAdmin,
    [
      check('type', 'סוג העסקה נדרש').not().isEmpty(),
      check('type', 'סוג עסקה לא חוקי').isIn(['reservation', 'expense', 'refund', 'other']),
      check('category', 'קטגוריה נדרשת').not().isEmpty(),
      check('amount', 'סכום נדרש').not().isEmpty(),
      check('amount', 'סכום חייב להיות מספר חיובי').isFloat({ min: 0 }),
      check('description', 'תיאור נדרש').not().isEmpty(),
      check('paymentMethod', 'אמצעי תשלום נדרש').not().isEmpty(),
      check('paymentMethod', 'אמצעי תשלום לא חוקי').isIn(['credit card', 'cash', 'bank transfer', 'other'])
    ]
  ],
  financeController.createTransaction
);

// @route   GET api/finance
// @desc    קבלת כל העסקאות הפיננסיות
// @access  Private/Admin
router.get('/', auth, isAdmin, financeController.getAllTransactions);

// @route   GET api/finance/summary
// @desc    קבלת סיכום פיננסי
// @access  Private/Admin
router.get('/summary', auth, isAdmin, financeController.getFinanceSummary);

// @route   GET api/finance/:id
// @desc    קבלת עסקה פיננסית לפי מזהה
// @access  Private/Admin
router.get('/:id', auth, isAdmin, financeController.getTransactionById);

// @route   PUT api/finance/:id
// @desc    עדכון עסקה פיננסית
// @access  Private/Admin
router.put('/:id', auth, isAdmin, financeController.updateTransaction);

// @route   DELETE api/finance/:id
// @desc    מחיקת עסקה פיננסית
// @access  Private/Admin
router.delete('/:id', auth, isAdmin, financeController.deleteTransaction);

module.exports = router; 