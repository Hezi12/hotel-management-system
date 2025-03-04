import { createContext, useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { loginUser, fetchUserProfile } from '../lib/api';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // בדיקת מצב אימות בעת טעינת האפליקציה
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        
        if (token) {
          try {
            const userData = await fetchUserProfile();
            setUser(userData);
            setIsAuthenticated(true);
          } catch (error) {
            // במקרה של שגיאה בטוקן, מנקים אותו
            localStorage.removeItem('token');
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      }
      
      setLoading(false);
    };
    
    checkUserLoggedIn();
  }, []);

  // פונקציית התחברות משופרת
  const login = async (email, password) => {
    try {
      setLoading(true);
      
      // לוג לפני השליחה
      console.log('מנסה להתחבר לשרת עם:', { email });
      
      // שליחת בקשת התחברות
      const data = await loginUser({ email, password });
      
      // לוג תשובה מהשרת
      console.log('תשובה מהשרת:', JSON.stringify(data));
      
      // בדיקה שהתקבל טוקן תקין
      if (data && data.token) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        setIsAuthenticated(true);
        toast.success('התחברת בהצלחה!');
        return true;
      } else {
        // אין טוקן בתשובה
        console.error('לא התקבל טוקן בתשובה:', data);
        toast.error('שגיאה בנתוני ההתחברות - לא התקבל טוקן');
        return false;
      }
    } catch (error) {
      console.error('שגיאה בתהליך ההתחברות:', error);
      
      // ניסיון להוציא הודעת שגיאה מפורטת יותר
      let errorMessage = 'שגיאה בהתחברות. נסה שוב.';
      
      if (error.response) {
        console.error('פרטי שגיאה מהשרת:', {
          status: error.response.status,
          data: error.response.data
        });
        
        // בדיקה אם יש הודעת שגיאה מהשרת
        if (error.response.data) {
          if (error.response.data.error) {
            errorMessage = error.response.data.error;
          } else if (error.response.data.msg) {
            errorMessage = error.response.data.msg;
          }
        }
        
        // הודעות שגיאה לפי קוד סטטוס
        switch (error.response.status) {
          case 400:
            errorMessage = errorMessage || 'נתוני התחברות שגויים';
            break;
          case 401:
            errorMessage = errorMessage || 'אימייל או סיסמה שגויים';
            break;
          case 404:
            errorMessage = errorMessage || 'שרת התחברות לא נמצא';
            break;
          case 405:
            errorMessage = errorMessage || 'שיטת התחברות לא נתמכת';
            break;
          case 500:
            errorMessage = errorMessage || 'שגיאה פנימית בשרת';
            break;
        }
      } else if (error.request) {
        // הבקשה נשלחה אך לא התקבלה תשובה
        console.error('לא התקבלה תשובה מהשרת', error.request);
        errorMessage = 'לא התקבלה תשובה מהשרת. בדוק את החיבור לאינטרנט.';
      } else {
        // שגיאה בהכנת הבקשה
        console.error('שגיאה לפני שליחת הבקשה:', error.message);
        errorMessage = 'שגיאה בהכנת בקשת התחברות: ' + error.message;
      }
      
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // פונקציית התנתקות
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    toast.info('התנתקת בהצלחה');
    router.push('/');
  };

  // בדיקה אם יש למשתמש הרשאות מנהל או מנהל
  const isAdminOrManager = () => {
    return user && (user.role === 'admin' || user.role === 'manager');
  };

  // בדיקה אם יש למשתמש הרשאות מנהל
  const isAdmin = () => {
    return user && user.role === 'admin';
  };

  // הערך שיועבר ל-Provider
  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    isAdminOrManager,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 