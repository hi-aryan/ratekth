import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;

// Railway uses standard PostgreSQL - same driver for dev and prod
// The DATABASE_URL env var determines which database you connect to
export const db = drizzle(postgres(connectionString), { schema });