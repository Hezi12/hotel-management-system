#!/bin/bash

# צבעים
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "מנקה את כל תהליכי Node שעלולים לגרום לבעיות..."

# זיהוי ועצירת תהליכי Node הקשורים לפרויקט
echo "עוצר תהליכי Node הקשורים לפרויקט..."

# מצא וסגור תהליכים בפורט 5001 (שרת)
PORT_5001_PIDS=$(lsof -ti:5001)
if [ ! -z "$PORT_5001_PIDS" ]; then
  echo "מוצא תהליכים הרצים על פורט 5001: $PORT_5001_PIDS"
  kill -9 $PORT_5001_PIDS
  echo "תהליכים בפורט 5001 הופסקו בהצלחה."
else
  echo "לא נמצאו תהליכים רצים על פורט 5001."
fi

# מצא וסגור תהליכים בפורט 3000 (קליינט)
PORT_3000_PIDS=$(lsof -ti:3000)
if [ ! -z "$PORT_3000_PIDS" ]; then
  echo "מוצא תהליכים הרצים על פורט 3000: $PORT_3000_PIDS"
  kill -9 $PORT_3000_PIDS
  echo "תהליכים בפורט 3000 הופסקו בהצלחה."
else
  echo "לא נמצאו תהליכים רצים על פורט 3000."
fi

# בדוק אם יש קובץ של תהליכי ייצור ועצור אותם
if [ -f ".prod_pids" ]; then
  PROD_PIDS=$(cat .prod_pids)
  if [ ! -z "$PROD_PIDS" ]; then
    echo "סוגר תהליכי ייצור מזוהים: $PROD_PIDS"
    kill -9 $PROD_PIDS 2>/dev/null || true
    rm .prod_pids
  fi
fi

echo "כל תהליכי Node נעצרו בהצלחה."

# ניקוי קבצים זמניים
echo "מנקה קבצים זמניים..."

# ניקוי תיקיית .next
if [ -d "./client/.next" ]; then
  echo "מנקה את תיקיית .next"
  rm -rf ./client/.next
fi

# מחיקת קבצים זמניים של Node
find . -name "node_modules/.cache" -type d -exec rm -rf {} +

echo "הניקוי הושלם בהצלחה. כעת ניתן להפעיל מחדש את האפליקציה."
echo "כדי להפעיל מחדש את האפליקציה, הרץ:"
echo "bash run-all.sh" 