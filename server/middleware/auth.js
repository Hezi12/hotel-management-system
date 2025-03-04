const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware לאימות משתמש
 * מאפשר הגדרת מערך תפקידים מורשים
 * @param {Array} roles - מערך תפקידים מורשים לגישה
 */
module.exports = (roles = []) => {
  // המר מחרוזת בודדת למערך
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return async (req, res, next) => {
    const token = req.header('x-auth-token');

    // בדיקה האם הטוקן קיים
    if (!token) {
      return res.status(401).json({ msg: 'אין טוקן, הגישה נדחתה' });
    }

    try {
      // אימות הטוקן
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      
      // מציאת המשתמש
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({ msg: 'משתמש לא קיים, הגישה נדחתה' });
      }
      
      // בדיקה אם חשבון המשתמש פעיל
      if (!user.isActive) {
        return res.status(401).json({ msg: 'החשבון לא פעיל, הגישה נדחתה' });
      }
      
      // בדיקת הרשאות - אם יש צורך
      if (roles.length && !roles.includes(user.role)) {
        return res.status(403).json({ msg: 'אין הרשאה מתאימה לפעולה זו' });
      }
      
      // עדכון זמן ההתחברות האחרון
      await User.findByIdAndUpdate(user._id, { lastLogin: Date.now() });
      
      // הוספת המשתמש לבקשה
      req.user = user;
      
      next();
    } catch (err) {
      console.error('שגיאת אימות:', err.message);
      res.status(401).json({ msg: 'טוקן לא תקין, הגישה נדחתה' });
    }
  };
}; 