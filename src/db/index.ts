import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;

/**
 * postgres.js client configuration for serverless/Railway Scale-to-Zero
 * 
 * - idle_timeout: Close connections after 20 seconds of inactivity.
 *   This allows the Node.js event loop to empty and the process to exit,
 *   enabling Railway to detect idleness and scale to zero.
 * 
 * - max: Limit connection pool size. Railway's PostgreSQL doesn't need
 *   many concurrent connections for a typical app.
 */
const client = postgres(connectionString, {
  idle_timeout: 20,    // Close idle connections after 20 seconds
  max: 10,             // Maximum connections in the pool
});

export const db = drizzle(client, { schema });