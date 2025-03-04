const { validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Finance = require('../models/Finance');
const crypto = require('crypto');

/**
 * @desc    קבלת כל ההזמנות
 * @route   GET /api/bookings
 * @access  Private
 */
exports.getBookings = async (req, res) => {
  try {
    const filter = {};
    
    // סינון לפי סטטוס תשלום
    if (req.query.paymentStatus) {
      filter.paymentStatus = req.query.paymentStatus;
    }
    
    // סינון לפי סטטוס צ'ק-אין
    if (req.query.checkInStatus) {
      filter.checkInStatus = req.query.checkInStatus;
    }
    
    // סינון לפי טווח תאריכים
    if (req.query.startDate && req.query.endDate) {
      filter.$or = [
        {
          checkIn: {
            $gte: new Date(req.query.startDate),
            $lte: new Date(req.query.endDate)
          }
        },
        {
          checkOut: {
            $gte: new Date(req.query.startDate),
            $lte: new Date(req.query.endDate)
          }
        }
      ];
    }
    
    const bookings = await Booking.find(filter)
      .populate('room', 'roomNumber type capacity pricePerNight')
      .sort({ checkIn: -1 });
    
    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('שגיאת שרת');
  }
};

/**
 * @desc    קבלת הזמנה לפי מזהה
 * @route   GET /api/bookings/:id
 * @access  Private
 */
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('room', 'roomNumber type capacity pricePerNight');
    
    if (!booking) {
      return res.status(404).json({ msg: 'הזמנה לא נמצאה' });
    }
    
    res.json(booking);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'הזמנה לא נמצאה' });
    }
    res.status(500).send('שגיאת שרת');
  }
};

/**
 * @desc    קבלת הזמנה לפי קוד אישור
 * @route   GET /api/bookings/confirmation/:code
 * @access  Public
 */
exports.getBookingByConfirmationCode = async (req, res) => {
  try {
    const booking = await Booking.findOne({ confirmationCode: req.params.code })
      .populate('room', 'roomNumber type capacity pricePerNight');
    
    if (!booking) {
      return res.status(404).json({ msg: 'הזמנה לא נמצאה' });
    }
    
    res.json(booking);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('שגיאת שרת');
  }
};

/**
 * @desc    יצירת הזמנה חדשה
 * @route   POST /api/bookings
 * @access  Public
 */
exports.createBooking = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    roomId,
    guestName,
    guestEmail,
    guestPhone,
    checkIn,
    checkOut,
    numberOfGuests,
    specialRequests
  } = req.body;

  try {
    console.log(`Creating booking for room ${roomId}, guest: ${guestName}, email: ${guestEmail}`);
    
    // בדיקה אם החדר קיים
    const room = await Room.findById(roomId);
    if (!room) {
      console.log(`Room not found: ${roomId}`);
      return res.status(404).json({ msg: 'החדר המבוקש לא נמצא' });
    }

    // בדיקה אם החדר פנוי בתאריכים המבוקשים
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    console.log(`Checking availability for dates: ${checkInDate} to ${checkOutDate}`);
    
    const conflictingBookings = await Booking.find({
      room: roomId,
      $or: [
        {
          // צ'ק-אין של ההזמנה החדשה נמצא בין צ'ק-אין לצ'ק-אאוט של הזמנה קיימת
          $and: [
            { checkIn: { $lte: checkInDate } },
            { checkOut: { $gte: checkInDate } }
          ]
        },
        {
          // צ'ק-אאוט של ההזמנה החדשה נמצא בין צ'ק-אין לצ'ק-אאוט של הזמנה קיימת
          $and: [
            { checkIn: { $lte: checkOutDate } },
            { checkOut: { $gte: checkOutDate } }
          ]
        },
        {
          // צ'ק-אין וצ'ק-אאוט של ההזמנה החדשה מקיפים הזמנה קיימת
          $and: [
            { checkIn: { $gte: checkInDate } },
            { checkOut: { $lte: checkOutDate } }
          ]
        }
      ],
      paymentStatus: { $ne: 'cancelled' }
    });

    if (conflictingBookings.length > 0) {
      console.log(`Room ${roomId} is not available for the requested dates. Conflicting bookings:`, 
        conflictingBookings.map(b => b._id));
      return res.status(400).json({ msg: 'החדר אינו פנוי בתאריכים המבוקשים' });
    }

    // חישוב כמות הלילות
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    
    // חישוב מחיר סופי
    const totalPrice = nights * room.pricePerNight;

    // יצירת קוד אישור ייחודי
    const confirmationCode = crypto.randomBytes(3).toString('hex').toUpperCase();

    console.log(`Generated confirmation code: ${confirmationCode}, total price: ${totalPrice}`);

    // יצירת הזמנה חדשה
    const newBooking = new Booking({
      room: roomId,
      guestName,
      guestEmail,
      guestPhone,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      numberOfGuests,
      totalPrice,
      confirmationCode,
      specialRequests: specialRequests || '',
      status: 'confirmed',
      paymentStatus: 'pending',
      checkInStatus: 'not-checked-in'
    });

    console.log('Saving new booking to database');
    const booking = await newBooking.save();
    console.log(`Booking created successfully with ID: ${booking._id}`);

    try {
      // יצירת רשומה פיננסית להזמנה
      const transactionId = `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      console.log(`Creating financial record with transaction ID: ${transactionId}`);
      
      const finance = new Finance({
        transactionId,
        booking: booking._id,
        amount: totalPrice,
        type: 'reservation',
        category: 'accommodation',
        description: `הזמנת חדר ${room.roomNumber} - ${guestName}`,
        paymentMethod: 'credit card',
        status: 'pending',
        // במקרה שאין משתמש מחובר, נשתמש במשתמש ברירת מחדל של המערכת
        createdBy: req.user ? req.user.id : '64f8c8a77bf93a6761349dfe', // ID של משתמש מערכת ברירת מחדל
        additionalInfo: {
          bookingDetails: {
            confirmationCode: confirmationCode,
            checkIn: checkInDate,
            checkOut: checkOutDate
          }
        }
      });

      await finance.save();
      console.log(`Financial record created successfully with ID: ${finance._id}`);
    } catch (financeError) {
      // אם נכשלה יצירת הרשומה הפיננסית, נרשום את השגיאה אבל לא נכשיל את יצירת ההזמנה
      console.error('Error creating financial record:', financeError);
      // ניתן להוסיף כאן לוגיקה לשליחת התראה למנהל המערכת
    }

    res.status(201).json(booking);
  } catch (err) {
    console.error('Error in createBooking:', err);
    res.status(500).json({ 
      msg: 'שגיאה ביצירת ההזמנה', 
      error: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
  }
};

/**
 * @desc    עדכון הזמנה
 * @route   PUT /api/bookings/:id
 * @access  Private
 */
exports.updateBooking = async (req, res) => {
  const {
    guestName,
    guestEmail,
    guestPhone,
    checkIn,
    checkOut,
    numberOfGuests,
    status,
    paymentStatus,
    checkInStatus,
    specialRequests
  } = req.body;

  try {
    let booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ msg: 'הזמנה לא נמצאה' });
    }

    // יצירת אובייקט עדכון
    const bookingFields = {};
    if (guestName) bookingFields.guestName = guestName;
    if (guestEmail) bookingFields.guestEmail = guestEmail;
    if (guestPhone) bookingFields.guestPhone = guestPhone;
    if (checkIn) bookingFields.checkIn = checkIn;
    if (checkOut) bookingFields.checkOut = checkOut;
    if (numberOfGuests) bookingFields.numberOfGuests = numberOfGuests;
    if (status) bookingFields.status = status;
    if (paymentStatus) bookingFields.paymentStatus = paymentStatus;
    if (checkInStatus) bookingFields.checkInStatus = checkInStatus;
    if (specialRequests !== undefined) bookingFields.specialRequests = specialRequests;

    // בדיקת שינוי בתאריכים
    if ((checkIn || checkOut) && booking.paymentStatus !== 'cancelled') {
      const newCheckIn = checkIn ? new Date(checkIn) : booking.checkIn;
      const newCheckOut = checkOut ? new Date(checkOut) : booking.checkOut;
      
      // חיפוש התנגשויות, תוך התעלמות מההזמנה הנוכחית
      const conflictingBookings = await Booking.find({
        _id: { $ne: req.params.id },
        room: booking.room,
        $or: [
          {
            $and: [
              { checkIn: { $lte: newCheckIn } },
              { checkOut: { $gte: newCheckIn } }
            ]
          },
          {
            $and: [
              { checkIn: { $lte: newCheckOut } },
              { checkOut: { $gte: newCheckOut } }
            ]
          },
          {
            $and: [
              { checkIn: { $gte: newCheckIn } },
              { checkOut: { $lte: newCheckOut } }
            ]
          }
        ],
        paymentStatus: { $ne: 'cancelled' }
      });

      if (conflictingBookings.length > 0) {
        return res.status(400).json({ msg: 'החדר אינו פנוי בתאריכים המבוקשים' });
      }

      // עדכון מחיר אם התאריכים השתנו
      if (checkIn || checkOut) {
        const room = await Room.findById(booking.room);
        const nights = Math.ceil((newCheckOut - newCheckIn) / (1000 * 60 * 60 * 24));
        bookingFields.totalPrice = nights * room.pricePerNight;
        
        // אם יש שינוי במחיר, יש לעדכן גם את הרשומה הפיננסית
        if (bookingFields.totalPrice !== booking.totalPrice) {
          await Finance.findOneAndUpdate(
            { booking: booking._id, type: 'reservation' },
            { amount: bookingFields.totalPrice }
          );
        }
      }
    }

    // אם סטטוס התשלום השתנה, נעדכן את הרשומה הפיננסית
    if (paymentStatus && paymentStatus !== booking.paymentStatus) {
      await Finance.findOneAndUpdate(
        { booking: booking._id, type: 'reservation' },
        { status: paymentStatus }
      );
    }

    // עדכון ההזמנה
    booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { $set: bookingFields },
      { new: true }
    ).populate('room', 'roomNumber type capacity pricePerNight');

    res.json(booking);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('שגיאת שרת');
  }
};

/**
 * @desc    ביטול הזמנה
 * @route   PUT /api/bookings/:id/cancel
 * @access  Private
 */
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ msg: 'הזמנה לא נמצאה' });
    }

    // בדיקה אם ההזמנה כבר מבוטלת
    if (booking.paymentStatus === 'cancelled') {
      return res.status(400).json({ msg: 'ההזמנה כבר מבוטלת' });
    }

    // עדכון סטטוס ההזמנה
    booking.paymentStatus = 'cancelled';
    booking.status = 'cancelled';
    await booking.save();

    // עדכון רשומת פיננסית
    await Finance.findOneAndUpdate(
      { booking: booking._id, type: 'reservation' },
      { status: 'cancelled' }
    );

    res.json({ msg: 'ההזמנה בוטלה בהצלחה', booking });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('שגיאת שרת');
  }
};

/**
 * @desc    צ'ק-אין להזמנה
 * @route   PUT /api/bookings/:id/check-in
 * @access  Private
 */
exports.checkIn = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ msg: 'הזמנה לא נמצאה' });
    }

    // בדיקה אם ההזמנה כבר בוצע לה צ'ק-אין
    if (booking.checkInStatus === 'checked-in') {
      return res.status(400).json({ msg: 'כבר בוצע צ\'ק-אין להזמנה זו' });
    }

    // עדכון סטטוס צ'ק-אין
    booking.checkInStatus = 'checked-in';
    booking.checkInTime = Date.now();
    await booking.save();

    res.json({ msg: 'צ\'ק-אין בוצע בהצלחה', booking });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('שגיאת שרת');
  }
};

/**
 * @desc    צ'ק-אאוט להזמנה
 * @route   PUT /api/bookings/:id/check-out
 * @access  Private
 */
exports.checkOut = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ msg: 'הזמנה לא נמצאה' });
    }

    // בדיקה אם ההזמנה כבר בוצע לה צ'ק-אאוט
    if (booking.checkInStatus === 'checked-out') {
      return res.status(400).json({ msg: 'כבר בוצע צ\'ק-אאוט להזמנה זו' });
    }

    // בדיקה אם בוצע צ'ק-אין לפני כן
    if (booking.checkInStatus !== 'checked-in') {
      return res.status(400).json({ msg: 'לא ניתן לבצע צ\'ק-אאוט ללא צ\'ק-אין קודם' });
    }

    // עדכון סטטוס צ'ק-אאוט
    booking.checkInStatus = 'checked-out';
    booking.checkOutTime = Date.now();
    await booking.save();

    res.json({ msg: 'צ\'ק-אאוט בוצע בהצלחה', booking });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('שגיאת שרת');
  }
}; 