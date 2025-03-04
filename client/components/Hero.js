import { motion } from 'framer-motion';
import Image from 'next/image';

const Hero = () => {
  return (
    <section className="relative h-[70vh] md:h-[85vh] flex items-center justify-center overflow-hidden">
      {/* תמונת רקע - שיניתי לתמונה בהירה יותר */}
      <div className="absolute inset-0 z-0 bg-gray-100">
        <Image 
          src="https://placehold.co/1920x1080/f8f8f8/e8e8e8?text=Simple+View" 
          alt="מלונית רוטשילד" 
          fill
          sizes="100vw"
          style={{ objectFit: 'cover', objectPosition: 'center', opacity: 0.7 }}
          quality={90}
          priority
        />
      </div>
      
      {/* תוכן מינימליסטי יותר */}
      <div className="container mx-auto px-4 relative z-10 text-center py-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl md:text-4xl font-medium text-gray-800 mb-4">
            מלונית רוטשילד
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-6 max-w-xl mx-auto">
            אירוח פשוט ונוח במרכז פתח תקווה
          </p>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <a 
              href="#booking-form" 
              className="bg-neutral-700 hover:bg-neutral-800 text-white px-6 py-3 text-sm rounded-sm transition-colors"
            >
              הזמינו עכשיו
            </a>
            <a 
              href="#rooms" 
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 text-sm rounded-sm transition-colors"
            >
              לחדרים שלנו
            </a>
          </motion.div>
        </motion.div>
      </div>
      
      {/* סימן גלילה מינימליסטי */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ 
            duration: 0.5, 
            delay: 0.8,
          }}
          className="flex flex-col items-center"
        >
          <svg 
            className="w-5 h-5 text-gray-500" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="1.5" 
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            ></path>
          </svg>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero; 