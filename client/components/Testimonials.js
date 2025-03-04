import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineStar } from 'react-icons/hi';

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  // נתוני חוות דעת לדוגמה
  const testimonials = [
    {
      name: 'יוסי לוי',
      image: 'https://placehold.co/80x80?text=YL',
      rating: 5,
      text: 'מלונית מדהימה! נהנינו מאוד מהשהייה. החדרים נקיים ומרווחים, הצוות אדיב ומקצועי. המיקום מעולה, במרחק הליכה ממסעדות וחנויות. בהחלט נחזור!',
      date: 'אוגוסט 2023'
    },
    {
      name: 'מיכל כהן',
      image: 'https://placehold.co/80x80?text=MC',
      rating: 4,
      text: 'התארחנו לסוף שבוע רומנטי והיה נפלא. החדר עוצב בטוב טעם והיה נעים מאוד. הצ\'ק-אין העצמאי היה נוח ופשוט. המיקום מצוין, קרוב להכל. רק חבל שאין חניה צמודה למלונית.',
      date: 'יולי 2023'
    },
    {
      name: 'אבי דוד',
      image: 'https://placehold.co/80x80?text=AD',
      rating: 5,
      text: 'מלונית מושלמת לאנשי עסקים. האינטרנט מהיר, החדר מאובזר היטב והמיקום מרכזי. השירות מעולה והצוות תמיד זמין. אני כבר מזמין את הביקור הבא שלי!',
      date: 'ספטמבר 2023'
    }
  ];
  
  // החלפה אוטומטית של חוות דעת כל 5 שניות
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [testimonials.length]);
  
  // יצירת כוכבי דירוג
  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <HiOutlineStar
        key={index}
        className={`text-xl ${index < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };
  
  // אנימציה לכרטיסי חוות דעת
  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0
    })
  };
  
  // המעבר בכיוון של החלפת חוות הדעת
  const [direction, setDirection] = useState(1);
  
  // פונקציה למעבר לחוות דעת הבאה
  const nextTestimonial = () => {
    setDirection(1);
    setActiveIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };
  
  // פונקציה למעבר לחוות דעת הקודמת
  const prevTestimonial = () => {
    setDirection(-1);
    setActiveIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };
  
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4">מה אומרים האורחים שלנו</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            האורחים שלנו חולקים את החוויות שלהם במלונית רוטשילד
          </p>
        </div>
        
        <div className="relative max-w-3xl mx-auto">
          {/* כפתורי ניווט */}
          <div className="absolute top-1/2 -translate-y-1/2 -right-12 md:-right-20 z-10">
            <button
              onClick={prevTestimonial}
              className="bg-white p-3 rounded-full shadow-md hover:bg-primary-50 transition-colors"
              aria-label="חוות דעת קודמת"
            >
              <svg
                className="w-5 h-5 transform rotate-180"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                ></path>
              </svg>
            </button>
          </div>
          
          <div className="absolute top-1/2 -translate-y-1/2 -left-12 md:-left-20 z-10">
            <button
              onClick={nextTestimonial}
              className="bg-white p-3 rounded-full shadow-md hover:bg-primary-50 transition-colors"
              aria-label="חוות דעת הבאה"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                ></path>
              </svg>
            </button>
          </div>
          
          {/* חלון התצוגה של חוות הדעת */}
          <div className="overflow-hidden">
            <motion.div
              key={activeIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4 }}
              className="bg-white p-8 rounded-lg shadow-custom"
            >
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full overflow-hidden mb-4">
                  <img
                    src={testimonials[activeIndex].image}
                    alt={testimonials[activeIndex].name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <h3 className="text-xl font-bold mb-2">{testimonials[activeIndex].name}</h3>
                <div className="flex mb-4">{renderStars(testimonials[activeIndex].rating)}</div>
                
                <p className="text-center text-gray-600 mb-4">
                  "{testimonials[activeIndex].text}"
                </p>
                
                <span className="text-gray-400 text-sm">{testimonials[activeIndex].date}</span>
              </div>
            </motion.div>
          </div>
          
          {/* אינדיקטורים */}
          <div className="flex justify-center mt-6 space-x-2 space-x-reverse">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full ${
                  activeIndex === index ? 'bg-accent' : 'bg-gray-300'
                }`}
                onClick={() => {
                  setDirection(index > activeIndex ? 1 : -1);
                  setActiveIndex(index);
                }}
                aria-label={`חוות דעת ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials; 