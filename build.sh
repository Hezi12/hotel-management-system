#!/bin/bash

# מציג הודעת פתיחה
echo "בונה את מערכת ניהול המלון..."
echo "==============================================="

# קביעת צבעים לפלט
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# בניית השרת
echo -e "${BLUE}בונה את השרת...${NC}"
cd server && npm run build
if [ $? -ne 0 ]; then
  echo -e "${RED}שגיאה בבניית השרת${NC}"
  exit 1
fi

# בניית הקליינט
echo -e "${GREEN}בונה את הקליינט...${NC}"
cd ../client && npm run build
if [ $? -ne 0 ]; then
  echo -e "${RED}שגיאה בבניית הקליינט${NC}"
  exit 1
fi

echo -e "${GREEN}הבנייה הושלמה בהצלחה!${NC}"
echo "הרץ את המערכת עם ./run-prod.sh" 