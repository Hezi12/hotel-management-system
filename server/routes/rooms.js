const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../middleware/auth');
const roomController = require('../controllers/roomController');

// @route   GET api/rooms
// @desc    קבלת כל החדרים הפעילים
// @access  Public
router.get('/', roomController.getRooms);

// @route   GET api/rooms/all
// @desc    קבלת כל החדרים (כולל לא פעילים)
// @access  Private/Admin
router.get('/all', auth(['admin', 'manager']), roomController.getAllRooms);

// @route   GET api/rooms/available
// @desc    קבלת חדרים זמינים לתאריכים מסוימים
// @access  Public
router.get('/available', roomController.getAvailableRooms);

// @route   GET api/rooms/:id
// @desc    קבלת חדר לפי מזהה
// @access  Public
router.get('/:id', roomController.getRoomById);

// @route   GET api/rooms/:id/availability
// @desc    בדיקת זמינות חדר בתאריכים מסוימים
// @access  Public
router.get('/:id/availability', roomController.checkRoomAvailability);

// @route   POST api/rooms
// @desc    יצירת חדר חדש
// @access  Private/Admin
router.post('/', [
  auth(['admin', 'manager']),
  [
    check('roomNumber', 'מספר חדר הוא שדה חובה').not().isEmpty(),
    check('type', 'סוג חדר הוא שדה חובה').not().isEmpty(),
    check('capacity', 'תכולת חדר חייבת להיות מספר תקין').isInt({ min: 1, max: 10 }),
    check('pricePerNight', 'מחיר ללילה חייב להיות מספר תקין').isInt({ min: 0 }),
    check('floor', 'מספר קומה חייב להיות מספר תקין').isInt({ min: -1, max: 20 })
  ]
], roomController.createRoom);

// @route   PUT api/rooms/:id
// @desc    עדכון חדר
// @access  Private/Admin
router.put('/:id', auth(['admin', 'manager']), roomController.updateRoom);

// @route   DELETE api/rooms/:id
// @desc    מחיקת חדר
// @access  Private/Admin
router.delete('/:id', auth(['admin', 'manager']), roomController.deleteRoom);

module.exports = router; 