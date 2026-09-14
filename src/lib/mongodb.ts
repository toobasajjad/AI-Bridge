import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

// eslint-disable-next-line no-var
declare global {
  var _mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = global._mongooseCache || { conn: null, promise: null };
global._mongooseCache = cache;

/**
 * Returns a live Mongoose connection, or null if no MONGODB_URI is
 * configured. Callers should fall back to the in-memory store (see
 * src/lib/store.ts) when this returns null, so the demo works instantly
 * without any database setup.
 */
export async function connectToDatabase(): Promise<typeof mongoose | null> {
  if (!MONGODB_URI) {
    console.log("[ai-bridge] No MONGODB_URI set — using in-memory store.");
    return null;
  }

  // TEMP DIAGNOSTIC — safe to leave in during setup, remove once connected.
  // Prints only the host portion, never the username/password.
  try {
    const hostPart = MONGODB_URI.split("@")[1]?.split("/")[0];
    console.log("[ai-bridge] MONGODB_URI host resolved to:", hostPart);
  } catch {
    console.log("[ai-bridge] Could not parse MONGODB_URI to show host.");
  }

  if (cache.conn) {
    return cache.conn;
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI, {
      dbName: "ai-bridge",
    });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
