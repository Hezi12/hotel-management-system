#!/bin/bash

# מציג הודעת פתיחה
echo "מפעיל את מערכת ניהול המלון בסביבת ייצור..."
echo "==============================================="

# קביעת צבעים לפלט
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# העתקת קבצי סביבת הייצור
echo "מעתיק קבצי סביבת ייצור..."
if [ -f "./client/.env.production" ]; then
  cp ./client/.env.production ./client/.env.local
  echo "קובץ סביבת ייצור הועתק לקליינט"
else
  echo "אזהרה: קובץ .env.production לא נמצא בתיקיית הקליינט"
fi

if [ -f "./server/.env.production" ]; then
  cp ./server/.env.production ./server/.env
  echo "קובץ סביבת ייצור הועתק לשרת"
else
  echo "אזהרה: קובץ .env.production לא נמצא בתיקיית השרת"
fi

# בניית הקליינט
echo "בונה את גרסת הייצור של הקליינט..."
cd client
npm run build
if [ $? -ne 0 ]; then
  echo "שגיאה בבניית הקליינט"
  exit 1
fi

# הפעלת הקליינט בתצורת ייצור
echo "מפעיל את הקליינט בתצורת ייצור..."
npm run start &
CLIENT_PID=$!
echo "הקליינט פועל בתהליך מספר: $CLIENT_PID"

# חזרה לתיקיית הבסיס והפעלת השרת
cd ../server
echo "מפעיל את השרת בתצורת ייצור..."
NODE_ENV=production node server.js &
SERVER_PID=$!
echo "השרת פועל בתהליך מספר: $SERVER_PID"

cd ..
echo "==============================================="
echo "המערכת פועלת בסביבת ייצור!"
echo "ממשק המשתמש זמין בכתובת: http://localhost:3000"
echo "ה-API של השרת זמין בכתובת: http://localhost:5001/api"
echo "לחץ על CTRL+C כדי לעצור את כל השירותים"

# שמירת מזהי התהליכים לקובץ
echo "$CLIENT_PID $SERVER_PID" > .prod_pids

# המתנה לסיום
wait 