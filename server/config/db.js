const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('Connection string:', process.env.MONGO_URI ? 'URI is set' : 'URI is not set - will use local MongoDB');
    
    // תוספת אפשרויות חיבור שמשפרות את ההתחברות והאמינות
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // זמן קצר יותר לפסק זמן בחירת שרת
      socketTimeoutMS: 45000, // זמן ארוך יותר לפעולות שרת
    };
    
    // ניסיון להתחבר למונגו URI החיצוני, אם נכשל - ננסה חיבור מקומי
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI, options);
      console.log(`MongoDB Atlas Connected Successfully: ${conn.connection.host}`);
      return conn;
    } catch (atlasError) {
      console.error(`Error connecting to MongoDB Atlas: ${atlasError.message}`);
      console.log('Attempting to connect to local MongoDB...');
      
      // ניסיון לחיבור מקומי
      const conn = await mongoose.connect('mongodb://localhost:27017/hotel-management', options);
      console.log(`MongoDB Local Connected Successfully: ${conn.connection.host}`);
      return conn;
    }
  } catch (err) {
    console.error(`Fatal MongoDB Connection Error: ${err.message}`);
    console.error('Full error:', err);
    console.error('MongoDB connection failed. Please check your MongoDB instance and connection string.');
    process.exit(1);
  }
};

module.exports = connectDB; 