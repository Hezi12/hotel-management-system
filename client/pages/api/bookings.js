import { IncomingForm } from 'formidable';
import { promises as fs } from 'fs';

// מגדיר שנקרא את גוף הבקשה בעצמנו
export const config = {
  api: {
    bodyParser: true,
  },
};

// API route המפנה בקשות לשרת האחורי 
export default async function handler(req, res) {
  // אם אנחנו במצב פיתוח, הפנה לשרת המקומי בפורט 5001
  const target = 'http://localhost:5001';
  
  if (req.method === 'POST') {
    try {
      console.log('Received booking request:', req.body);
      
      // קריאה לשרת האחורי
      const response = await fetch(`${target}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
      });

      // בדוק אם התגובה תקינה
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response from server:', response.status, errorText);
        return res.status(response.status).json({ 
          message: `שגיאה מהשרת: ${response.status}`,
          details: errorText
        });
      }

      const data = await response.json();
      return res.status(201).json(data);
    } catch (error) {
      console.error('Error forwarding request:', error);
      return res.status(500).json({ 
        message: 'שגיאה בהעברת הבקשה לשרת',
        error: error.message 
      });
    }
  } else {
    // שיטות אחרות כמו GET, PUT וכדומה
    try {
      // העבר את הבקשה לשרת האחורי
      const url = `${target}/api/bookings${req.url.replace('/api/bookings', '')}`;
      const response = await fetch(url, {
        method: req.method,
        headers: {
          'Content-Type': 'application/json',
        },
        ...(req.body && { body: JSON.stringify(req.body) }),
      });

      const data = await response.json();
      return res.status(response.status).json(data);
    } catch (error) {
      console.error(`שגיאה בהעברת בקשת ${req.method}:`, error);
      return res.status(500).json({ 
        message: 'שגיאה בהעברת הבקשה לשרת',
        error: error.message 
      });
    }
  }
} 