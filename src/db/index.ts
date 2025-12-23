import { drizzle as drizzleLocal } from 'drizzle-orm/postgres-js';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;

// ensures correct driver is used based on the env
export const db = process.env.NODE_ENV === 'production' 
    ? drizzleNeon(neon(connectionString), { schema }) 
    : drizzleLocal(postgres(connectionString), { schema });