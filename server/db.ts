import pkg from "pg";
const { Pool } = pkg;
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";
import env from "./env";

console.log(env.DATABASE_URL);

if (!env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}

// Modify the URL to correctly handle password and IPv6.
const dbUrl = new URL(env.DATABASE_URL);
// Remove square brackets from IPv6 host if present
const host = dbUrl.hostname.replace(/^\[(.+)\]$/, "$1");
// Ensure the password is properly decoded
const password = decodeURIComponent(dbUrl.password);
// Rebuild the URL with the encoded password
const modifiedUrl = `${dbUrl.protocol}//${dbUrl.username}:${encodeURIComponent(
  password
)}@${host}:${dbUrl.port}${dbUrl.pathname}${dbUrl.search}`;

// Configure the pool with additional options for connection management
export const pool = new Pool({
  connectionString: modifiedUrl,
  max: 20, // maximum number of connections in the pool
  idleTimeoutMillis: 30000, // timeout for idle connections
  connectionTimeoutMillis: 5000, // timeout for connection attempts
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

export const db = drizzle(pool, { schema });
