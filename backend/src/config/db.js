const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.trim() === '') {
    console.log('ℹ️ No MONGODB_URI found in environment.');
    console.log('⚡ Server running in High-Reliability In-Memory Mode (All APIs active).');
    console.log('👉 To connect MongoDB Atlas, set MONGODB_URI in backend/.env');
    return false;
  }

  try {
    console.log('⏳ Connecting to MongoDB Atlas...');
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log('✅ MongoDB Atlas connected successfully.');
    return true;
  } catch (error) {
    console.warn('⚠️ MongoDB Atlas connection failed:', error.message);
    console.log('⚡ Falling back to In-Memory store to prevent server crash during demo.');
    isConnected = false;
    return false;
  }
};

const getIsConnected = () => isConnected;

module.exports = { connectDB, getIsConnected };
