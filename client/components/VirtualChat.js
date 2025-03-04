import { useState, useEffect, useRef } from 'react';
import { FaComments, FaPaperPlane, FaTimes, FaWhatsapp, FaRegSmile } from 'react-icons/fa';

// תשובות מוגדרות מראש של הנציג הווירטואלי
const predefinedAnswers = {
  "שלום": "שלום! איך אני יכול לעזור לך היום?",
  "מחיר": "המחירים שלנו מתחילים ב-350₪ ללילה. המחיר תלוי בסוג החדר ובתאריכים. האם תרצה לבדוק זמינות בתאריכים ספציפיים?",
  "חניה": "יש לנו חניה פרטית לאורחי המלון. החניה ללא תשלום נוסף ומוגבלת למקום פנוי.",
  "צ'ק אין": "שעות הצ'ק-אין הן בין 14:00-22:00. אם תגיעו מאוחר יותר, אנא הודיעו לנו מראש בטלפון 050-607-0260. ניתן לתאם צ'ק-אין מוקדם יותר בכפוף לזמינות החדר.",
  "צ'ק אאוט": "שעות הצ'ק-אאוט הן עד 11:00 בבוקר. ניתן לבקש צ'ק-אאוט מאוחר בתוספת תשלום, בכפוף לזמינות.",
  "ארוחת בוקר": "אנו מגישים ארוחת בוקר ישראלית מלאה בין השעות 7:00-10:00. ארוחת הבוקר כלולה במחיר החדר.",
  "ביטול": "מדיניות הביטול שלנו מאפשרת ביטול ללא עלות עד 48 שעות לפני ההגעה. ביטול מאוחר יותר יחויב בעלות הלילה הראשון.",
  "אינטרנט": "יש לנו אינטרנט אלחוטי מהיר בכל שטחי המלון, ללא תשלום נוסף.",
  "חיות מחמד": "אנחנו מקבלים חיות מחמד קטנות בחלק מהחדרים, בתוספת תשלום של 50₪ ללילה. אנא ציינו זאת בעת ההזמנה.",
  "תינוקות": "אנו מספקים מיטות תינוק ללא תשלום נוסף, אך יש להזמין מראש.",
  "איפה": "המלון ממוקם ברחוב רוטשילד 79, פתח תקווה. אנחנו 5 דקות הליכה ממרכז העיר, 10 דקות נסיעה מתחנת הרכבת קריית אריה ו-20 דקות נסיעה ממרכז תל אביב.",
  "כתובת": "הכתובת המדויקת שלנו היא רחוב רוטשילד 79, פתח תקווה, מיקוד 4937079. ניתן להגיע בקלות באמצעות תחבורה ציבורית או ברכב פרטי. יש לנו חניה פרטית לאורחי המלון.",
  "טלפון": "תוכלו ליצור איתנו קשר במספר 050-607-0260.",
  "שעות קבלה": "שעות הקבלה שלנו הן 14:00-22:00. צוות הקבלה שלנו זמין לשירותכם בשעות אלו. לשירות מחוץ לשעות אלו, אנא צרו קשר מראש.",
  "מה יש בסביבה": "המלון ממוקם במרכז פתח תקווה, במרחק הליכה ממרכז העיר. בסביבה ניתן למצוא מסעדות, בתי קפה, חנויות, פארקים וכל השירותים הנדרשים. קניון אבנת נמצא במרחק 10 דקות הליכה."
};

// מילון מילות מפתח מורחב לזיהוי שאלות
const keywordMapping = {
  "שלום": ["שלום", "היי", "הי", "מה נשמע", "בוקר טוב", "ערב טוב", "לילה טוב"],
  "מחיר": ["מחיר", "עולה", "תעריף", "כמה עולה", "המחיר", "מחירון", "תעריפים", "עלות", "כמה זה עולה"],
  "חניה": ["חניה", "חנייה", "לחנות", "חניון", "איפה חונים", "יש חניה", "חניה בתשלום"],
  "צ'ק אין": ["צ'ק אין", "צ׳ק אין", "צ'ק-אין", "צ׳ק-אין", "להתארח", "מתי צ׳ק אין", "מתי צ׳ק-אין", "מתי להגיע", "הגעה", "שעות הגעה", "קבלת חדר", "קבלת מפתח", "איך נכנסים", "כניסה"],
  "צ'ק אאוט": ["צ'ק אאוט", "צ׳ק אאוט", "צ'ק-אאוט", "צ׳ק-אאוט", "לעזוב", "מתי צ׳ק אאוט", "עזיבה", "שעות עזיבה", "פינוי חדר", "יציאה"],
  "ארוחת בוקר": ["ארוחת בוקר", "ארוחת-בוקר", "יש ארוחת בוקר", "בוקר", "אוכל בבוקר", "כלול ארוחת בוקר"],
  "ביטול": ["ביטול", "לבטל", "ביטולים", "מדיניות ביטול", "אפשר לבטל", "לבטל הזמנה"],
  "אינטרנט": ["אינטרנט", "ווייפיי", "WIFI", "WiFi", "יש אינטרנט", "חיבור לרשת", "קליטה", "גלישה"],
  "חיות מחמד": ["חיות מחמד", "חיות", "כלב", "חתול", "חיות-מחמד", "להביא כלב", "להביא חתול", "חיות מותרות"],
  "תינוקות": ["תינוקות", "תינוק", "מיטה לתינוק", "מיטת תינוק", "תינוקות מותר", "עם ילדים", "ילדים קטנים"],
  "איפה": ["איפה", "מיקום", "איך מגיעים", "איפה אתם", "מיקום המלון", "איפה אתם נמצאים", "איך להגיע", "הכוונה"],
  "כתובת": ["כתובת", "רחוב", "מה הכתובת", "איפה אתם ממוקמים", "כתובת מדויקת"],
  "טלפון": ["טלפון", "מספר טלפון", "ליצור קשר", "יצירת קשר", "איך מתקשרים", "להתקשר"],
  "שעות קבלה": ["שעות קבלה", "שעות פתיחה", "מתי פתוח", "מתי אפשר להגיע", "שעות פעילות", "מתי יש קבלה", "קבלה"],
  "מה יש בסביבה": ["מה יש בסביבה", "אטרקציות", "אטרקציות באזור", "מה יש לעשות", "אטרקציות בסביבה", "מסעדות", "קניון"]
};

// בדיקה אם יש התאמה לשאלה
const findMatchingAnswer = (question) => {
  // המרה לאותיות קטנות והסרת תווים מיוחדים
  const normalizedQuestion = question.toLowerCase().trim();
  
  // בדיקה עבור כל קטגוריה של מילות מפתח
  for (const category in keywordMapping) {
    const keywords = keywordMapping[category];
    
    // בדיקה אם אחת ממילות המפתח מופיעה בשאלה
    for (const keyword of keywords) {
      if (normalizedQuestion.includes(keyword.toLowerCase())) {
        return predefinedAnswers[category];
      }
    }
  }
  
  // אם לא נמצאה התאמה, ננסה לבדוק לפי מילות המפתח המקוריות
  for (const key in predefinedAnswers) {
    if (normalizedQuestion.includes(key.toLowerCase())) {
      return predefinedAnswers[key];
    }
  }
  
  return null;
};

const VirtualChat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'שלום! אני הנציג הווירטואלי של מלון רוטשילד 79. כיצד אוכל לעזור לך היום?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [unansweredCount, setUnansweredCount] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showChatHint, setShowChatHint] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const phoneNumber = "0506070260";
  
  // טיפול בשליחת הודעה
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    // סימון שהיתה אינטראקציה עם המשתמש
    setHasInteracted(true);
    
    // הוספת ההודעה של המשתמש
    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    
    // עיכוב קצר לפני תשובת הבוט
    setTimeout(() => {
      // בדיקה אם יש תשובה מוגדרת
      const answer = findMatchingAnswer(userMessage.text);
      
      if (answer) {
        // אם יש תשובה מוגדרת
        const botResponse = {
          id: messages.length + 2,
          text: answer,
          sender: 'bot',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, botResponse]);
        // איפוס מונה השאלות ללא מענה
        setUnansweredCount(0);
      } else {
        // אם אין תשובה מוגדרת - הודעה שהאתר בבנייה והפניה לווטסאפ
        const noAnswerResponse = {
          id: messages.length + 2,
          text: 'האתר שלנו עדיין בבנייה ולכן אני לא יכול לענות על כל השאלות. נציג אנושי ישמח לעזור לך בוואטסאפ!',
          sender: 'bot',
          timestamp: new Date(),
          isWhatsappSuggestion: true
        };
        setMessages(prev => [...prev, noAnswerResponse]);
        // הגדלת מונה השאלות ללא מענה
        setUnansweredCount(prev => prev + 1);
      }
    }, 600);
  };
  
  // טיפול בלחיצה על Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };
  
  // פורמט תאריך להצגה בצ'אט
  const formatTime = (date) => {
    return date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
  };
  
  // מעבר לווטסאפ
  const redirectToWhatsapp = () => {
    // סימון שהיתה אינטראקציה עם המשתמש
    setHasInteracted(true);
    
    // איסוף השאלות של המשתמש
    const userQuestions = messages
      .filter(msg => msg.sender === 'user')
      .map(msg => msg.text)
      .join('\n');
    
    const whatsappText = `שלום, אני צריך עזרה בשאלות הבאות:\n\n${userQuestions}`;
    const encodedText = encodeURIComponent(whatsappText);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedText}`, '_blank');
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
    // סימון שהיתה אינטראקציה עם המשתמש
    setHasInteracted(true);
    setShowChatHint(false);
    
    // כאשר פותחים את הצ'אט, התמקדות על שדה הקלט
    if (!isChatOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  useEffect(() => {
    // גלילה למטה בכל פעם שמתווספת הודעה חדשה
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // הצגת התראת צ'אט אחרי 5 שניות מטעינת הדף
  useEffect(() => {
    if (!hasInteracted) {
      const timer = setTimeout(() => {
        setShowChatHint(true);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [hasInteracted]);

  return (
    <>
      {/* כפתור פתיחת הצ'אט */}
      <div 
        className={`fixed bottom-5 right-5 z-50 cursor-pointer ${isChatOpen ? 'hidden' : 'flex'} items-center justify-center bg-gradient-to-r from-slate-600 to-slate-800 hover:from-slate-700 hover:to-slate-900 text-white rounded-full w-16 h-16 shadow-lg transition-all duration-300 hover:scale-110`}
        onClick={toggleChat}
      >
        <FaComments className="text-2xl" />
        
        {/* התראת צ'אט שקופצת */}
        {showChatHint && (
          <div className="absolute top-0 right-0 transform -translate-y-full translate-x-1/4 bg-white p-3 rounded-lg shadow-xl animate-bounce-once mb-4 w-64">
            <div className="absolute bottom-0 right-8 transform translate-y-1/2 rotate-45 w-4 h-4 bg-white"></div>
            <p className="text-slate-800 text-sm font-medium">שלום! אפשר לעזור לך במשהו?</p>
            <p className="text-slate-600 text-xs mt-1">הנציג הווירטואלי שלנו זמין 24/7</p>
          </div>
        )}
      </div>

      {/* חלונית הצ'אט */}
      <div 
        className={`fixed bottom-5 right-5 w-80 md:w-96 bg-white rounded-xl shadow-2xl z-50 transition-all duration-300 transform ${isChatOpen ? 'scale-100 opacity-100' : 'scale-90 opacity-0 pointer-events-none'}`}
        style={{ maxHeight: '80vh' }}
      >
        {/* כותרת הצ'אט */}
        <div className="bg-gradient-to-r from-slate-600 to-slate-800 text-white p-4 rounded-t-xl flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-white/20 p-1.5 mr-2 rounded-full">
              <FaComments className="text-lg" />
            </div>
            <div>
              <h3 className="font-medium">צ'אט עם נציג וירטואלי</h3>
              <p className="text-xs text-slate-300">זמין 24/7 | מענה מיידי</p>
            </div>
          </div>
          <button
            className="bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors"
            onClick={toggleChat}
          >
            <FaTimes className="text-sm" />
          </button>
        </div>

        {/* אזור ההודעות */}
        <div 
          ref={messagesContainerRef}
          className="p-4 overflow-y-auto bg-slate-50"
          style={{ height: '350px' }}
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-2xl ${
                  message.sender === 'user'
                    ? 'bg-blue-500 text-white rounded-tr-none'
                    : 'bg-white text-slate-800 shadow-sm rounded-tl-none border border-slate-100'
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <span className={`text-xs block mt-1 text-left ${message.sender === 'user' ? 'text-blue-100' : 'text-slate-400'}`}>
                  {formatTime(message.timestamp)}
                </span>
                {message.isWhatsappSuggestion && (
                  <button
                    onClick={redirectToWhatsapp}
                    className="mt-3 w-full inline-flex items-center justify-center bg-green-500 hover:bg-green-600 text-white py-1.5 px-3 rounded-lg text-xs transition-colors"
                  >
                    <FaWhatsapp className="ml-1.5" /> המשך לשיחה בווטסאפ
                  </button>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* טופס שליחת הודעה */}
        <div className="border-t p-3 flex items-center bg-white rounded-b-xl">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="כתוב/י את השאלה שלך..."
            className="flex-1 border-0 focus:ring-0 focus:outline-none bg-transparent px-3 py-2"
          />
          <button
            className="text-slate-400 hover:text-slate-600 mx-1"
          >
            <FaRegSmile className="text-xl" />
          </button>
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className={`bg-gradient-to-r from-slate-600 to-slate-800 text-white p-2.5 rounded-full ${
              inputValue.trim() ? 'hover:from-slate-700 hover:to-slate-900' : 'opacity-50 cursor-not-allowed'
            }`}
          >
            <FaPaperPlane className="text-sm" />
          </button>
        </div>
      </div>
    </>
  );
};

export default VirtualChat;