const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Finance = require('../models/Finance');
const Booking = require('../models/Booking');

// @route   GET api/finances
// @desc    קבלת כל הרשומות הפיננסיות
// @access  Private/Admin
router.get('/', auth(['admin', 'manager']), async (req, res) => {
  try {
    const { start_date, end_date, type, category } = req.query;
    
    // יצירת אובייקט חיפוש
    const filter = {};
    
    // סינון לפי תאריכים
    if (start_date || end_date) {
      filter.date = {};
      if (start_date) {
        filter.date.$gte = new Date(start_date);
      }
      if (end_date) {
        filter.date.$lte = new Date(end_date);
      }
    }
    
    // סינון לפי סוג (הכנסה/הוצאה)
    if (type) {
      filter.type = type;
    }
    
    // סינון לפי קטגוריה
    if (category) {
      filter.category = category;
    }
    
    const finances = await Finance.find(filter)
      .populate('bookingRef', 'confirmationCode guestName')
      .sort({ date: -1 });
    
    res.json(finances);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('שגיאת שרת');
  }
});

// @route   GET api/finances/summary
// @desc    קבלת סיכום פיננסי
// @access  Private/Admin
router.get('/summary', auth(['admin', 'manager']), async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    // יצירת אובייקט חיפוש
    const filter = {};
    
    // סינון לפי תאריכים
    if (start_date || end_date) {
      filter.date = {};
      if (start_date) {
        filter.date.$gte = new Date(start_date);
      }
      if (end_date) {
        filter.date.$lte = new Date(end_date);
      }
    }
    
    // חישוב סה"כ הכנסות
    const incomeFilter = { ...filter, type: 'income' };
    const income = await Finance.aggregate([
      { $match: incomeFilter },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    // חישוב סה"כ הוצאות
    const expenseFilter = { ...filter, type: 'expense' };
    const expenses = await Finance.aggregate([
      { $match: expenseFilter },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    // סיכום לפי קטגוריות
    const incomeByCategory = await Finance.aggregate([
      { $match: incomeFilter },
      { $group: { _id: '$category', total: { $sum: '$amount' } } }
    ]);
    
    const expensesByCategory = await Finance.aggregate([
      { $match: expenseFilter },
      { $group: { _id: '$category', total: { $sum: '$amount' } } }
    ]);
    
    // חישוב רווח נקי
    const totalIncome = income.length > 0 ? income[0].total : 0;
    const totalExpenses = expenses.length > 0 ? expenses[0].total : 0;
    const netProfit = totalIncome - totalExpenses;
    
    res.json({
      totalIncome,
      totalExpenses,
      netProfit,
      incomeByCategory,
      expensesByCategory
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('שגיאת שרת');
  }
});

// @route   POST api/finances
// @desc    הוספת רשומה פיננסית חדשה
// @access  Private/Admin
router.post('/', [
  auth(['admin', 'manager']),
  [
    check('type', 'יש לציין סוג רשומה (הכנסה/הוצאה)').isIn(['income', 'expense']),
    check('category', 'יש לציין קטגוריה').not().isEmpty(),
    check('amount', 'יש לציין סכום תקין').isFloat({ min: 0.01 }),
    check('description', 'יש לציין תיאור').not().isEmpty(),
    check('date', 'יש לציין תאריך תקין').optional().isISO8601()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const {
      type,
      category,
      amount,
      description,
      date,
      bookingRef,
      paymentMethod,
      receiptNumber,
      taxable,
      vendor
    } = req.body;
    
    // בדיקה אם הפניית ההזמנה תקינה, אם קיימת
    if (bookingRef) {
      const booking = await Booking.findById(bookingRef);
      if (!booking) {
        return res.status(404).json({ msg: 'ההזמנה המצוינת לא נמצאה' });
      }
    }
    
    // יצירת רשומה פיננסית חדשה
    const finance = new Finance({
      type,
      category,
      amount,
      description,
      date: date || new Date(),
      bookingRef: bookingRef || null,
      paymentMethod: paymentMethod || 'credit_card',
      receiptNumber: receiptNumber || null,
      taxable: taxable !== undefined ? taxable : true,
      vendor: vendor || null
    });
    
    await finance.save();
    
    res.json(finance);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('שגיאת שרת');
  }
});

// @route   PUT api/finances/:id
// @desc    עדכון רשומה פיננסית
// @access  Private/Admin
router.put('/:id', auth(['admin']), async (req, res) => {
  try {
    const {
      type,
      category,
      amount,
      description,
      date,
      bookingRef,
      paymentMethod,
      receiptNumber,
      taxable,
      vendor
    } = req.body;
    
    // יצירת אובייקט עדכון
    const financeFields = {};
    if (type !== undefined) financeFields.type = type;
    if (category !== undefined) financeFields.category = category;
    if (amount !== undefined) financeFields.amount = amount;
    if (description !== undefined) financeFields.description = description;
    if (date !== undefined) financeFields.date = date;
    if (bookingRef !== undefined) financeFields.bookingRef = bookingRef || null;
    if (paymentMethod !== undefined) financeFields.paymentMethod = paymentMethod;
    if (receiptNumber !== undefined) financeFields.receiptNumber = receiptNumber;
    if (taxable !== undefined) financeFields.taxable = taxable;
    if (vendor !== undefined) financeFields.vendor = vendor;
    
    let finance = await Finance.findById(req.params.id);
    
    if (!finance) {
      return res.status(404).json({ msg: 'רשומה פיננסית לא נמצאה' });
    }
    
    finance = await Finance.findByIdAndUpdate(
      req.params.id,
      { $set: financeFields },
      { new: true }
    ).populate('bookingRef', 'confirmationCode guestName');
    
    res.json(finance);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('שגיאת שרת');
  }
});

// @route   DELETE api/finances/:id
// @desc    מחיקת רשומה פיננסית
// @access  Private/Admin
router.delete('/:id', auth(['admin']), async (req, res) => {
  try {
    const finance = await Finance.findById(req.params.id);
    
    if (!finance) {
      return res.status(404).json({ msg: 'רשומה פיננסית לא נמצאה' });
    }
    
    await finance.remove();
    
    res.json({ msg: 'הרשומה הפיננסית נמחקה בהצלחה' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('שגיאת שרת');
  }
});

// @route   GET api/finances/bookings/:bookingId
// @desc    קבלת רשומות פיננסיות להזמנה ספציפית
// @access  Private
router.get('/bookings/:bookingId', auth(), async (req, res) => {
  try {
    const finances = await Finance.find({ bookingRef: req.params.bookingId });
    
    res.json(finances);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('שגיאת שרת');
  }
});

// @route   GET api/finances/monthly
// @desc    קבלת סיכום חודשי
// @access  Private/Admin
router.get('/monthly/:year', auth(['admin', 'manager']), async (req, res) => {
  try {
    const year = parseInt(req.params.year) || new Date().getFullYear();
    
    // הכנסות חודשיות
    const monthlyIncome = await Finance.aggregate([
      {
        $match: {
          type: 'income',
          date: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$date' },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // הוצאות חודשיות
    const monthlyExpenses = await Finance.aggregate([
      {
        $match: {
          type: 'expense',
          date: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$date' },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // ארגון התוצאות למבנה נוח
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const result = months.map(month => {
      const income = monthlyIncome.find(item => item._id === month);
      const expense = monthlyExpenses.find(item => item._id === month);
      
      return {
        month,
        income: income ? income.total : 0,
        expenses: expense ? expense.total : 0,
        profit: (income ? income.total : 0) - (expense ? expense.total : 0)
      };
    });
    
    res.json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('שגיאת שרת');
  }
});

module.exports = router; 