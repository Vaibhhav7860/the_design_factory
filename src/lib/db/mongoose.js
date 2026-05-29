import mongoose from "mongoose";

/**
 * Cached Mongoose connection.
 *
 * Cloud Run instances reuse the connection across requests; the global cache
 * survives module re-imports during development hot-reload.
 *
 * NOTE: We read MONGODB_URI inside the function (not at module-load time) so
 * that scripts which load .env files programmatically still work even if they
 * import this module before calling dotenv.config().
 */

const globalScope = globalThis;

if (!globalScope.__mongooseCache) {
  globalScope.__mongooseCache = { conn: null, promise: null };
}

const cache = globalScope.__mongooseCache;

export async function connectToDatabase() {
  if (cache.conn) return cache.conn;

  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is not configured. Add it to .env.local at the project root."
    );
  }

  if (!cache.promise) {
    mongoose.set("strictQuery", true);
    cache.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 8000,
      })
      .then((m) => m);
  }

  try {
    cache.conn = await cache.promise;
  } catch (err) {
    cache.promise = null;
    throw err;
  }

  return cache.conn;
}

export async function isDatabaseHealthy() {
  try {
    await connectToDatabase();
    const adminDb = mongoose.connection.db.admin();
    await adminDb.ping();
    return true;
  } catch {
    return false;
  }
}

export { mongoose };
