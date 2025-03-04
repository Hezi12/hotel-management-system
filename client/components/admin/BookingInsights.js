import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { format, eachDayOfInterval, isBefore, isAfter, parseISO } from 'date-fns';
import { he } from 'date-fns/locale';
import { 
  FaChartLine, FaChartArea, FaChartBar, 
  FaHotel, FaUsers, FaMoneyBillWave, FaPercentage,
  FaArrowDown, FaArrowUp, FaMinus, FaSyncAlt
} from 'react-icons/fa';

// פונקציית עזר לפורמט תאריכים בעברית
const formatDateHe = (date, formatStr = 'dd/MM') => {
  try {
    return format(new Date(date), formatStr, { locale: he });
  } catch (err) {
    console.error('שגיאה בפורמט תאריך:', err);
    return '';
  }
};

// פורמוט מספר כללי
const formatNumber = (num, digits = 0) => {
  if (num === undefined || num === null) return '-';
  
  return new Intl.NumberFormat('he-IL', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }).format(num);
};

// פורמוט מטבע
const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '-';
  
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// יצירת מערך ימים בין שני תאריכים
const createDaysArray = (start, end) => {
  try {
    return eachDayOfInterval({
      start: typeof start === 'string' ? parseISO(start) : new Date(start),
      end: typeof end === 'string' ? parseISO(end) : new Date(end)
    });
  } catch (err) {
    console.error('שגיאה ביצירת מערך ימים:', err);
    return [];
  }
};

// הכנת הנתונים לתצוגה בגרף
const prepareData = (days, occupancyData, revenueData) => {
  return days.map(day => {
    const formattedDate = format(day, 'yyyy-MM-dd');
    const dateLabel = formatDateHe(day);
    
    // מציאת נתוני תפוסה ליום
    const occupancy = occupancyData?.find(item => 
      item.date === formattedDate
    )?.occupancy || 0;
    
    // מציאת נתוני הכנסות ליום
    const revenue = revenueData?.find(item => 
      item.date === formattedDate
    )?.revenue || 0;
    
    return {
      date: formattedDate,
      dateLabel,
      occupancy,
      revenue
    };
  });
};

// סיכום הנתונים
const summarizeData = (chartData) => {
  if (!chartData.length) return { totalRevenue: 0, avgOccupancy: 0, totalBookings: 0, avgRate: 0 };
  
  // סיכום הכנסות
  const totalRevenue = chartData.reduce((sum, data) => sum + (data.revenue || 0), 0);
  
  // ממוצע תפוסה
  const avgOccupancy = chartData.reduce((sum, data) => sum + (data.occupancy || 0), 0) / chartData.length;
  
  // מספר הזמנות משוער (לצורך הדגמה)
  const totalBookings = Math.round(chartData.length * avgOccupancy / 100 * 1.5);
  
  // מחיר ממוצע לחדר
  const avgRate = totalRevenue / (totalBookings || 1);
  
  return {
    totalRevenue,
    avgOccupancy,
    totalBookings,
    avgRate
  };
};

// כרטיס תובנה עם נתונים ומגמה
const InsightCard = ({ title, value, valueFormat, trend, icon, trendValue, color }) => {
  let trendIcon = <FaMinus className="text-gray-400" />;
  let trendColor = 'text-gray-400';
  
  if (trend === 'up') {
    trendIcon = <FaArrowUp className="text-green-500" />;
    trendColor = 'text-green-500';
  } else if (trend === 'down') {
    trendIcon = <FaArrowDown className="text-red-500" />;
    trendColor = 'text-red-500';
  }
  
  return (
    <div className={`bg-white p-5 rounded-xl shadow-sm border-l-4 ${color}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium text-gray-700">{title}</h3>
          <p className="text-2xl font-bold mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color.replace('border-l-4 ', '')}bg-opacity-20`}>
          {icon}
        </div>
      </div>
      {trendValue && (
        <div className="flex items-center mt-3">
          {trendIcon}
          <span className={`${trendColor} text-sm ml-1`}>{trendValue}</span>
          <span className="text-gray-500 text-sm ml-1">לעומת התקופה הקודמת</span>
        </div>
      )}
    </div>
  );
};

// טולטיפ מותאם אישית
const CustomTooltip = ({ active, payload, label, valuePrefix, valueSuffix }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 shadow-md rounded-md border border-gray-200 text-right">
        <p className="text-sm font-bold text-gray-700 mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {valuePrefix}{formatNumber(entry.value)}{valueSuffix}
          </p>
        ))}
      </div>
    );
  }

  return null;
};

const BookingInsights = ({ occupancyData, revenueData, dateRange, isLoading }) => {
  const [activeTab, setActiveTab] = useState('combined');
  const [chartData, setChartData] = useState([]);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    avgOccupancy: 0,
    totalBookings: 0,
    avgRate: 0
  });

  useEffect(() => {
    if (dateRange?.start && dateRange?.end && occupancyData?.length && revenueData?.length) {
      const days = createDaysArray(dateRange.start, dateRange.end);
      const data = prepareData(days, occupancyData, revenueData);
      setChartData(data);
      setSummary(summarizeData(data));
    }
  }, [occupancyData, revenueData, dateRange]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin mr-2 text-blue-500">
          <FaSyncAlt size={24} />
        </div>
        <span className="text-gray-600">טוען נתונים...</span>
      </div>
    );
  }

  if (!chartData.length || !occupancyData?.length || !revenueData?.length) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500">אין נתונים זמינים לטווח התאריכים הנבחר.</p>
      </div>
    );
  }

  return (
    <div className="insights-container">
      {/* כרטיסי תובנה */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <InsightCard 
          title="סך הכנסות" 
          value={formatCurrency(summary.totalRevenue)}
          trend="up"
          trendValue="12%"
          icon={<FaMoneyBillWave className="text-green-600" size={24} />}
          color="border-l-4 border-green-500"
        />
        <InsightCard 
          title="ממוצע תפוסה" 
          value={`${formatNumber(summary.avgOccupancy)}%`}
          trend="up"
          trendValue="8%"
          icon={<FaPercentage className="text-blue-600" size={24} />}
          color="border-l-4 border-blue-500"
        />
        <InsightCard 
          title="סך הזמנות" 
          value={formatNumber(summary.totalBookings)}
          trend="up"
          trendValue="15%"
          icon={<FaUsers className="text-purple-600" size={24} />}
          color="border-l-4 border-purple-500"
        />
        <InsightCard 
          title="מחיר ממוצע לחדר" 
          value={formatCurrency(summary.avgRate)}
          trend="down"
          trendValue="3%"
          icon={<FaHotel className="text-orange-600" size={24} />}
          color="border-l-4 border-orange-500"
        />
      </div>
      
      {/* טאבים */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="flex border-b border-gray-200">
          <button
            className={`flex-1 py-3 px-4 font-medium text-sm focus:outline-none ${
              activeTab === 'combined' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('combined')}
          >
            <div className="flex items-center justify-center">
              <FaChartLine className="mr-2" />
              משולב
            </div>
          </button>
          <button
            className={`flex-1 py-3 px-4 font-medium text-sm focus:outline-none ${
              activeTab === 'occupancy' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('occupancy')}
          >
            <div className="flex items-center justify-center">
              <FaChartArea className="mr-2" />
              תפוסה
            </div>
          </button>
          <button
            className={`flex-1 py-3 px-4 font-medium text-sm focus:outline-none ${
              activeTab === 'revenue' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('revenue')}
          >
            <div className="flex items-center justify-center">
              <FaChartBar className="mr-2" />
              הכנסות
            </div>
          </button>
        </div>
        
        {/* תכולת הטאב */}
        <div className="p-4">
          <div className="h-[400px]">
            {activeTab === 'combined' && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="dateLabel" 
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <YAxis 
                    yAxisId="left"
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    axisLine={{ stroke: '#e5e7eb' }}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    axisLine={{ stroke: '#e5e7eb' }}
                    tickFormatter={(value) => `₪${formatNumber(value / 1000)}K`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="occupancy"
                    name="תפוסה"
                    stroke="#3b82f6"
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenue"
                    name="הכנסות"
                    stroke="#10b981"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
            
            {activeTab === 'occupancy' && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="dateLabel" 
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <YAxis 
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    axisLine={{ stroke: '#e5e7eb' }}
                    tickFormatter={(value) => `${value}%`}
                    domain={[0, 100]}
                  />
                  <Tooltip content={<CustomTooltip valueSuffix="%" />} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="occupancy"
                    name="תפוסה"
                    stroke="#3b82f6"
                    fill="#93c5fd"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
            
            {activeTab === 'revenue' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="dateLabel" 
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <YAxis 
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    axisLine={{ stroke: '#e5e7eb' }}
                    tickFormatter={(value) => `₪${formatNumber(value / 1000)}K`}
                  />
                  <Tooltip content={<CustomTooltip valuePrefix="₪" />} />
                  <Legend />
                  <Bar
                    dataKey="revenue"
                    name="הכנסות"
                    fill="#10b981"
                    barSize={20}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingInsights; 