// Serverless function עבור Vercel
// קובץ זה מאפשר הרצת שרת Express בסביבת Vercel

// ייבוא מודולים
const path = require('path');
const fs = require('fs');

// קביעת סביבת Vercel
process.env.VERCEL = 'true';

// ניסיון להשתמש בקובץ השרת המקורי
let app;
try {
  // טעינת השרת המקורי
  const serverPath = path.join(__dirname, '../server/server');
  
  // מנסה לייבא את השרת
  app = require(serverPath);
  
  // הוספת טיפול בנתיב ה-API הבסיסי
  app.all('/api', (req, res) => {
    return res.json({ 
      message: 'API של מערכת ניהול המלון פועל בהצלחה!',
      version: '1.0.0',
      environment: 'Vercel'
    });
  });
  
  console.log('השרת נטען בהצלחה');
} catch (error) {
  console.error('שגיאה בטעינת השרת:', error);
  
  // יצירת שרת חלופי במקרה של שגיאה
  const express = require('express');
  app = express();
  
  app.use(express.json());
  
  app.all('/api', (req, res) => {
    return res.json({ 
      message: 'API פועל בסביבת חירום',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  });
  
  app.all('*', (req, res) => {
    return res.status(404).json({ error: 'הנתיב לא נמצא' });
  });
}

// ייצוא הפונקציה עבור Vercel
module.exports = app; 