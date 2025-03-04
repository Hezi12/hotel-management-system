const Finance = require('../models/Finance');
const Booking = require('../models/Booking');
const { validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

/**
 * @desc    יצירת עסקה פיננסית חדשה
 * @route   POST /api/finance
 * @access  Private/Admin
 */
exports.createTransaction = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    type,
    category,
    amount,
    description,
    paymentMethod,
    status,
    booking,
    guest,
    documents,
    additionalInfo
  } = req.body;

  try {
    // יצירת מזהה ייחודי לעסקה
    const transactionId = `TRX-${uuidv4().slice(0, 8)}`;

    const finance = new Finance({
      transactionId,
      type,
      category,
      amount,
      description,
      paymentMethod,
      status,
      booking,
      guest,
      createdBy: req.user.id,
      documents,
      additionalInfo
    });

    // אם העסקה מקושרת להזמנה וזהו תשלום הזמנה, עדכון סטטוס התשלום בהזמנה
    if (booking && type === 'reservation' && status === 'paid') {
      const bookingRecord = await Booking.findById(booking);
      if (bookingRecord) {
        bookingRecord.paymentStatus = 'paid';
        await bookingRecord.save();
      }
    }

    await finance.save();
    res.json(finance);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('שגיאת שרת');
  }
};

/**
 * @desc    קבלת כל העסקאות הפיננסיות
 * @route   GET /api/finance
 * @access  Private/Admin
 */
exports.getAllTransactions = async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      type, 
      status, 
      minAmount, 
      maxAmount,
      page = 1,
      limit = 20,
      sortBy = 'date',
      sortOrder = -1
    } = req.query;

    // בניית פילטר חיפוש
    const filter = {};
    
    // פילטור לפי תאריכים
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    
    // פילטור לפי סוג עסקה
    if (type) filter.type = type;
    
    // פילטור לפי סטטוס
    if (status) filter.status = status;
    
    // פילטור לפי סכום
    if (minAmount || maxAmount) {
      filter.amount = {};
      if (minAmount) filter.amount.$gte = Number(minAmount);
      if (maxAmount) filter.amount.$lte = Number(maxAmount);
    }

    // ספירת סך העסקאות שעונות לפילטר
    const total = await Finance.countDocuments(filter);

    // הגדרת אפשרויות מיון
    const sortOptions = {};
    sortOptions[sortBy] = Number(sortOrder);

    // ביצוע שאילתה עם פילטור, מיון ודילוג לפי עמוד
    const transactions = await Finance.find(filter)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('booking', 'guestName checkIn checkOut')
      .populate('guest', 'name email phone')
      .populate('createdBy', 'name');

    res.json({
      transactions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalTransactions: total
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('שגיאת שרת');
  }
};

/**
 * @desc    קבלת עסקה פיננסית לפי מזהה
 * @route   GET /api/finance/:id
 * @access  Private/Admin
 */
exports.getTransactionById = async (req, res) => {
  try {
    const transaction = await Finance.findById(req.params.id)
      .populate('booking', 'guestName checkIn checkOut bookingNumber totalPrice')
      .populate('guest', 'name email phone')
      .populate('createdBy', 'name');

    if (!transaction) {
      return res.status(404).json({ msg: 'העסקה לא נמצאה' });
    }

    res.json(transaction);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'העסקה לא נמצאה' });
    }
    res.status(500).send('שגיאת שרת');
  }
};

/**
 * @desc    עדכון עסקה פיננסית
 * @route   PUT /api/finance/:id
 * @access  Private/Admin
 */
exports.updateTransaction = async (req, res) => {
  const {
    type,
    category,
    amount,
    date,
    description,
    paymentMethod,
    status,
    documents,
    additionalInfo
  } = req.body;

  try {
    let transaction = await Finance.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ msg: 'העסקה לא נמצאה' });
    }

    // עדכון שדות רלוונטיים
    if (type) transaction.type = type;
    if (category) transaction.category = category;
    if (amount) transaction.amount = amount;
    if (date) transaction.date = date;
    if (description) transaction.description = description;
    if (paymentMethod) transaction.paymentMethod = paymentMethod;
    if (status) transaction.status = status;
    if (documents) transaction.documents = documents;
    if (additionalInfo) transaction.additionalInfo = additionalInfo;

    // עדכון מקושר בהזמנה אם יש שינוי סטטוס
    if (status && status !== transaction.status && transaction.booking) {
      if (status === 'paid') {
        await Booking.findByIdAndUpdate(transaction.booking, { paymentStatus: 'paid' });
      } else if (status === 'refunded') {
        await Booking.findByIdAndUpdate(transaction.booking, { paymentStatus: 'refunded' });
      } else if (status === 'cancelled') {
        await Booking.findByIdAndUpdate(transaction.booking, { paymentStatus: 'cancelled' });
      }
    }

    await transaction.save();
    res.json(transaction);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('שגיאת שרת');
  }
};

/**
 * @desc    מחיקת עסקה פיננסית
 * @route   DELETE /api/finance/:id
 * @access  Private/Admin
 */
exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Finance.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ msg: 'העסקה לא נמצאה' });
    }

    await transaction.remove();
    res.json({ msg: 'העסקה נמחקה בהצלחה' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('שגיאת שרת');
  }
};

/**
 * @desc    קבלת סיכום פיננסי
 * @route   GET /api/finance/summary
 * @access  Private/Admin
 */
exports.getFinanceSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // בניית פילטר לתאריכים
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) dateFilter.date.$gte = new Date(startDate);
      if (endDate) dateFilter.date.$lte = new Date(endDate);
    }
    
    // הכנסות - סיכום לפי קטגוריה
    const revenueByCategory = await Finance.aggregate([
      { 
        $match: { 
          ...dateFilter, 
          type: 'reservation', 
          status: 'paid'
        } 
      },
      { 
        $group: { 
          _id: '$category', 
          total: { $sum: '$amount' } 
        } 
      },
      { $sort: { total: -1 } }
    ]);
    
    // הוצאות - סיכום לפי קטגוריה
    const expensesByCategory = await Finance.aggregate([
      { 
        $match: { 
          ...dateFilter, 
          type: 'expense', 
          status: 'paid'
        } 
      },
      { 
        $group: { 
          _id: '$category', 
          total: { $sum: '$amount' } 
        } 
      },
      { $sort: { total: -1 } }
    ]);
    
    // סך הכנסות
    const totalRevenue = await Finance.aggregate([
      { 
        $match: { 
          ...dateFilter, 
          type: 'reservation', 
          status: 'paid'
        } 
      },
      { 
        $group: { 
          _id: null, 
          total: { $sum: '$amount' } 
        } 
      }
    ]);
    
    // סך הוצאות
    const totalExpenses = await Finance.aggregate([
      { 
        $match: { 
          ...dateFilter, 
          type: 'expense', 
          status: 'paid'
        } 
      },
      { 
        $group: { 
          _id: null, 
          total: { $sum: '$amount' } 
        } 
      }
    ]);

    // תקציב חודשים אחרונים (6 חודשים)
    const today = new Date();
    const monthlySummary = [];

    for (let i = 5; i >= 0; i--) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const nextMonth = new Date(today.getFullYear(), today.getMonth() - i + 1, 0);
      
      // הכנסות לחודש זה
      const monthRevenue = await Finance.aggregate([
        { 
          $match: { 
            date: { $gte: month, $lte: nextMonth }, 
            type: 'reservation', 
            status: 'paid'
          } 
        },
        { 
          $group: { 
            _id: null, 
            total: { $sum: '$amount' } 
          } 
        }
      ]);
      
      // הוצאות לחודש זה
      const monthExpenses = await Finance.aggregate([
        { 
          $match: { 
            date: { $gte: month, $lte: nextMonth }, 
            type: 'expense', 
            status: 'paid'
          } 
        },
        { 
          $group: { 
            _id: null, 
            total: { $sum: '$amount' } 
          } 
        }
      ]);
      
      monthlySummary.push({
        month: month.toLocaleString('he-IL', { month: 'short', year: 'numeric' }),
        revenue: monthRevenue.length > 0 ? monthRevenue[0].total : 0,
        expenses: monthExpenses.length > 0 ? monthExpenses[0].total : 0,
        profit: (monthRevenue.length > 0 ? monthRevenue[0].total : 0) - 
                (monthExpenses.length > 0 ? monthExpenses[0].total : 0)
      });
    }
    
    res.json({
      totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
      totalExpenses: totalExpenses.length > 0 ? totalExpenses[0].total : 0,
      netProfit: (totalRevenue.length > 0 ? totalRevenue[0].total : 0) - 
                (totalExpenses.length > 0 ? totalExpenses[0].total : 0),
      revenueByCategory,
      expensesByCategory,
      monthlySummary
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('שגיאת שרת');
  }
}; 