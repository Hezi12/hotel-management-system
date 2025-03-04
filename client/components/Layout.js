import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children, hideFooter = false }) => {
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const isHomePage = router.pathname === '/';

  // הוספת אירוע גלילה להצגת הניווט בסגנון שקוף
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    document.addEventListener('scroll', handleScroll);
    
    return () => {
      document.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  return (
    <div className={`flex flex-col ${isHomePage ? 'h-screen' : 'min-h-screen'}`}>
      <Header scrolled={scrolled} />
      
      <main className={isHomePage ? 'flex-grow overflow-hidden pt-20' : 'flex-grow pt-20'}>
        {children}
      </main>
      
      {!hideFooter && !isHomePage && <Footer />}
    </div>
  );
};

export default Layout; 