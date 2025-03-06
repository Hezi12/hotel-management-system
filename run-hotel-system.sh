#!/bin/bash

echo "מפעיל את מערכת ניהול המלון..."
echo "==============================================="

# עבור לתיקיית הפרויקט
cd /Users/yhzqlswwrz/Documents/Projects/New/hotel-management-system

# הפעל את סקריפט הניקוי קודם
echo "מנקה תהליכים תקועים..."
bash cleanup.sh

# הפעל את המערכת
echo "מפעיל את המערכת..."
bash run-all.sh

# השאר את הסקריפט רץ
wait 