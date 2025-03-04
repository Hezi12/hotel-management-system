#!/bin/bash

# מציג הודעת פתיחה
echo "מפעיל את מערכת ניהול המלון..."
echo "==============================================="

# קביעת צבעים לפלט
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# הפעלת השרת
echo -e "${BLUE}הפעלת השרת...${NC}"
cd server && npm run dev & 
SERVER_PID=$!

# חזרה לתיקייה הראשית והפעלת הקליינט
echo -e "${GREEN}הפעלת הקליינט...${NC}"
cd "$(dirname "$0")" # חזרה לתיקייה הראשית של הפרויקט
cd client && npm run dev &
CLIENT_PID=$!

# פונקציה שתרוץ בעת סגירת הסקריפט
function cleanup {
  echo -e "${BLUE}סוגר את כל התהליכים...${NC}"
  kill $SERVER_PID
  kill $CLIENT_PID
  exit
}

# רשום את הפונקציה לסגירה בעת קבלת אות סיום
trap cleanup SIGINT

# מציג הודעה על איך לסגור
echo -e "${GREEN}המערכת פועלת!${NC}"
echo "ממשק המשתמש זמין בכתובת: http://localhost:3000 (יתכן שיהיה זמין בפורט 3001 או 3002)"
echo "ממשק הניהול זמין בכתובת: http://localhost:3000/admin (יתכן שיהיה זמין בפורט 3001 או 3002)"
echo "ה-API של השרת זמין בכתובת: http://localhost:5001/api"
echo ""
echo "לחץ על CTRL+C כדי לעצור את כל השירותים"

# השאר את הסקריפט רץ
wait 