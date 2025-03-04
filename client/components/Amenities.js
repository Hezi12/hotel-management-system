import { motion } from 'framer-motion';
import { 
  HiOutlineWifi, 
  HiOutlineKey, 
  HiOutlineLocationMarker, 
  HiOutlineClock, 
  HiOutlineShieldCheck, 
  HiOutlineSparkles 
} from 'react-icons/hi';

const Amenities = () => {
  // רשימת המתקנים והשירותים שלנו - מצומצמת יותר
  const amenities = [
    {
      icon: HiOutlineWifi,
      title: 'אינטרנט אלחוטי',
      description: 'Wi-Fi בכל שטח המלונית'
    },
    {
      icon: HiOutlineKey,
      title: 'צ\'ק-אין עצמאי',
      description: 'כניסה עצמאית 24/7'
    },
    {
      icon: HiOutlineLocationMarker,
      title: 'מיקום מרכזי',
      description: 'במרכז פתח תקווה'
    },
    {
      icon: HiOutlineShieldCheck,
      title: 'אבטחה',
      description: 'מערכת אבטחה בכל המלונית'
    }
  ];
  
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-medium mb-2 title-underline mx-auto">שירותים ומתקנים</h2>
        </div>
        
        <div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {amenities.map((amenity, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="border border-gray-100 p-4"
            >
              <div className="text-gray-400 mb-3">
                <amenity.icon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-medium mb-1">{amenity.title}</h3>
              <p className="text-sm text-gray-600">{amenity.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Amenities; 