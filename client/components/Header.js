import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { HiOutlineMenu, HiOutlineX, HiOutlineUser, HiOutlineLogout } from 'react-icons/hi';
import { FaComments } from 'react-icons/fa';

const Header = ({ scrolled }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { isAuthenticated, user, logout, isAdminOrManager } = useAuth();
  const router = useRouter();
  const isHomePage = router.pathname === '/';

  // סגירת התפריט הנייד כאשר משנים דף
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [router.pathname]);

  // סגירת התפריט הנייד כאשר משנים את גודל החלון למסך רחב
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // פריטי התפריט
  const menuItems = [
    { title: 'דף הבית', href: '/' },
  ];

  // פריטי התפריט למנהל
  const adminMenuItems = [
    { title: 'ניהול', href: '/admin' },
  ];

  // הגדרות סגנון עבור כל העמודים
  const headerClass = isHomePage 
    ? `fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-slate-800 py-2 shadow-sm' : 'bg-slate-800/80 py-3'
      }`
    : `fixed top-0 left-0 w-full z-50 transition-all duration-300 py-2 bg-slate-800 shadow-sm`;

  const logoClass = `text-lg font-medium text-white`;

  const menuItemClass = (isActive) => 
    `px-3 py-1 text-sm ${isActive ? 'text-white font-medium' : 'text-slate-300 hover:text-white'}`;

  const handleNavigation = (href) => {
    router.push(href);
  };

  return (
    <header className={headerClass}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-10">
          {/* לוגו */}
          <div className={logoClass} onClick={() => handleNavigation('/')} style={{ cursor: 'pointer' }}>
            רוטשילד 79
          </div>
          
          {/* תפריט מסך רחב */}
          <nav className="hidden md:flex items-center">
            {menuItems.map((item, index) => (
              <div
                key={index}
                onClick={() => handleNavigation(item.href)}
                className={menuItemClass(router.pathname === item.href)}
                style={{ cursor: 'pointer' }}
              >
                {item.title === 'צ\'אט עם נציג' ? (
                  <span className="flex items-center">
                    <FaComments className="ml-1 text-xs" />
                    {item.title}
                  </span>
                ) : (
                  item.title
                )}
              </div>
            ))}
            
            {isAuthenticated && isAdminOrManager() && (
              adminMenuItems.map((item, index) => (
                <div
                  key={`admin-${index}`}
                  onClick={() => handleNavigation(item.href)}
                  className={menuItemClass(router.pathname === item.href)}
                  style={{ cursor: 'pointer' }}
                >
                  {item.title}
                </div>
              ))
            )}
            
            {isAuthenticated ? (
              <div className="relative mr-1">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center mr-1 text-xs px-2 py-1 rounded text-slate-300 hover:text-white hover:bg-slate-700/50"
                >
                  <HiOutlineUser className="ml-1 text-sm" />
                  <span className="hidden sm:inline">{user?.name || 'משתמש'}</span>
                </button>
                
                {userMenuOpen && (
                  <div className="absolute left-0 mt-1 w-40 bg-white rounded shadow-sm overflow-hidden z-10">
                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="block w-full text-right px-3 py-2 text-xs text-slate-600 hover:bg-slate-50"
                    >
                      התנתקות
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div
                onClick={() => handleNavigation('/login')}
                className="mr-3 px-3 py-1 text-xs rounded text-white bg-slate-700 hover:bg-slate-600"
                style={{ cursor: 'pointer' }}
              >
                כניסה
              </div>
            )}
          </nav>
          
          {/* כפתור תפריט מובייל */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden focus:outline-none text-white"
          >
            {mobileMenuOpen ? (
              <HiOutlineX className="w-5 h-5" />
            ) : (
              <HiOutlineMenu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
      
      {/* תפריט מובייל */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-700 shadow-sm absolute top-full left-0 right-0 z-50">
          <div className="container mx-auto px-4 py-2">
            <nav className="flex flex-col divide-y divide-slate-600">
              {menuItems.map((item, index) => (
                <div
                  key={index}
                  onClick={() => {
                    handleNavigation(item.href);
                    setMobileMenuOpen(false);
                  }}
                  className="py-2 text-sm text-white"
                  style={{ cursor: 'pointer' }}
                >
                  {item.title === 'צ\'אט עם נציג' ? (
                    <span className="flex items-center">
                      <FaComments className="ml-1 text-xs" />
                      {item.title}
                    </span>
                  ) : (
                    item.title
                  )}
                </div>
              ))}
              
              {isAuthenticated && isAdminOrManager() && (
                adminMenuItems.map((item, index) => (
                  <div
                    key={`admin-mobile-${index}`}
                    onClick={() => {
                      handleNavigation(item.href);
                      setMobileMenuOpen(false);
                    }}
                    className="py-2 text-sm text-white"
                    style={{ cursor: 'pointer' }}
                  >
                    {item.title}
                  </div>
                ))
              )}
              
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-right py-2 text-sm text-white"
                >
                  התנתקות
                </button>
              ) : (
                <div
                  onClick={() => {
                    handleNavigation('/login');
                    setMobileMenuOpen(false);
                  }}
                  className="py-2 text-sm text-white"
                  style={{ cursor: 'pointer' }}
                >
                  כניסה
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header; 