import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Provide a dummy connection string if the environment variable is missing,
// so that the serverless function can at least boot up and report a 500 error on query
// instead of crashing the entire Node process on startup.
const connectionString = import.meta.env?.DATABASE_URL || process.env.DATABASE_URL || "postgres://dummy:dummy@localhost/dummy";

const globalForDb = globalThis as unknown as {
  sql: any;
  db: any;
};

const sql = globalForDb.sql || neon(connectionString);
if (import.meta.env?.DEV) globalForDb.sql = sql;

export const db = globalForDb.db || drizzle(sql, { schema });
if (import.meta.env?.DEV) globalForDb.db = db;
