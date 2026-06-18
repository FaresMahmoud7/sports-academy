import mongoose from 'mongoose';
import dns from 'dns';

// Set public DNS servers to resolve MongoDB SRV/TXT and A records
try {
  if (dns && typeof dns.setServers === 'function') {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
  }
} catch (err) {
  console.warn('DNS override failed:', err);
}

const getMongoUri = () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }
  return uri;
};

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 3000, // Fail fast in 3 seconds instead of 30s
    };

    cached.promise = mongoose.connect(getMongoUri(), opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
