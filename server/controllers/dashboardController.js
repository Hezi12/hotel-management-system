const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Finance = require('../models/Finance');
const User = require('../models/User');
const moment = require('moment');

/**
 * @desc    קבלת סיכום סטטיסטי ללוח המחוונים
 * @route   GET /api/dashboard/summary
 * @access  Private
 */
exports.getDashboardSummary = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const lastMonth = new Date(today);
    lastMonth.setMonth(today.getMonth() - 1);
    
    // מספר הזמנות פעילות כרגע (צ'ק-אין בוצע אבל עדיין לא צ'ק-אאוט)
    const currentBookings = await Booking.countDocuments({
      checkInStatus: 'checked-in',
      paymentStatus: { $ne: 'cancelled' }
    });
    
    // מספר צ'ק-אינים היום
    const todayCheckIns = await Booking.countDocuments({
      checkIn: { $gte: today, $lt: tomorrow },
      paymentStatus: { $ne: 'cancelled' }
    });
    
    // מספר צ'ק-אאוטים היום
    const todayCheckOuts = await Booking.countDocuments({
      checkOut: { $gte: today, $lt: tomorrow },
      paymentStatus: { $ne: 'cancelled' }
    });
    
    // מספר הזמנות עתידיות
    const futureBookings = await Booking.countDocuments({
      checkIn: { $gt: today },
      paymentStatus: { $ne: 'cancelled' }
    });
    
    // סך הכנסות חודש אחרון
    const lastMonthIncome = await Finance.aggregate([
      {
        $match: {
          createdAt: { $gte: lastMonth },
          status: 'paid',
          type: 'reservation'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);
    
    const totalIncome = lastMonthIncome.length > 0 ? lastMonthIncome[0].total : 0;
    
    // מספר חדרים פעילים
    const activeRooms = await Room.countDocuments({ isActive: true });
    
    // מספר משתמשים פעילים
    const activeUsers = await User.countDocuments({ isActive: true });
    
    // חישוב אחוז תפוסה
    const totalRooms = await Room.countDocuments();
    const occupancyRate = totalRooms > 0 ? Math.round((currentBookings / totalRooms) * 100) : 0;
    
    res.json({
      currentBookings,
      todayCheckIns,
      todayCheckOuts,
      futureBookings,
      totalIncome,
      activeRooms,
      activeUsers,
      occupancyRate
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('שגיאת שרת');
  }
};

/**
 * @desc    קבלת נתוני תפוסה שבועיים
 * @route   GET /api/dashboard/occupancy
 * @access  Private
 */
exports.getWeeklyOccupancy = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // יצירת מערך של 7 ימים קדימה
    const dates = [];
    const occupancyData = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      dates.push(moment(date).format('YYYY-MM-DD'));
      
      // מציאת הזמנות פעילות לתאריך זה
      const bookings = await Booking.find({
        checkIn: { $lte: date },
        checkOut: { $gt: date },
        paymentStatus: { $ne: 'cancelled' }
      });
      
      const totalRooms = await Room.countDocuments({ isActive: true });
      const occupancyRate = totalRooms > 0 ? Math.round((bookings.length / totalRooms) * 100) : 0;
      
      occupancyData.push({
        date: moment(date).format('DD/MM'),
        occupancy: occupancyRate
      });
    }
    
    res.json(occupancyData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('שגיאת שרת');
  }
};

/**
 * @desc    קבלת נתוני הכנסות חודשיים
 * @route   GET /api/dashboard/revenue
 * @access  Private/Admin
 */
exports.getMonthlyRevenue = async (req, res) => {
  try {
    const today = new Date();
    const currentYear = today.getFullYear();
    const revenueData = [];
    
    // יצירת מערך של 12 חודשים
    for (let month = 0; month < 12; month++) {
      const startDate = new Date(currentYear, month, 1);
      const endDate = new Date(currentYear, month + 1, 0);
      
      // חישוב הכנסות עבור החודש הנוכחי
      const monthlyRevenue = await Finance.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            status: 'paid',
            type: 'reservation'
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]);
      
      const revenue = monthlyRevenue.length > 0 ? monthlyRevenue[0].total : 0;
      
      revenueData.push({
        month: moment(startDate).format('MMM'),
        revenue
      });
    }
    
    res.json(revenueData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('שגיאת שרת');
  }
};

/**
 * @desc    קבלת הזמנות היום
 * @route   GET /api/dashboard/today-bookings
 * @access  Private
 */
exports.getTodayBookings = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // מציאת הזמנות לתאריך של היום (צ'ק-אין או צ'ק-אאוט)
    const bookings = await Booking.find({
      $or: [
        { checkIn: { $gte: today, $lt: tomorrow } },
        { checkOut: { $gte: today, $lt: tomorrow } }
      ],
      paymentStatus: { $ne: 'cancelled' }
    }).populate('room', 'roomNumber type');
    
    // יצירת אובייקט מפורט יותר
    const formattedBookings = bookings.map(booking => ({
      id: booking._id,
      guestName: booking.guestName,
      roomNumber: booking.room.roomNumber,
      roomType: booking.room.type,
      isCheckIn: booking.checkIn >= today && booking.checkIn < tomorrow,
      isCheckOut: booking.checkOut >= today && booking.checkOut < tomorrow,
      checkInStatus: booking.checkInStatus,
      time: booking.checkIn >= today && booking.checkIn < tomorrow ? 
            moment(booking.checkIn).format('HH:mm') :
            moment(booking.checkOut).format('HH:mm')
    }));
    
    res.json(formattedBookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('שגיאת שרת');
  }
};

/**
 * @desc    קבלת סטטיסטיקות על סוגי חדרים
 * @route   GET /api/dashboard/room-stats
 * @access  Private/Admin
 */
exports.getRoomTypeStats = async (req, res) => {
  try {
    // קבלת מספר החדרים לפי סוג
    const roomsByType = await Room.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          avgPrice: { $avg: '$pricePerNight' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    // קבלת הזמנות לפי סוג חדר בחודש האחרון
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const bookingsByRoomType = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: lastMonth },
          paymentStatus: { $ne: 'cancelled' }
        }
      },
      {
        $lookup: {
          from: 'rooms',
          localField: 'room',
          foreignField: '_id',
          as: 'roomDetails'
        }
      },
      {
        $unwind: '$roomDetails'
      },
      {
        $group: {
          _id: '$roomDetails.type',
          bookings: { $sum: 1 },
          revenue: { $sum: '$totalPrice' }
        }
      },
      {
        $sort: { bookings: -1 }
      }
    ]);
    
    res.json({ roomsByType, bookingsByRoomType });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('שגיאת שרת');
  }
}; 