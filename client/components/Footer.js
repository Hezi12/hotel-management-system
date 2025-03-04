import Link from 'next/link';
import { HiOutlinePhone, HiOutlineMail, HiOutlineLocationMarker } from 'react-icons/hi';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-100 text-gray-600">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* פרטי יצירת קשר */}
          <div>
            <h3 className="text-base font-medium mb-3">צור קשר</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                <HiOutlinePhone className="w-4 h-4 ml-2 rtl:ml-0 rtl:mr-2 text-gray-400" />
                <a href="tel:0506070260" className="hover:text-neutral-700">0506070260</a>
              </li>
              <li className="flex items-center">
                <HiOutlineMail className="w-4 h-4 ml-2 rtl:ml-0 rtl:mr-2 text-gray-400" />
                <a href="mailto:diamshotels@gmail.com" className="hover:text-neutral-700">diamshotels@gmail.com</a>
              </li>
              <li className="flex items-center">
                <HiOutlineLocationMarker className="w-4 h-4 ml-2 rtl:ml-0 rtl:mr-2 text-gray-400" />
                <span>רחוב רוטשילד 79, פתח תקווה</span>
              </li>
            </ul>
          </div>
          
          {/* קישורים מהירים */}
          <div>
            <h3 className="text-base font-medium mb-3">קישורים</h3>
            <ul className="space-y-1 text-sm">
              <li>
                <Link href="/" className="hover:text-neutral-700">דף הבית</Link>
              </li>
              <li>
                <Link href="/rooms" className="hover:text-neutral-700">חדרים</Link>
              </li>
              <li>
                <Link href="/booking" className="hover:text-neutral-700">הזמנה</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-neutral-700">אודות</Link>
              </li>
            </ul>
          </div>
          
          {/* שעות פעילות */}
          <div>
            <h3 className="text-base font-medium mb-3">שעות פעילות</h3>
            <div className="text-sm">
              <p>צ'ק-אין: החל מהשעה 15:00</p>
              <p>צ'ק-אאוט: עד השעה 11:00</p>
              <p>צ'ק-אין עצמאי זמין 24/7</p>
            </div>
          </div>
        </div>
        
        {/* זכויות יוצרים */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-center">
          <p>© {currentYear} רוטשילד 79. כל הזכויות שמורות.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 