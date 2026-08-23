import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const connectionString = import.meta.env?.DATABASE_URL || process.env.DATABASE_URL!;

const globalForDb = globalThis as unknown as {
  sql: any;
  db: any;
};

const sql = globalForDb.sql || neon(connectionString);
if (import.meta.env?.DEV) globalForDb.sql = sql;

export const db = globalForDb.db || drizzle(sql, { schema });
if (import.meta.env?.DEV) globalForDb.db = db;
