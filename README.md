# מערכת ניהול מלון - Rothschild Hotel

מערכת מקיפה לניהול מלון, כולל ניהול חדרים, הזמנות, משתמשים, צוות ופיננסים.

## תכונות עיקריות

- **ניהול חדרים**: הוספה, עדכון ומחיקה של חדרים, כולל מאפיינים מלאים, סטטוס תפוסה וזמינות.
- **ניהול הזמנות**: יצירה, עדכון וביטול של הזמנות, כולל בדיקת זמינות בזמן אמת.
- **לוח שנה הזמנות גרפי**: צפייה בכל ההזמנות בתצוגה חזותית של לוח שנה, הצגת פרטי הזמנות מלאים כולל פרטי תשלום, וצפייה בסטטוס ההזמנות לפי צבעים.
- **ממשק ניהול**: לוח מחוונים מלא למנהלים ולצוות בית המלון.
- **ניהול משתמשים**: מערכת הרשאות מבוססת תפקידים (מנהל, מנהל קבלה, עובד).
- **ניהול פיננסי**: מעקב אחר תשלומים, הוצאות וסיכומים פיננסיים.
- **לוח מחוונים אנליטי**: סטטיסטיקות תפוסה, הכנסות ומגמות.
- **תמיכה בקליינט ובשרת**: ארכיטקטורה מלאה של FullStack.

## סביבת פיתוח

### דרישות מקדימות

1. Node.js (גרסה 14.0.0 ומעלה)
2. MongoDB (מקומי או שירות ענן כמו MongoDB Atlas)
3. npm או yarn

### התקנה

1. שכפל את המאגר:
```bash
git clone https://github.com/your-username/hotel-management-system.git
cd hotel-management-system
```

2. התקן תלויות עבור השרת:
```bash
cd server
npm install
```

3. התקן תלויות עבור הקליינט:
```bash
cd ../client
npm install
```

4. צור קובץ `.env` בתיקיית השרת:
```
NODE_ENV=development
PORT=5001
MONGO_URI=mongodb://localhost:27017/hotel_management
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
EMAIL_SERVICE=gmail
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-email-password
EMAIL_FROM=your-email@gmail.com
```

### שימוש במערכת

1. התחל את השרת:
```bash
cd server
npm run dev
```

2. התחל את הקליינט:
```bash
cd client
npm run dev
```

3. אתחל את בסיס הנתונים עם נתוני דוגמה:
```bash
cd server
npm run seed
```

4. פתח את הדפדפן בכתובת:
   - ממשק משתמש: `http://localhost:3002`
   - ממשק ניהול: `http://localhost:3002/admin`
   - API השרת: `http://localhost:5001/api`

### פרטי התחברות לדוגמה

לאחר הפעלת סקריפט האתחול, תוכל להשתמש בפרטי ההתחברות הבאים:

- **מנהל**:
  - אימייל: admin@rothschild-hotel.co.il
  - סיסמה: admin123

- **מנהל קבלה**:
  - אימייל: manager@rothschild-hotel.co.il
  - סיסמה: manager123

## מבנה הפרויקט

### שרת (Node.js/Express)

```
server/
├── config/          # הגדרות מערכת וקישוריות
├── controllers/     # בקרי API
├── middleware/      # מידלוור לניהול הרשאות ומשימות אחרות
├── models/          # מודלים ותרשימי מונגו
├── routes/          # הגדרות נתיבי API 
├── scripts/         # סקריפטים לניהול המערכת
├── utils/           # פונקציות עזר
└── server.js        # נקודת כניסה לשרת
```

### קליינט (React)

```
client/
├── public/          # נכסים סטטיים
├── src/             # קוד המקור
│   ├── actions/     # פעולות Redux
│   ├── components/  # רכיבי React משותפים
│   ├── context/     # React Context Providers
│   ├── hooks/       # React Custom Hooks
│   ├── pages/       # מרכיבי דף
│   ├── reducers/    # רדיוסרי Redux
│   ├── utils/       # פונקציות עזר
│   ├── App.js       # רכיב האפליקציה המרכזי
│   └── index.js     # נקודת כניסה לקליינט
└── package.json     # תצורות והגדרות פרויקט
```

## API Endpoints

### אימות משתמשים
- `POST /api/auth/login` - התחברות משתמש
- `POST /api/auth/logout` - ניתוק משתמש
- `GET /api/auth/me` - קבלת פרטי המשתמש הנוכחי

### משתמשים
- `GET /api/users` - קבלת כל המשתמשים (מנהל בלבד)
- `GET /api/users/:id` - קבלת משתמש לפי מזהה
- `POST /api/users` - יצירת משתמש חדש
- `PUT /api/users/:id` - עדכון משתמש
- `DELETE /api/users/:id` - מחיקת משתמש

### חדרים
- `GET /api/rooms` - קבלת כל החדרים הפעילים
- `GET /api/rooms/all` - קבלת כל החדרים (כולל לא פעילים)
- `GET /api/rooms/available` - חיפוש חדרים פנויים לפי תאריכים
- `GET /api/rooms/:id` - קבלת חדר לפי מזהה
- `POST /api/rooms` - יצירת חדר חדש
- `PUT /api/rooms/:id` - עדכון פרטי חדר
- `DELETE /api/rooms/:id` - מחיקת חדר

### הזמנות
- `GET /api/bookings` - קבלת כל ההזמנות
- `GET /api/bookings/search` - חיפוש הזמנות לפי פרמטרים שונים
- `GET /api/bookings/:id` - קבלת הזמנה לפי מזהה
- `POST /api/bookings` - יצירת הזמנה חדשה
- `PUT /api/bookings/:id` - עדכון הזמנה
- `DELETE /api/bookings/:id` - ביטול הזמנה
- `PUT /api/bookings/:id/checkin` - ביצוע צ'ק-אין
- `PUT /api/bookings/:id/checkout` - ביצוע צ'ק-אאוט

### דאשבורד
- `GET /api/dashboard/summary` - קבלת סיכום כללי
- `GET /api/dashboard/occupancy` - קבלת נתוני תפוסה שבועיים
- `GET /api/dashboard/revenue` - קבלת נתוני הכנסות חודשיים
- `GET /api/dashboard/today-bookings` - קבלת הזמנות של היום
- `GET /api/dashboard/room-stats` - קבלת סטטיסטיקות לפי סוגי חדרים

### פיננסים
- `GET /api/finance` - קבלת כל העסקאות הפיננסיות
- `GET /api/finance/summary` - קבלת סיכום פיננסי
- `GET /api/finance/:id` - קבלת עסקה פיננסית
- `POST /api/finance` - יצירת עסקה פיננסית
- `PUT /api/finance/:id` - עדכון עסקה פיננסית
- `DELETE /api/finance/:id` - מחיקת עסקה פיננסית

## ניהול גרסאות

גרסה נוכחית: 1.0.0

## מפתחים

- יותם ישראלי - מפתח ראשי

## רישיון

Copyright (c) 2023 Rothschild Hotel. כל הזכויות שמורות. 

## רכיבי המערכת העיקריים

### לוח שנה הזמנות (BookingGanttCalendar)

מציג לוח שנה ויזואלי של הזמנות על פני כל החדרים במלון. התכונות העיקריות:

- **תצוגה חזותית**: מציג את כל ההזמנות בפורמט לוח שנה ברור לפי חדר ותאריך.
- **סטטוסים בצבעים**: הזמנות מוצגות בצבעים שונים לפי סטטוס (מאושר, ממתין, צ'ק-אין, צ'ק-אאוט, מבוטל).
- **מידע מלא**: לחיצה על הזמנה מציגה מודאל עם כל פרטי ההזמנה והאורח.
- **פרטי תשלום**: הצגת מידע פיננסי מלא כולל אמצעי תשלום ופרטי כרטיס אשראי מוצפנים.
- **ניווט פשוט**: כפתורי ניווט מאפשרים מעבר קדימה ואחורה בזמן, וכפתור "היום" לקפיצה מהירה לתאריך הנוכחי.

### מסך ניהול הזמנות

מציג את כל ההזמנות במערכת ומאפשר:

- **סינון וחיפוש**: אפשרות לסנן הזמנות לפי סטטוס, תאריכים, שמות אורחים ופרמטרים נוספים.
- **עריכה מהירה**: עדכון פרטי הזמנה, שינוי סטטוס וביצוע צ'ק-אין/צ'ק-אאוט.
- **פעולות מהירות**: שליחת אישורי הזמנה, יצירת חשבוניות ופעולות נפוצות אחרות. 

## העלאה ל-Vercel

מערכת ניהול המלון מוכנה להעלאה לפלטפורמת Vercel. הנה השלבים להעלאה:

### דרך ממשק האינטרנט של Vercel

1. צור חשבון ב-[Vercel](https://vercel.com) אם אין לך עדיין
2. העלה את הפרויקט ל-GitHub, GitLab או Bitbucket
3. היכנס ל-Vercel ולחץ על "New Project"
4. בחר את הריפוזיטורי שלך
5. ודא שה-Framework Preset מוגדר ל-"Next.js"
6. הוסף את המשתנים הבאים ב-"Environment Variables":
   - `MONGO_URI`: כתובת מסד הנתונים MongoDB שלך
   - `JWT_SECRET`: מחרוזת סיסמה לחתימת JWT
7. לחץ על "Deploy"

### דרך Vercel CLI

1. התקן את Vercel CLI:
```bash
npm i -g vercel
```

2. היכנס לחשבון Vercel שלך:
```bash
vercel login
```

3. הפעל את הפקודה הבאה מתיקיית הפרויקט:
```bash
vercel
```

4. עקוב אחר ההוראות שיופיעו

### הערות חשובות לגבי Vercel

- ב-Vercel, השרת רץ כפונקציית serverless בתיקיית `/api`
- ודא שיש לך גישה למסד נתונים MongoDB חיצוני (למשל MongoDB Atlas)
- משתני הסביבה חייבים להיות מוגדרים בלוח הבקרה של Vercel

## מבנה הפרויקט

- `/client` - קוד צד הלקוח (Next.js)
- `/server` - קוד צד השרת (Node.js + Express)
- `/api` - קוד עבור פונקציות serverless ב-Vercel

## תכונות

- **ניהול הזמנות**: יצירה, עריכה, מחיקה וצפייה בהזמנות
- **ניהול חדרים**: הוספת חדרים, עדכון פרטים, הגדרת זמינות
- **ניהול לקוחות**: שמירת פרטי לקוחות, היסטוריית הזמנות
- **ניהול תשלומים**: תיעוד תשלומים, יצירת חשבוניות
- **דוחות וסטטיסטיקה**: דוחות אכלוס, הכנסות ועוד
- **לוח שנה גאנט**: תצוגה חזותית של הזמנות ואכלוס
- **אימות משתמשים**: מערכת התחברות עם הרשאות שונות

## טכנולוגיות

- **צד לקוח**: React, Next.js, Tailwind CSS
- **צד שרת**: Node.js, Express
- **מסד נתונים**: MongoDB
- **אימות**: JWT (JSON Web Tokens)
- **Deployment**: Vercel 