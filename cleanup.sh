#!/bin/bash

# צבעים
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}מנקה את כל תהליכי Node שעלולים לגרום לבעיות...${NC}"

# מחפש תהליכי נוד ועוצר אותם
echo -e "${RED}עוצר תהליכי Node הקשורים לפרויקט...${NC}"
pkill -f "node.*hotel-management-system"

# חכה שנייה
sleep 1

# ודא שהתהליכים נעצרו
if pgrep -f "node.*hotel-management-system" > /dev/null; then
  echo -e "${RED}תהליכים עדיין רצים, מבצע כיבוי מאולץ...${NC}"
  pkill -9 -f "node.*hotel-management-system"
fi

echo -e "${GREEN}כל תהליכי Node נעצרו בהצלחה.${NC}"

# ניקוי קבצים זמניים
echo -e "${BLUE}מנקה קבצים זמניים...${NC}"

# ניקוי ספריות זמניות בצד השרת
if [ -d "./server/node_modules/.cache" ]; then
  echo "מנקה את cache של השרת"
  rm -rf ./server/node_modules/.cache
fi

# ניקוי ספריות זמניות בצד הלקוח
if [ -d "./client/node_modules/.cache" ]; then
  echo "מנקה את cache של הלקוח"
  rm -rf ./client/node_modules/.cache
fi

if [ -d "./client/.next" ]; then
  echo "מנקה את תיקיית .next"
  rm -rf ./client/.next
fi

echo -e "${GREEN}הניקוי הושלם בהצלחה. כעת ניתן להפעיל מחדש את האפליקציה.${NC}"
echo -e "${BLUE}כדי להפעיל מחדש את האפליקציה, הרץ:${NC}"
echo -e "${GREEN}bash run-all.sh${NC}" 