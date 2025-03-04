export default function handler(req, res) {
  // הוספת כותרות CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // טיפול בבקשת OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // רק בקשות POST מורשות להתחברות
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'שיטה לא מורשית. רק POST מורשה.' });
  }

  try {
    // בקשת התחברות ריקה
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: 'נדרשים פרטי התחברות' });
    }

    const { email, password } = req.body;
    
    // וידוא שהוכנסו אימייל וסיסמה
    if (!email || !password) {
      return res.status(400).json({ error: 'נדרשים גם אימייל וגם סיסמה' });
    }

    // בדיקה האם הפרטים תואמים למשתמש הניסיון שלנו
    if (email === 'schwartzhezi@gmail.com' && password === '111111') {
      // התחברות הצליחה!
      return res.status(200).json({
        success: true,
        user: {
          id: '1',
          name: 'חזי שוורץ',
          email: 'schwartzhezi@gmail.com',
          role: 'admin'
        },
        token: 'demo_token_12345'
      });
    } else {
      // התחברות נכשלה
      return res.status(401).json({ error: 'אימייל או סיסמה שגויים' });
    }
  } catch (error) {
    console.error('שגיאה בתהליך ההתחברות:', error);
    return res.status(500).json({ error: 'שגיאת שרת פנימית', details: error.message });
  }
} 