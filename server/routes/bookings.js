const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../middleware/auth');
const bookingController = require('../controllers/bookingController');

// @route   GET api/bookings
// @desc    קבלת כל ההזמנות
// @access  Private
router.get('/', auth(), bookingController.getBookings);

// @route   GET api/bookings/:id
// @desc    קבלת הזמנה לפי מזהה
// @access  Private
router.get('/:id', auth(), bookingController.getBookingById);

// @route   GET api/bookings/confirmation/:code
// @desc    קבלת הזמנה לפי קוד אישור
// @access  Public
router.get('/confirmation/:code', bookingController.getBookingByConfirmationCode);

// @route   POST api/bookings
// @desc    יצירת הזמנה חדשה
// @access  Public
router.post('/', [
  check('roomId', 'מזהה חדר הוא שדה חובה').not().isEmpty(),
  check('guestName', 'שם האורח הוא שדה חובה').not().isEmpty(),
  check('guestEmail', 'דוא"ל האורח הוא שדה חובה').isEmail(),
  check('guestPhone', 'מספר טלפון האורח הוא שדה חובה').not().isEmpty(),
  check('checkIn', "תאריך צ'ק-אין הוא שדה חובה").isISO8601().toDate(),
  check('checkOut', "תאריך צ'ק-אאוט הוא שדה חובה").isISO8601().toDate(),
  check('numberOfGuests', 'מספר אורחים הוא שדה חובה').isInt({ min: 1, max: 10 })
], bookingController.createBooking);

// @route   PUT api/bookings/:id
// @desc    עדכון הזמנה
// @access  Private
router.put('/:id', auth(), bookingController.updateBooking);

// @route   PUT api/bookings/:id/cancel
// @desc    ביטול הזמנה
// @access  Private
router.put('/:id/cancel', auth(), bookingController.cancelBooking);

// @route   PUT api/bookings/:id/check-in
// @desc    ביצוע צ'ק-אין להזמנה
// @access  Private
router.put('/:id/check-in', auth(), bookingController.checkIn);

// @route   PUT api/bookings/:id/check-out
// @desc    ביצוע צ'ק-אאוט להזמנה
// @access  Private
router.put('/:id/check-out', auth(), bookingController.checkOut);

module.exports = router; 