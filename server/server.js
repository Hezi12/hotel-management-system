const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const morgan = require('morgan');

// טעינת משתני סביבה
dotenv.config();

// יבוא קונפיגורציית מסד הנתונים
const connectDB = require('./config/db');

// יצירת יישום Express
const app = express();

// הגדרות CORS מעודכנות לתמיכה בפרישה בענן
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://hotel-management-system.vercel.app'] 
    : 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token'],
  credentials: true
};

// פונקציית יומן לתיעוד מפורט יותר של הבקשות
app.use((req, res, next) => {
  console.log('\n========== בקשה חדשה ==========');
  console.log(`זמן: ${new Date().toISOString()}`);
  console.log(`שיטה: ${req.method}`);
  console.log(`נתיב: ${req.url}`);
  console.log('כותרות:', JSON.stringify({
    'host': req.headers.host,
    'origin': req.headers.origin,
    'user-agent': req.headers['user-agent'],
    'content-type': req.headers['content-type'],
    'referer': req.headers.referer
  }, null, 2));
  
  // רישום הגוף רק אם הוא לא ריק ולא מכיל מידע רגיש
  if (req.body && Object.keys(req.body).length > 0) {
    const safeBody = { ...req.body };
    // הסתרת מידע רגיש
    if (safeBody.password) safeBody.password = '***REDACTED***';
    if (safeBody.email) safeBody.email = '***REDACTED***';
    if (safeBody.paymentDetails) safeBody.paymentDetails = '***REDACTED***';
    
    console.log('גוף הבקשה:', JSON.stringify(safeBody, null, 2));
  }
  
  // רישום התשובה באופן מפורט
  const originalSend = res.send;
  res.send = function(body) {
    console.log(`\n========== תשובה נשלחת ==========`);
    console.log(`סטטוס: ${res.statusCode}`);
    console.log(`גודל התשובה: ${body ? body.length : 0} בתים`);
    
    // לוגים של התשובה רק אם זו לא תשובה גדולה מדי
    if (body && typeof body === 'string' && body.length < 500) {
      try {
        console.log('תוכן התשובה:', body);
      } catch (e) {
        console.log('לא ניתן להציג את תוכן התשובה');
      }
    }
    
    console.log(`========== סיום בקשה ==========\n`);
    originalSend.call(this, body);
    return this;
  };
  
  next();
});

// Middleware
app.use(express.json({ extended: false }));
app.use(cors(corsOptions));

// חיבור למסד הנתונים רק אם לא נמצאים בסביבת Vercel או שזו לא קריאה מהמודול
if (process.env.NODE_ENV !== 'vercel' && !process.env.VERCEL) {
  console.log('Attempting to connect to MongoDB...');
  console.log('Connection string:', process.env.MONGO_URI ? 'URI is set' : 'URI is not set');
  connectDB();
}

// הגדרת נתיבים
app.use('/api/users', require('./routes/users'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/finance', require('./routes/finance'));

// נתיב עבור התחברות (במקום /api/auth/login)
app.post('/login', (req, res, next) => {
  console.log('התקבלה בקשת התחברות ב-/login - מעביר ל-/api/auth/login');
  req.url = '/api/auth/login';
  app._router.handle(req, res, next);
});

// שליחת קבצים סטטיים בסביבת ייצור
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client', 'build', 'index.html'));
  });
}

// נתיב בסיסי לבדיקת פעילות השרת
app.get('/', (req, res) => {
  res.json({ message: 'ברוכים הבאים ל-API של מערכת ניהול המלונית!' });
});

// נתיב ל-/api
app.get('/api', (req, res) => {
  console.log('הגעה לנתיב /api - שולח תשובה');
  
  // יצירת תשובה עם מידע מורחב
  const apiResponse = {
    message: 'ברוכים הבאים ל-API של מערכת ניהול המלונית!',
    endpoints: [
      '/api/users',
      '/api/auth',
      '/api/rooms',
      '/api/bookings',
      '/api/dashboard',
      '/api/finance'
    ],
    status: 'פעיל',
    version: '1.0',
    serverTime: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  };
  
  // שליחת התשובה
  res.json(apiResponse);
  console.log('תשובה נשלחה בהצלחה מנתיב /api');
});

// טיפול בשגיאות
app.use((err, req, res, next) => {
  console.error('\n========== שגיאת שרת ==========');
  console.error(`זמן: ${new Date().toISOString()}`);
  console.error(`נתיב: ${req.path}`);
  console.error(`שיטה: ${req.method}`);
  console.error('הודעת שגיאה:', err.message);
  console.error('מחסנית קריאות:', err.stack);
  
  if (req.body && Object.keys(req.body).length > 0) {
    const safeBody = { ...req.body };
    // הסתרת מידע רגיש
    if (safeBody.password) safeBody.password = '***REDACTED***';
    if (safeBody.email) safeBody.email = '***REDACTED***';
    if (safeBody.paymentDetails) safeBody.paymentDetails = '***REDACTED***';
    
    console.error('גוף הבקשה:', JSON.stringify(safeBody, null, 2));
  }
  
  console.error('========== סיום שגיאה ==========\n');
  
  res.status(500).json({
    success: false,
    error: err.message || 'שגיאת שרת פנימית'
  });
});

// התאמות לפורט בסביבת ייצור
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`========== השרת פועל ==========`);
  console.log(`זמן התחלה: ${new Date().toISOString()}`);
  console.log(`פורט: ${PORT}`);
  console.log(`סביבה: ${process.env.NODE_ENV || 'development'}`);
  console.log(`==============================`);
});

// ייצוא האפליקציה לשימוש ב-Vercel
module.exports = app; 