/**
 * קובץ בדיקה פשוט לנקודת קצה של התחברות
 * מחזיר מידע על הבקשה הנכנסת ותגובת הצלחה
 */

module.exports = async (req, res) => {
  // מדפיס מידע על הבקשה - יופיע בלוגים של Vercel
  console.log('קיבל בקשה לtest-login');
  console.log('Method:', req.method);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body:', JSON.stringify(req.body, null, 2));

  // מחזיר תגובת הצלחה לכל סוג בקשה
  return res.status(200).json({
    success: true,
    message: 'בקשת הבדיקה התקבלה בהצלחה',
    method: req.method,
    path: req.url,
    timestamp: new Date().toISOString()
  });
}; 