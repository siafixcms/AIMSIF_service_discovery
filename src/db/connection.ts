import mongoose from 'mongoose';

let connected = false;

export const connectToDatabase = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn('⚠️ MONGODB_URI is not set. Running in fallback mode.');
    return;
  }

  try {
    await mongoose.connect(uri);
    connected = true;
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
  }
};

export const isDatabaseConnected = () => connected;
