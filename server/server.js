const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// טעינת משתני סביבה
dotenv.config();

// יבוא קונפיגורציית מסד הנתונים
const connectDB = require('./config/db');

// יצירת יישום Express
const app = express();

// CORS middleware עם אפשרויות להגדיר מקורות מורשים
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'https://hotel-management-system-weld-nine.vercel.app',
    'https://hotel-management-system-server.onrender.com'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin'],
  credentials: true
};

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

// טיפול בשגיאות
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  console.error('Error Stack:', err.stack);
  console.error('Request Body:', req.body);
  console.error('Request Path:', req.path);
  console.error('Request Method:', req.method);
  
  res.status(500).json({
    success: false,
    error: err.message || 'שגיאת שרת פנימית'
  });
});

// בדיקה אם הקוד רץ ישירות או מיובא כמודול
// אם רץ ישירות, מפעיל את השרת
// אם מיובא (כמו ב-Vercel), רק מייצא את האפליקציה
if (require.main === module) {
  // הגדרת פורט והפעלת השרת
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// ייצוא האפליקציה לשימוש ב-Vercel
module.exports = app; 