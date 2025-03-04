const { validationResult } = require('express-validator');
const Room = require('../models/Room');
const Booking = require('../models/Booking');

/**
 * @desc    קבלת כל החדרים
 * @route   GET /api/rooms
 * @access  Public
 */
exports.getRooms = async (req, res) => {
  try {
    const filter = { isActive: true };
    
    // סינון לפי סוג חדר
    if (req.query.type) {
      filter.type = req.query.type;
    }
    
    // סינון לפי קיבולת
    if (req.query.capacity) {
      filter.capacity = { $gte: parseInt(req.query.capacity) };
    }
    
    // סינון לפי מחיר מקסימלי
    if (req.query.maxPrice) {
      filter.pricePerNight = { $lte: parseInt(req.query.maxPrice) };
    }
    
    // סינון לפי קומה
    if (req.query.floor) {
      filter.floor = parseInt(req.query.floor);
    }
    
    const rooms = await Room.find(filter).sort({ roomNumber: 1 });
    
    res.json(rooms);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('שגיאת שרת');
  }
};

/**
 * @desc    קבלת כל החדרים למנהלים (כולל לא פעילים)
 * @route   GET /api/rooms/all
 * @access  Private/Admin
 */
exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find().sort({ roomNumber: 1 });
    
    res.json(rooms);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('שגיאת שרת');
  }
};

/**
 * @desc    קבלת חדר לפי מזהה
 * @route   GET /api/rooms/:id
 * @access  Public
 */
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    
    if (!room) {
      return res.status(404).json({ msg: 'החדר לא נמצא' });
    }
    
    res.json(room);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'החדר לא נמצא' });
    }
    res.status(500).send('שגיאת שרת');
  }
};

/**
 * @desc    בדיקת זמינות חדר בתאריכים מסוימים
 * @route   GET /api/rooms/:id/availability
 * @access  Public
 */
exports.checkRoomAvailability = async (req, res) => {
  try {
    const { checkIn, checkOut } = req.query;
    
    if (!checkIn || !checkOut) {
      return res.status(400).json({ msg: 'יש לספק תאריכי צ\'ק-אין וצ\'ק-אאוט' });
    }
    
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    // בדיקת תקינות התאריכים
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return res.status(400).json({ msg: 'תאריכים לא תקינים' });
    }
    
    if (checkInDate >= checkOutDate) {
      return res.status(400).json({ msg: "תאריך הצ'ק-אין חייב להיות לפני תאריך הצ'ק-אאוט" });
    }
    
    // בדיקת הזמנות קיימות
    const existingBookings = await Booking.find({
      room: req.params.id,
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
    
    const isAvailable = existingBookings.length === 0;
    
    res.json({
      isAvailable,
      message: isAvailable 
        ? 'החדר זמין בתאריכים המבוקשים' 
        : 'החדר אינו זמין בתאריכים המבוקשים'
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('שגיאת שרת');
  }
};

/**
 * @desc    יצירת חדר חדש
 * @route   POST /api/rooms
 * @access  Private/Admin
 */
exports.createRoom = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    roomNumber,
    type,
    capacity,
    pricePerNight,
    description,
    amenities,
    images,
    floor,
    isActive
  } = req.body;

  try {
    // בדיקה שמספר החדר אינו קיים כבר
    const existingRoom = await Room.findOne({ roomNumber });
    if (existingRoom) {
      return res.status(400).json({ msg: 'מספר חדר זה כבר קיים במערכת' });
    }

    // יצירת חדר חדש
    const newRoom = new Room({
      roomNumber,
      type,
      capacity,
      pricePerNight,
      description,
      amenities: amenities || [],
      images: images || [],
      floor,
      isActive: isActive !== undefined ? isActive : true
    });

    const room = await newRoom.save();
    res.status(201).json(room);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('שגיאת שרת');
  }
};

/**
 * @desc    עדכון חדר קיים
 * @route   PUT /api/rooms/:id
 * @access  Private/Admin
 */
exports.updateRoom = async (req, res) => {
  const {
    roomNumber,
    type,
    capacity,
    pricePerNight,
    description,
    amenities,
    images,
    floor,
    isActive
  } = req.body;

  try {
    let room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ msg: 'החדר לא נמצא' });
    }

    // בדיקה שמספר החדר החדש אינו קיים כבר (במידה ומשנים)
    if (roomNumber && roomNumber !== room.roomNumber) {
      const existingRoom = await Room.findOne({ roomNumber });
      if (existingRoom) {
        return res.status(400).json({ msg: 'מספר חדר זה כבר קיים במערכת' });
      }
    }

    // יצירת אובייקט עדכון
    const roomFields = {};
    if (roomNumber) roomFields.roomNumber = roomNumber;
    if (type) roomFields.type = type;
    if (capacity) roomFields.capacity = capacity;
    if (pricePerNight) roomFields.pricePerNight = pricePerNight;
    if (description) roomFields.description = description;
    if (amenities) roomFields.amenities = amenities;
    if (images) roomFields.images = images;
    if (floor) roomFields.floor = floor;
    if (isActive !== undefined) roomFields.isActive = isActive;

    // עדכון החדר
    room = await Room.findByIdAndUpdate(
      req.params.id,
      { $set: roomFields },
      { new: true }
    );

    res.json(room);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('שגיאת שרת');
  }
};

/**
 * @desc    מחיקת חדר
 * @route   DELETE /api/rooms/:id
 * @access  Private/Admin
 */
exports.deleteRoom = async (req, res) => {
  try {
    // בדיקה אם קיימות הזמנות עתידיות לחדר
    const now = new Date();
    const futureBookings = await Booking.find({
      room: req.params.id,
      checkOut: { $gte: now },
      paymentStatus: { $ne: 'cancelled' }
    });

    if (futureBookings.length > 0) {
      return res.status(400).json({ msg: 'לא ניתן למחוק חדר עם הזמנות עתידיות' });
    }

    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ msg: 'החדר לא נמצא' });
    }

    await Room.findByIdAndRemove(req.params.id);
    res.json({ msg: 'החדר נמחק בהצלחה' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('שגיאת שרת');
  }
};

/**
 * @desc    חיפוש חדרים זמינים לתאריכים מסוימים
 * @route   GET /api/rooms/available
 * @access  Public
 */
exports.getAvailableRooms = async (req, res) => {
  try {
    const { checkIn, checkOut, guests } = req.query;
    
    if (!checkIn || !checkOut) {
      return res.status(400).json({ msg: 'יש לספק תאריכי צ\'ק-אין וצ\'ק-אאוט' });
    }
    
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    // בדיקת תקינות התאריכים
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return res.status(400).json({ msg: 'תאריכים לא תקינים' });
    }
    
    if (checkInDate >= checkOutDate) {
      return res.status(400).json({ msg: 'תאריך הצ\'ק-אין חייב להיות לפני תאריך הצ\'ק-אאוט' });
    }
    
    // מציאת כל החדרים הפעילים
    const filter = { isActive: true };
    
    // סינון לפי מספר אורחים אם צוין
    if (guests) {
      filter.capacity = { $gte: parseInt(guests) };
    }
    
    const allRooms = await Room.find(filter);
    
    // מציאת כל ההזמנות שמתנגשות עם התאריכים המבוקשים
    const bookedRooms = await Booking.find({
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
    }).select('room');
    
    // יצירת מערך של מזהי חדרים שכבר הוזמנו
    const bookedRoomIds = bookedRooms.map(booking => booking.room.toString());
    
    // סינון החדרים הזמינים
    const availableRooms = allRooms.filter(room => !bookedRoomIds.includes(room._id.toString()));
    
    res.json(availableRooms);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('שגיאת שרת');
  }
}; 