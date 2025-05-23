import pkg from 'pg';
const { Pool } = pkg;
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Modifica l'URL per gestire correttamente la password e l'IPv6
const dbUrl = new URL(process.env.DATABASE_URL);
// Rimuovi le parentesi quadre dall'host IPv6 se presenti
const host = dbUrl.hostname.replace(/^\[(.+)\]$/, '$1');
// Assicurati che la password sia correttamente codificata
const password = decodeURIComponent(dbUrl.password);
// Ricostruisci l'URL con la password codificata
const modifiedUrl = `${dbUrl.protocol}//${dbUrl.username}:${encodeURIComponent(password)}@${host}:${dbUrl.port}${dbUrl.pathname}${dbUrl.search}`;

// Configura il pool con opzioni aggiuntive per la gestione delle connessioni
export const pool = new Pool({ 
  connectionString: modifiedUrl,
  max: 20, // massimo numero di connessioni nel pool
  idleTimeoutMillis: 30000, // timeout per le connessioni inattive
  connectionTimeoutMillis: 5000, // timeout per tentare una connessione
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export const db = drizzle(pool, { schema });