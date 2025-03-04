/**
 * קובץ API לנקודת הקצה login - הגרסה הפשוטה ביותר 
 * תומך בבקשות POST עם email ו-password
 */

// הגדרת כותרות CORS לאפשר גישה מכל מקור
const allowCors = fn => async (req, res) => {
  // הגדרת כותרות CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  
  // רישום פרטי הבקשה ללוגים
  console.log(`[${new Date().toISOString()}] קיבלתי בקשה לנקודת הקצה /api/login:`);
  console.log('- שיטה:', req.method);
  console.log('- כותרות:', JSON.stringify(req.headers));
  console.log('- גוף:', req.body ? JSON.stringify(req.body) : 'ריק');
  console.log('- נתיב:', req.url);
  
  // טיפול בבקשת OPTIONS (עבור CORS)
  if (req.method === 'OPTIONS') {
    return res.status(200).send('OK');
  }
  
  // אימות שהבקשה היא POST
  if (req.method !== 'POST') {
    console.log(`[שגיאה] שיטה ${req.method} אינה נתמכת. רק POST מאופשר.`);
    return res.status(405).json({ 
      success: false, 
      message: 'Method Not Allowed', 
      details: `השיטה ${req.method} אינה נתמכת. רק POST מאופשר.`,
      receivedMethod: req.method,
      supportedMethods: ['POST', 'OPTIONS']
    });
  }
  
  // המשך לפונקציה המקורית
  return await fn(req, res);
};

// פונקציית ההתחברות העיקרית
const loginHandler = async (req, res) => {
  try {
    console.log('[התחברות] מנסה להתחבר עם הנתונים:', req.body);
    
    // בדיקה שקיים גוף בבקשה
    if (!req.body) {
      console.log('[שגיאה] גוף הבקשה חסר');
      return res.status(400).json({
        success: false,
        message: 'חסרים פרטי התחברות',
        details: 'גוף הבקשה ריק. נדרשים שדות email ו-password.'
      });
    }
    
    // חילוץ שדות התחברות
    const { email, password } = req.body;
    
    // בדיקת תקינות שדות התחברות
    if (!email) {
      console.log('[שגיאה] חסר שדה אימייל');
      return res.status(400).json({
        success: false,
        message: 'חסר שדה אימייל',
        providedData: req.body
      });
    }
    
    if (!password) {
      console.log('[שגיאה] חסר שדה סיסמה');
      return res.status(400).json({
        success: false,
        message: 'חסר שדה סיסמה',
        providedData: { email } // מחזיר רק את האימייל, לא את הסיסמה
      });
    }
    
    // אימות פרטי ההתחברות - משתמש דמו לבדיקה
    const demoUser = {
      email: 'schwartzhezi@gmail.com',
      password: '111111',
      name: 'חזי שוורץ',
      role: 'admin'
    };
    
    // בדיקת התאמת פרטי המשתמש
    if (email !== demoUser.email) {
      console.log(`[שגיאה] משתמש לא נמצא: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'פרטי התחברות שגויים',
        details: 'המשתמש לא נמצא'
      });
    }
    
    if (password !== demoUser.password) {
      console.log(`[שגיאה] סיסמה שגויה למשתמש: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'פרטי התחברות שגויים',
        details: 'סיסמה שגויה'
      });
    }
    
    // יצירת טוקן לדוגמה (במערכת אמיתית, יש להשתמש ב-JWT)
    const token = `demo-token-${Date.now()}`;
    
    console.log(`[הצלחה] המשתמש ${email} התחבר בהצלחה`);
    
    // החזרת נתוני המשתמש והטוקן
    return res.status(200).json({
      success: true,
      message: 'התחברות הצליחה',
      user: {
        name: demoUser.name,
        email: demoUser.email,
        role: demoUser.role
      },
      token
    });
  } catch (error) {
    console.error('[שגיאה קריטית]', error);
    return res.status(500).json({
      success: false,
      message: 'אירעה שגיאה פנימית',
      error: error.message
    });
  }
};

// ייצוא הפונקציה עם מעטפת CORS
module.exports = allowCors(loginHandler); 