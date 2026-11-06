import mongoose from 'mongoose';
import { ensureBaselineData } from '../services/bootstrapService.js';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/godavari_geoseva_2027';
  try {
    const conn = await mongoose.connect(uri, {
      autoIndex: true
    });
    console.log(`[MongoDB] Connected successfully to: ${conn.connection.host}/${conn.connection.name}`);
    
    // Auto-bootstrap demo accounts and seed facilities if database is empty
    ensureBaselineData().catch((err) => {
      console.warn(`[Bootstrap] Non-fatal background seed error: ${err.message}`);
    });

    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    process.exit(1);
  }
};
