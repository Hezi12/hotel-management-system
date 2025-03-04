/**
 * מידלוור לבדיקת הרשאות לפי תפקיד
 */

// בדיקת הרשאת מנהל
exports.isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ msg: 'אין הרשאת גישה, נדרשת התחברות' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'אין הרשאת גישה, נדרש תפקיד מנהל' });
  }

  next();
};

// בדיקת הרשאת מנהל קבלה
exports.isManager = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ msg: 'אין הרשאת גישה, נדרשת התחברות' });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'manager') {
    return res.status(403).json({ msg: 'אין הרשאת גישה, נדרש תפקיד מנהל קבלה או מנהל' });
  }

  next();
};

// בדיקת הרשאת צוות
exports.isStaff = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ msg: 'אין הרשאת גישה, נדרשת התחברות' });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'manager' && req.user.role !== 'staff') {
    return res.status(403).json({ msg: 'אין הרשאת גישה, נדרש תפקיד צוות, מנהל קבלה או מנהל' });
  }

  next();
}; 