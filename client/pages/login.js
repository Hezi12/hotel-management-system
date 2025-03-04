import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { HiOutlineLogin, HiOutlineMail, HiOutlineLockClosed } from 'react-icons/hi';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  
  // אם המשתמש כבר מחובר, הפנייה לדף הבית או לדף שממנו הגיע
  useEffect(() => {
    if (isAuthenticated) {
      const redirectPath = router.query.redirect || '/';
      router.push(redirectPath);
    }
  }, [isAuthenticated, router]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isLoading) return;
    
    setError('');
    setIsLoading(true);
    
    try {
      // ניסיון התחברות
      const success = await login(email, password);
      
      if (success) {
        // הפניה לדף הבית או לדף שממנו המשתמש הגיע
        const redirectPath = router.query.redirect || '/';
        router.push(redirectPath);
      }
    } catch (error) {
      setError('אירעה שגיאה בהתחברות. נסה שוב מאוחר יותר.');
      console.error('Error during login:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Head>
        <title>התחברות | רוטשילד 79</title>
        <meta name="description" content="התחברות למערכת הניהול של רוטשילד 79" />
      </Head>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-bold text-primary-800 mb-6">
          רוטשילד 79
        </h1>
        <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
          התחברות למערכת
        </h2>
      </div>
      
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-custom sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* שדה אימייל */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-primary-700">
                דוא"ל
              </label>
              <div className="mt-1 relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input pr-10"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <HiOutlineMail className="h-5 w-5 text-primary-400" />
                </div>
              </div>
            </div>
            
            {/* שדה סיסמה */}
            <div>
              <div className="flex justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-primary-700">
                  סיסמה
                </label>
                <Link href="/forgot-password" className="text-sm text-accent hover:text-accent-dark">
                  שכחת סיסמה?
                </Link>
              </div>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input pr-10"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <HiOutlineLockClosed className="h-5 w-5 text-primary-400" />
                </div>
              </div>
            </div>
            
            {/* הצגת שגיאה */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}
            
            {/* כפתור התחברות */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-b-2 border-white rounded-full animate-spin"></div>
                ) : (
                  <HiOutlineLogin className="h-5 w-5" />
                )}
                <span>התחברות</span>
              </button>
            </div>
          </form>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">או</span>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <Link
                href="/"
                className="font-medium text-accent hover:text-accent-dark"
              >
                חזרה לאתר
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 