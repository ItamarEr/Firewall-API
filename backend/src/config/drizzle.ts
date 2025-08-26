import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from './env';

const client = postgres(config.DATABASE_URI);
export const db = drizzle(client);