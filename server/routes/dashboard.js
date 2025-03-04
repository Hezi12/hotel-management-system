const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/auth');
const { isAdmin, isManager } = require('../middleware/roleCheck');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const Finance = require('../models/Finance');

// @route   GET api/dashboard/summary
// @desc    קבלת סיכום סטטיסטי ללוח המחוונים
// @access  Private
router.get('/summary', auth, dashboardController.getDashboardSummary);

// @route   GET api/dashboard/occupancy
// @desc    קבלת נתוני תפוסה שבועיים
// @access  Private
router.get('/occupancy', auth, dashboardController.getWeeklyOccupancy);

// @route   GET api/dashboard/revenue
// @desc    קבלת נתוני הכנסות חודשיים
// @access  Private/Admin
router.get('/revenue', auth, isAdmin, dashboardController.getMonthlyRevenue);

// @route   GET api/dashboard/today-bookings
// @desc    קבלת הזמנות היום
// @access  Private
router.get('/today-bookings', auth, dashboardController.getTodayBookings);

// @route   GET api/dashboard/room-stats
// @desc    קבלת סטטיסטיקות על סוגי חדרים
// @access  Private/Admin
router.get('/room-stats', auth, isAdmin, dashboardController.getRoomTypeStats);

// @route   GET api/dashboard/occupancy-heatmap
// @desc    קבלת מפת חום של תפוסה
// @access  Private
router.get('/occupancy-heatmap', auth(), async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    // בדיקת תאריכים
    let startDate = start_date ? new Date(start_date) : new Date();
    let endDate = end_date ? new Date(end_date) : new Date();
    
    // ברירת מחדל: מבט של 30 יום אם לא צוין אחרת
    if (!start_date) {
      startDate.setHours(0, 0, 0, 0);
    }
    
    if (!end_date) {
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 30);
    }
    
    // קבלת כל החדרים
    const rooms = await Room.find({ isActive: true })
      .sort({ roomNumber: 1 });
    
    // קבלת כל ההזמנות בטווח התאריכים
    const bookings = await Booking.find({
      $or: [
        // הזמנה שמתחילה בטווח
        { checkIn: { $gte: startDate, $lt: endDate } },
        // הזמנה שמסתיימת בטווח
        { checkOut: { $gt: startDate, $lte: endDate } },
        // הזמנה שמכסה את כל הטווח
        { checkIn: { $lte: startDate }, checkOut: { $gte: endDate } }
      ]
    }).populate('room', 'roomNumber');
    
    // יצירת מערך תאריכים בטווח
    const dates = [];
    const currentDate = new Date(startDate);
    
    while (currentDate < endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // יצירת מפת החום
    const heatmap = rooms.map(room => {
      const roomData = {
        roomId: room._id,
        roomNumber: room.roomNumber,
        type: room.type,
        capacity: room.capacity,
        dates: []
      };
      
      // עבור כל תאריך, בדיקת תפוסה
      dates.forEach(date => {
        const dateString = date.toISOString().split('T')[0];
        const isOccupied = bookings.some(booking => {
          const bookingRoomNumber = booking.room.roomNumber;
          return (
            bookingRoomNumber === room.roomNumber &&
            booking.checkIn <= date &&
            booking.checkOut > date
          );
        });
        
        roomData.dates.push({
          date: dateString,
          isOccupied
        });
      });
      
      return roomData;
    });
    
    res.json(heatmap);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('שגיאת שרת');
  }
});

// @route   GET api/dashboard/revenue-stats
// @desc    קבלת נתוני הכנסות סטטיסטיים
// @access  Private/Admin
router.get('/revenue-stats', auth(['admin', 'manager']), async (req, res) => {
  try {
    const { period } = req.query;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let startDate, endDate;
    
    // הגדרת טווח תאריכים לפי התקופה המבוקשת
    switch (period) {
      case 'week':
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 7);
        endDate = new Date(today);
        break;
      case 'month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case 'year':
        startDate = new Date(today.getFullYear(), 0, 1);
        endDate = new Date(today.getFullYear(), 11, 31);
        break;
      default:
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    }
    
    // הכנסות לפי קטגוריה
    const revenueByCategory = await Finance.aggregate([
      {
        $match: {
          type: 'income',
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' }
        }
      }
    ]);
    
    // הוצאות לפי קטגוריה
    const expensesByCategory = await Finance.aggregate([
      {
        $match: {
          type: 'expense',
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' }
        }
      }
    ]);
    
    // הכנסות לפי מקור הזמנה
    const revenueByBookingSource = await Booking.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          checkIn: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$bookingSource',
          total: { $sum: '$totalPrice' }
        }
      }
    ]);
    
    // סיכום ממוצע יומי של הכנסות
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    const totalIncome = await Finance.aggregate([
      {
        $match: {
          type: 'income',
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);
    
    const averageDailyIncome = totalIncome.length > 0 && totalDays > 0
      ? totalIncome[0].total / totalDays
      : 0;
    
    res.json({
      startDate,
      endDate,
      revenueByCategory,
      expensesByCategory,
      revenueByBookingSource,
      averageDailyIncome
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('שגיאת שרת');
  }
});

module.exports = router; 