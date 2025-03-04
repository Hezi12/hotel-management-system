import { useEffect, useRef } from 'react';

// רכיב המציג את מיקום המלונית במפה
const MapLocation = ({ address = "רוטשילד 79, פתח תקווה" }) => {
  const mapContainerRef = useRef(null);
  
  useEffect(() => {
    // פונקציה להטמעת מפת גוגל
    const loadGoogleMap = () => {
      // במקום API אמיתי, כאן אנחנו מציגים תמונה סטטית לדוגמה
      // בפרויקט אמיתי, יש להשתמש ב-Google Maps API
      
      if (mapContainerRef.current) {
        const container = mapContainerRef.current;
        
        // הצגת תמונת מפה סטטית (מוחלפת בפרויקט אמיתי עם Google Maps API)
        container.innerHTML = `
          <div class="relative w-full h-full">
            <img 
              src="https://placehold.co/1200x600/e0e8f9/1e293b?text=מפת+${encodeURIComponent(address)}" 
              alt="מפת המיקום של ${address}" 
              class="w-full h-full object-cover rounded-lg"
            />
            <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div class="flex flex-col items-center">
                <div class="w-8 h-8 bg-accent rounded-full flex items-center justify-center shadow-lg mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div class="bg-white px-3 py-1 rounded-full shadow-lg text-sm font-medium">
                  ${address}
                </div>
              </div>
            </div>
          </div>
        `;
      }
    };
    
    loadGoogleMap();
    
    // בפרויקט אמיתי, מטמיעים את ה-Google Maps API כך:
    /*
    // טעינת Google Maps API
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap`;
    script.async = true;
    script.defer = true;
    
    // הגדרת פונקציית האתחול הגלובלית
    window.initMap = () => {
      const map = new google.maps.Map(mapContainerRef.current, {
        center: { lat: 32.0900, lng: 34.8800 }, // קואורדינטות של פתח תקווה
        zoom: 15,
      });
      
      // הוספת סמן למפה
      const marker = new google.maps.Marker({
        position: { lat: 32.0900, lng: 34.8800 },
        map: map,
        title: address,
      });
    };
    
    document.head.appendChild(script);
    
    return () => {
      // ניקוי
      document.head.removeChild(script);
      window.initMap = null;
    };
    */
  }, [address]);
  
  return (
    <div>
      <div 
        ref={mapContainerRef} 
        className="map-container rounded-lg overflow-hidden shadow-custom"
        aria-label={`מפת המיקום של ${address}`}
      >
        {/* המפה תוטמע כאן */}
        <div className="flex items-center justify-center h-full bg-primary-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        </div>
      </div>
      
      <div className="mt-6 bg-white p-4 rounded-lg shadow-custom">
        <h3 className="font-bold text-lg mb-2">הגעה למלונית רוטשילד</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-primary-700 mb-1">בתחבורה ציבורית</h4>
            <p className="text-gray-600 text-sm">
              קווי אוטובוס 51, 66, 75 מגיעים ישירות לתחנה סמוכה למלונית.
              מתחנת הרכבת פתח תקוה קריית אריה, ניתן לקחת קו 66 עד למלונית.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-primary-700 mb-1">ברכב פרטי</h4>
            <p className="text-gray-600 text-sm">
              חניה ציבורית זמינה ברחוב סמוך (חינם בשעות הערב והלילה).
              ניתן להזמין מקום חניה מראש בתשלום בחניון הסמוך.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapLocation; 