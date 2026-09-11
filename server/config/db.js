// DB connection module
const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri.trim() === '') {
    console.log('[DB] No MONGODB_URI provided. Running in embedded JSON persistence mode.');
    return false;
  }
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 2500 });
    isConnected = true;
    console.log('[DB] MongoDB Connected successfully.');
    return true;
  } catch (err) {
    console.warn('[DB] MongoDB connection failed:', err.message);
    console.log('[DB] Seamlessly falling back to embedded JSON persistence mode.');
    isConnected = false;
    return false;
  }
};

module.exports = {
  connectDB,
  isMongoConnected: () => isConnected
};
