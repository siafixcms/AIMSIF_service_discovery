// src/db/mongo.ts

import mongoose from 'mongoose';

export const connectMongo = async (): Promise<boolean> => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('⚠️  MONGODB_URI not defined. MongoDB connection skipped.');
    return false;
  }

  try {
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');
    return true;
  } catch (err: any) {
    console.error(`❌ MongoDB connection failed: ${err.message}`);
    return false;
  }
};
