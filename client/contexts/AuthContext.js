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

  // פונקציית התחברות
  const login = async (email, password) => {
    try {
      setLoading(true);
      const data = await loginUser({ email, password });
      
      if (data.token) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        setIsAuthenticated(true);
        toast.success('התחברת בהצלחה!');
        return true;
      }
    } catch (error) {
      const errorMessage = error.response?.data?.msg || 'שגיאה בהתחברות. נסה שוב.';
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