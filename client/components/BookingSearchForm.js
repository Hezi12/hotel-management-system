import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useRouter } from 'next/router';
import { registerLocale } from 'react-datepicker';
import he from 'date-fns/locale/he';
import { HiCalendar, HiUser, HiHome } from 'react-icons/hi';

// רושם את השפה העברית לדייטפיקר
registerLocale('he', he);

const BookingSearchForm = () => {
  const [checkInDate, setCheckInDate] = useState(new Date());
  const [checkOutDate, setCheckOutDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  });
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);
  const router = useRouter();

  // עדכון תאריך צ'ק-אין
  const handleCheckInChange = (date) => {
    setCheckInDate(date);
    
    // אם תאריך הצ'ק-אאוט מוקדם מתאריך הצ'ק-אין + יום אחד, עדכן אותו
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);
    
    if (checkOutDate < nextDay) {
      setCheckOutDate(nextDay);
    }
  };
  
  // פונקציה לפורמט תאריך לפורמט YYYY-MM-DD
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // שליחת הטופס
  const handleSubmit = (e) => {
    e.preventDefault();
    router.push({
      pathname: '/search-results',
      query: {
        checkIn: formatDate(checkInDate),
        checkOut: formatDate(checkOutDate),
        guests: guests,
        rooms: rooms
      }
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <div className="text-xs text-slate-500 mb-1">תאריך הגעה</div>
          <div className="relative">
            <DatePicker
              selected={checkInDate}
              onChange={handleCheckInChange}
              selectsStart
              startDate={checkInDate}
              endDate={checkOutDate}
              minDate={new Date()}
              locale="he"
              dateFormat="dd/MM/yyyy"
              className="w-full bg-slate-50 border-none rounded p-2 text-sm text-slate-800 focus:ring-1 focus:ring-slate-200 focus:outline-none"
            />
            <HiCalendar className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm" />
          </div>
        </div>

        <div>
          <div className="text-xs text-slate-500 mb-1">תאריך עזיבה</div>
          <div className="relative">
            <DatePicker
              selected={checkOutDate}
              onChange={date => setCheckOutDate(date)}
              selectsEnd
              startDate={checkInDate}
              endDate={checkOutDate}
              minDate={new Date(checkInDate.getTime() + 86400000)}
              locale="he"
              dateFormat="dd/MM/yyyy"
              className="w-full bg-slate-50 border-none rounded p-2 text-sm text-slate-800 focus:ring-1 focus:ring-slate-200 focus:outline-none"
            />
            <HiCalendar className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm" />
          </div>
        </div>

        <div>
          <div className="text-xs text-slate-500 mb-1">מספר חדרים</div>
          <div className="relative">
            <select
              value={rooms}
              onChange={e => setRooms(e.target.value)}
              className="w-full bg-slate-50 border-none rounded p-2 text-sm text-slate-800 appearance-none focus:ring-1 focus:ring-slate-200 focus:outline-none"
            >
              {[1, 2, 3, 4, 5].map(num => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'חדר' : 'חדרים'}
                </option>
              ))}
            </select>
            <HiHome className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm" />
          </div>
        </div>

        <div>
          <div className="text-xs text-slate-500 mb-1">מספר אורחים</div>
          <div className="relative">
            <select
              value={guests}
              onChange={e => setGuests(e.target.value)}
              className="w-full bg-slate-50 border-none rounded p-2 text-sm text-slate-800 appearance-none focus:ring-1 focus:ring-slate-200 focus:outline-none"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'אורח' : 'אורחים'}
                </option>
              ))}
            </select>
            <HiUser className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm" />
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="w-full mt-4 bg-slate-800 hover:bg-slate-700 text-white text-sm py-2.5 px-4 rounded transition-colors"
      >
        בדיקת זמינות
      </button>
    </form>
  );
};

export default BookingSearchForm; 