// config/db.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Establish MongoDB Connection
 * Handles connection errors, reconnection logic, and logs environment details.
 */
const connectDB = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://music_db:ROBZDFL32HQ0ncuF@musicdb.mhhzkyv.mongodb.net/musicdb?retryWrites=true&w=majority';

    if (!MONGODB_URI) {
      console.error('❌ Error: MONGODB_URI is missing in .env');
      process.exit(1);
    }

    // Connection options (stable and secure)
    const options = {
      autoIndex: process.env.NODE_ENV !== 'production', // Disable in prod for performance
      maxPoolSize: 10, // Limit concurrent connections
      serverSelectionTimeoutMS: 5000, // 5s timeout for DB selection
    };

    const conn = await mongoose.connect(MONGODB_URI, options);

    console.log(`
✅ MongoDB Connected Successfully
📊 Database: ${conn.connection.db.databaseName}
👥 Host: ${conn.connection.host}
🔗 Port: ${conn.connection.port}
🌿 Environment: ${process.env.NODE_ENV || 'development'}
`);

    // Optional: graceful connection event listeners
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB connection lost. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected successfully');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB runtime error:', err.message);
    });

    return conn;
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error.message);
    process.exit(1);
  }
};

/**
 * Check current MongoDB connection status
 */
const getConnectionStatus = () => {
  const states = ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'];
  const state = mongoose.connection.readyState;

  return {
    connected: state === 1,
    state: states[state] || 'Unknown',
    host: mongoose.connection.host || 'N/A',
    name: mongoose.connection.db?.databaseName || 'N/A',
    readyState: state,
  };
};

/**
 * Close MongoDB connection gracefully
 */
const closeConnection = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed gracefully');
  } else {
    console.log('ℹ️ MongoDB connection already closed');
  }
};

export { connectDB, getConnectionStatus, closeConnection };
